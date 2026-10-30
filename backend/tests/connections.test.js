import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { encryptKey, decryptKey, vaultReady } from "../services/ai/vault.js";
import {
  supportedProviders,
  validateConnection,
  PROVIDERS,
} from "../services/ai/catalog.js";
import {
  connectionMetadata,
  checkConnection,
  resolveAIEnvironment,
} from "../services/ai/connections.js";
import { providerRequest, complete } from "../services/ai/providers.js";
import AIConnection from "../models/AIConnection.js";
import User from "../models/User.js";
const env = { API_KEY_ENCRYPTION_KEY: randomBytes(32).toString("base64") };
const connection = {
  _id: "507f1f77bcf86cd799439011",
  owner: "507f1f77bcf86cd799439012",
  provider: "openai",
  model: "gpt-4.1",
  label: "My GPT",
  keyLastFour: "1234",
};
const key = "test-key-only-1234";
const messages = [
  { role: "system", content: "Return JSON" },
  { role: "assistant", content: "Previous project" },
  { role: "user", content: "Make a website" },
];

test("keys are encrypted with random nonces and bound to owner, connection and provider", () => {
  const encryptedKey = encryptKey(key, connection, env);
  assert.notEqual(encryptedKey.data, encryptKey(key, connection, env).data);
  assert.ok(!JSON.stringify(encryptedKey).includes(key));
  assert.equal(decryptKey({ ...connection, encryptedKey }, env), key);
  for (const changes of [
    { owner: "different" },
    { provider: "groq" },
    { _id: "different" },
    { encryptedKey: { ...encryptedKey, data: "tampered" } },
  ])
    assert.throws(
      () => decryptKey({ ...connection, encryptedKey, ...changes }, env),
      { status: 503 },
    );
  assert.throws(
    () =>
      decryptKey(
        { ...connection, encryptedKey },
        { API_KEY_ENCRYPTION_KEY: randomBytes(32).toString("base64") },
      ),
    { status: 503 },
  );
  assert.equal(vaultReady({}), false);
  assert.equal(vaultReady(env), true);
  assert.throws(() => encryptKey(key, connection, {}), { status: 503 });
});
test("metadata and Mongoose serialization never include key ciphertext or plaintext", () => {
  const doc = new AIConnection({
    ...connection,
    encryptedKey: encryptKey(key, connection, env),
    billingAcceptedAt: new Date(),
  });
  assert.equal(doc.toJSON().encryptedKey, undefined);
  assert.deepEqual(Object.keys(connectionMetadata(doc)), [
    "id",
    "label",
    "provider",
    "model",
    "keyHint",
    "updatedAt",
  ]);
  assert.equal(connectionMetadata(doc).keyHint, "••••1234");
});
test("catalog supports all six hosted providers and rejects arbitrary hosts or presets", () => {
  assert.equal(
    supportedProviders().filter((p) => p.kind === "hosted").length,
    6,
  );
  for (const [provider, definition] of Object.entries(PROVIDERS))
    assert.doesNotThrow(() =>
      validateConnection(provider, definition.defaultModel),
    );
  for (const [provider, model] of [
    ["custom", "model"],
    ["__proto__", "x"],
    ["openrouter", "@preset/private"],
    ["openai", "https://evil.example"],
    ["openrouter", "vendor/model:online"],
  ])
    assert.throws(() => validateConnection(provider, model), { status: 400 });
});
test("user-funded requests support paid APIs while server-only defaults remain free", () => {
  for (const [provider, definition] of Object.entries(PROVIDERS)) {
    const request = providerRequest(messages, {
      AI_PROVIDER: provider,
      AI_USER_FUNDED: "true",
      [definition.keyEnv]: key,
    });
    assert.equal(request.url, definition.endpoint);
    const body = JSON.parse(request.init.body);
    assert.equal(body.model, definition.defaultModel);
    if (provider === "anthropic") {
      assert.equal(request.init.headers["x-api-key"], key);
      assert.equal(request.init.headers["anthropic-version"], "2023-06-01");
      assert.equal(body.system, "Return JSON");
      assert.equal(body.messages[0].role, "user");
      assert.ok(body.messages.every((m) => m.role !== "system"));
    } else assert.equal(request.init.headers.Authorization, `Bearer ${key}`);
    if (provider === "openai") {
      assert.equal(body.store, false);
      assert.equal(body.max_output_tokens, 8192);
      assert.deepEqual(body.text.format, { type: "json_object" });
    }
    if (!["openrouter"].includes(provider))
      assert.throws(
        () =>
          providerRequest(messages, {
            AI_PROVIDER: provider,
            [definition.keyEnv]: key,
          }),
        { status: 503 },
      );
  }
  const paid = JSON.parse(
    providerRequest(messages, {
      AI_PROVIDER: "openrouter",
      AI_MODEL: "anthropic/claude-sonnet-5.5",
      AI_USER_FUNDED: "true",
      OPENROUTER_API_KEY: key,
    }).init.body,
  );
  assert.equal(paid.provider, undefined);
  const free = JSON.parse(
    providerRequest(messages, {
      AI_PROVIDER: "openrouter",
      AI_MODEL: "openrouter/free",
      AI_USER_FUNDED: "true",
      OPENROUTER_API_KEY: key,
    }).init.body,
  );
  assert.deepEqual(free.provider.max_price, {
    prompt: 0,
    completion: 0,
    request: 0,
  });
});
test("native OpenAI and Claude responses are extracted and truncations rejected", async () => {
  const bodies = {
    openai: {
      status: "completed",
      output: [
        { type: "reasoning", summary: [] },
        {
          type: "message",
          content: [{ type: "output_text", text: '{"ok":true}' }],
        },
      ],
    },
    anthropic: {
      stop_reason: "end_turn",
      content: [
        { type: "thinking", thinking: "private" },
        { type: "text", text: '{"ok":true}' },
      ],
    },
  };
  for (const [provider, body] of Object.entries(bodies)) {
    const options = {
      env: {
        AI_PROVIDER: provider,
        AI_USER_FUNDED: "true",
        [PROVIDERS[provider].keyEnv]: key,
      },
      fetchImpl: async () => new Response(JSON.stringify(body)),
    };
    assert.equal(await complete(messages, options), '{"ok":true}');
    await assert.rejects(
      complete(messages, {
        ...options,
        fetchImpl: async () =>
          new Response(
            JSON.stringify({
              ...body,
              status: "incomplete",
              stop_reason: "max_tokens",
            }),
          ),
      }),
      { status: 502 },
    );
  }
});
test("key checks use fixed provider endpoints and do not request inference", async () => {
  for (const [provider, definition] of Object.entries(PROVIDERS)) {
    const entry = { ...connection, provider, model: definition.defaultModel };
    entry.encryptedKey = encryptKey(key, entry, env);
    const result = await checkConnection(entry, {
      env,
      fetchImpl: async (url, init) => {
        assert.equal(url, definition.checkUrl);
        assert.equal(init.method, undefined);
        assert.equal(init.body, undefined);
        assert.equal(init.redirect, "error");
        return new Response("{}");
      },
    });
    assert.match(result.message, /accepted/);
    await assert.rejects(
      checkConnection(entry, {
        env,
        fetchImpl: async () =>
          new Response("sensitive upstream details", { status: 401 }),
      }),
      (error) => error.status === 422 && !error.message.includes("sensitive"),
    );
  }
});
test("selected keys are owner scoped, request-local, and never fall back", async () => {
  const original = AIConnection.findOne,
    userOriginal = User.findById;
  const base = {
    ...env,
    AI_PROVIDER: "ollama",
    OPENAI_API_KEY: "server-key",
    GROQ_API_KEY: "server-groq",
  };
  try {
    let filter;
    AIConnection.findOne = (query) => {
      filter = query;
      return {
        select: async () => ({
          ...connection,
          encryptedKey: encryptKey(key, connection, env),
        }),
      };
    };
    User.findById = () => ({
      select: async () => ({ activeAiConnection: connection._id }),
    });
    const resolved = await resolveAIEnvironment(
      connection.owner,
      undefined,
      base,
    );
    assert.deepEqual(filter, { _id: connection._id, owner: connection.owner });
    assert.equal(resolved.OPENAI_API_KEY, key);
    assert.equal(resolved.GROQ_API_KEY, "");
    assert.equal(resolved.AI_USER_FUNDED, "true");
    assert.equal(base.OPENAI_API_KEY, "server-key");
    assert.equal(base.AI_PROVIDER, "ollama");
    assert.deepEqual(
      await resolveAIEnvironment(connection.owner, null, base),
      base,
    );
    AIConnection.findOne = () => ({ select: async () => null });
    await assert.rejects(
      resolveAIEnvironment(connection.owner, connection._id, base),
      { status: 404 },
    );
  } finally {
    AIConnection.findOne = original;
    User.findById = userOriginal;
  }
});
