import { aiError } from "./errors.js";

// Endpoints are server-owned; user configuration can never redirect credentials.
export const PROVIDERS = {
  openai: {
    name: "OpenAI · GPT",
    defaultModel: "gpt-4.1",
    models: ["gpt-4.1"],
    keyEnv: "OPENAI_API_KEY",
    format: "responses",
    endpoint: "https://api.openai.com/v1/responses",
    checkUrl: "https://api.openai.com/v1/models",
    keyUrl: "https://platform.openai.com/api-keys",
    docsUrl: "https://developers.openai.com/api/docs",
    description: "Build with GPT using your OpenAI API account.",
  },
  anthropic: {
    name: "Anthropic · Claude",
    defaultModel: "claude-sonnet-5-5",
    models: ["claude-sonnet-5-5", "claude-opus-5-5", "claude-haiku-5-5"],
    keyEnv: "ANTHROPIC_API_KEY",
    format: "anthropic",
    endpoint: "https://api.anthropic.com/v1/messages",
    checkUrl: "https://api.anthropic.com/v1/models",
    keyUrl: "https://platform.claude.com/settings/keys",
    docsUrl: "https://platform.claude.com/docs",
    description: "Create and refine websites with Claude.",
  },
  xai: {
    name: "xAI · Grok",
    defaultModel: "grok-4.7",
    models: ["grok-4.7"],
    keyEnv: "XAI_API_KEY",
    format: "chat",
    endpoint: "https://api.x.ai/v1/chat/completions",
    checkUrl: "https://api.x.ai/v1/models",
    keyUrl: "https://console.x.ai",
    docsUrl: "https://docs.x.ai",
    description: "Connect your Grok API account from xAI.",
  },
  gemini: {
    name: "Google · Gemini",
    defaultModel: "gemini-3.8-flash",
    models: ["gemini-3.8-flash", "gemini-2.5-flash"],
    keyEnv: "GEMINI_API_KEY",
    format: "chat",
    endpoint:
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    checkUrl: "https://generativelanguage.googleapis.com/v1beta/openai/models",
    keyUrl: "https://aistudio.google.com/apikey",
    docsUrl: "https://ai.google.dev/gemini-api/docs",
    description: "Use Gemini with your Google AI Studio API key.",
  },
  openrouter: {
    name: "OpenRouter",
    defaultModel: "openrouter/free",
    models: ["openrouter/free"],
    keyEnv: "OPENROUTER_API_KEY",
    format: "chat",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    checkUrl: "https://openrouter.ai/api/v1/key",
    keyUrl: "https://openrouter.ai/settings/keys",
    docsUrl: "https://openrouter.ai/docs",
    description: "Access free and paid models through one connection.",
  },
  groq: {
    name: "Groq",
    defaultModel: "llama-3.3-70b-versatile",
    models: ["llama-3.3-70b-versatile"],
    keyEnv: "GROQ_API_KEY",
    format: "chat",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    checkUrl: "https://api.groq.com/openai/v1/models",
    keyUrl: "https://console.groq.com/keys",
    docsUrl: "https://console.groq.com/docs",
    description:
      "Fast hosted inference. Groq is a different provider from Grok.",
  },
};
export const hostedProvider = (id) =>
  Object.hasOwn(PROVIDERS, id) ? PROVIDERS[id] : null;
export function providerHeaders(provider, key) {
  return provider === "anthropic"
    ? { "x-api-key": key, "anthropic-version": "2023-06-01" }
    : { Authorization: `Bearer ${key}` };
}
export function supportedProviders() {
  return [
    ...Object.entries(PROVIDERS).map(
      ([id, { name, defaultModel, models, keyUrl, docsUrl, description }]) => ({
        id,
        name,
        kind: "hosted",
        enabled: true,
        defaultModel,
        models,
        keyUrl,
        docsUrl,
        description,
        note: "Usage is billed to your provider account. API access is separate from a chat subscription.",
      }),
    ),
    {
      id: "ollama",
      name: "Ollama",
      kind: "local",
      enabled: true,
      description: "Use the application's local AI server.",
      defaultModel: "qwen2.5-coder:7b",
      models: ["qwen2.5-coder:7b"],
      docsUrl: "https://docs.ollama.com",
      note: "No API key needed. The administrator manages this server's local model.",
    },
  ];
}
export function validateConnection(provider, model) {
  const entry = hostedProvider(provider);
  if (!entry) throw aiError("Choose a supported hosted provider.", 400);
  if (
    typeof model !== "string" ||
    model.length > 120 ||
    !/^[\w.-]+(?:[/:][\w.-]+)*$/.test(model)
  )
    throw aiError(
      "Enter a valid model ID from your provider's documentation.",
      400,
    );
  if (provider === "openrouter" && !/^[\w.-]+\/[\w.-]+(?::free)?$/.test(model))
    throw aiError(
      "Enter an OpenRouter vendor/model ID, optionally ending in :free.",
      400,
    );
  return entry;
}
