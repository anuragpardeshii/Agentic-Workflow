import { aiError } from "./errors.js";
import { hostedProvider, providerHeaders } from "./catalog.js";

function integer(value, fallback, min, max, name) {
  const number = Number(value ?? fallback);
  if (!Number.isInteger(number) || number < min || number > max)
    throw aiError(`${name} must be an integer between ${min} and ${max}.`, 503);
  return number;
}

export function providerRequest(messages, env = process.env) {
  const provider = env.AI_PROVIDER || "ollama";
  const definition = hostedProvider(provider);
  if (provider !== "ollama" && !definition)
    throw aiError("Unsupported AI provider.", 503);
  if (
    env.AI_FREE_ONLY !== undefined &&
    !["true", "false"].includes(env.AI_FREE_ONLY)
  )
    throw aiError("AI_FREE_ONLY must be true or false.", 503);
  const userFunded = env.AI_USER_FUNDED === "true";
  const freeOnly = !userFunded && env.AI_FREE_ONLY !== "false";
  if (provider !== "ollama" && provider !== "openrouter" && freeOnly)
    throw aiError(
      "Provider account billing cannot be verified. Use a personal API connection, Ollama or OpenRouter free models.",
      503,
    );
  const model = env.AI_MODEL || definition?.defaultModel || "qwen2.5-coder:7b";
  if (
    provider === "openrouter" &&
    !userFunded &&
    model !== "openrouter/free" &&
    !/^[\w.-]+\/[\w.-]+:free$/.test(model)
  )
    throw aiError(
      "OpenRouter accepts only :free models or openrouter/free. Paid models are disabled.",
      503,
    );
  if (provider === "ollama" && (model.includes("cloud") || /[\/]/.test(model)))
    throw aiError(
      "Use a local Ollama library model tag; cloud and remote models are disabled.",
      503,
    );
  const maxTokens = integer(
    env.AI_MAX_OUTPUT_TOKENS,
    8192,
    1024,
    32768,
    "AI_MAX_OUTPUT_TOKENS",
  );
  const inputLimit = integer(
    env.AI_MAX_INPUT_CHARS,
    24000,
    1000,
    500000,
    "AI_MAX_INPUT_CHARS",
  );
  if (
    messages.reduce((size, message) => size + message.content.length, 0) >
    inputLimit
  )
    throw aiError(
      "This project exceeds the configured AI input limit. Reduce its size or configure a model with a larger context.",
      413,
    );
  const key = definition ? env[definition.keyEnv] : null;
  if (provider !== "ollama" && !key)
    throw aiError(`${provider} API key is not configured.`, 503);
  let body = { model, messages, stream: false };
  if (provider === "ollama") {
    body.format = "json";
    body.options = {
      temperature: 0.3,
      num_predict: maxTokens,
      num_ctx: integer(
        env.OLLAMA_CONTEXT_LENGTH,
        16384,
        2048,
        131072,
        "OLLAMA_CONTEXT_LENGTH",
      ),
    };
    if (maxTokens >= body.options.num_ctx)
      throw aiError(
        "OLLAMA_CONTEXT_LENGTH must exceed AI_MAX_OUTPUT_TOKENS.",
        503,
      );
  } else if (definition.format === "responses") {
    body = {
      model,
      input: messages,
      max_output_tokens: maxTokens,
      store: false,
      text: { format: { type: "json_object" } },
    };
  } else if (definition.format === "anthropic") {
    body = {
      model,
      max_tokens: maxTokens,
      system: messages
        .filter((m) => m.role === "system")
        .map((m) => m.content)
        .join("\n"),
      messages: messages.filter((m) => m.role !== "system"),
    };
    if (body.messages[0]?.role === "assistant")
      body.messages.unshift({
        role: "user",
        content:
          "Here is the existing website project for the next refinement.",
      });
  } else {
    body.max_tokens = maxTokens;
    body.response_format = { type: "json_object" };
    if (
      provider === "openrouter" &&
      (!userFunded || model === "openrouter/free" || model.endsWith(":free"))
    ) {
      body.provider = {
        max_price: { prompt: 0, completion: 0, request: 0 },
        require_parameters: true,
      };
      // Free endpoints retain zero price caps, including for personal connections.
    }
  }
  return {
    provider,
    url:
      provider === "ollama"
        ? `${(env.OLLAMA_URL || "http://localhost:11434").replace(/\/$/, "")}/api/chat`
        : definition.endpoint,
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(provider !== "ollama" ? providerHeaders(provider, key) : {}),
      },
      body: JSON.stringify(body),
    },
  };
}

export async function complete(
  messages,
  { env = process.env, fetchImpl = fetch } = {},
) {
  const request = providerRequest(messages, env);
  try {
    const response = await fetchImpl(request.url, {
      ...request.init,
      redirect: "error",
      signal: AbortSignal.timeout(180000),
    });
    if (response.status === 429)
      throw aiError(
        "AI rate limit reached. Check your selected provider quota or try again later.",
        429,
      );
    if (response.status === 402)
      throw aiError(
        "The provider rejected the request due to account balance or billing limits. No fallback was attempted.",
        503,
      );
    if ([401, 403].includes(response.status))
      throw aiError(
        "AI provider access denied. Check the selected API key and account permissions.",
        503,
      );
    if (response.status === 404)
      throw aiError(
        "AI model unavailable. Check the selected model ID and account access, or pull the local Ollama model.",
        503,
      );
    if (!response.ok)
      throw aiError(
        "The AI provider could not serve this request. Check model compatibility and try again later.",
        503,
      );
    const data = await response.json();
    const choice = data.choices?.[0];
    if (data.error)
      throw aiError(
        "The AI provider returned an error. No project was saved.",
        502,
      );
    const reason =
      request.provider === "ollama"
        ? data.done_reason
        : request.provider === "anthropic"
          ? data.stop_reason
          : choice?.finish_reason;
    if (
      reason === "length" ||
      reason === "max_tokens" ||
      data.status === "incomplete"
    )
      throw aiError(
        "The model reached its output limit. Ask for a smaller website or increase AI_MAX_OUTPUT_TOKENS within the model limit.",
      );
    if (request.provider === "openai" && data.status !== "completed")
      throw aiError(
        "The provider did not finish generation. No project was saved.",
      );
    const content =
      request.provider === "ollama"
        ? data.message?.content
        : request.provider === "anthropic"
          ? data.content
              ?.filter((item) => item.type === "text")
              .map((item) => item.text)
              .join("")
          : request.provider === "openai"
            ? data.output
                ?.filter((item) => item.type === "message")
                .flatMap((item) => item.content || [])
                .filter((item) => item.type === "output_text")
                .map((item) => item.text)
                .join("")
            : choice?.message?.content;
    if (typeof content !== "string" || !content.trim())
      throw aiError("The AI provider returned no project content.");
    return content;
  } catch (error) {
    if (error.status) throw error;
    throw aiError(
      "AI service unavailable or timed out. Check the provider connection and model.",
      503,
    );
  }
}
