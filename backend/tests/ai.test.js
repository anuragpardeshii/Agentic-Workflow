import test from "node:test";
import assert from "node:assert/strict";
import { providerRequest, complete } from "../services/ai/providers.js";
import { parseProject } from "../services/ai/project.js";
import { generateProject } from "../services/ai/index.js";

const messages = [{ role: "user", content: "Build a bakery website" }];
const freeEnv = { AI_PROVIDER: "openrouter", OPENROUTER_API_KEY: "test-key" };
function project() {
  return {
    projectTitle: "Bakery",
    explanation: "A bakery website",
    files: Object.fromEntries(
      Object.entries({
        "package.json": JSON.stringify({
          scripts: {
            dev: "vite",
            build: "vite build",
            preview: "vite preview",
          },
          dependencies: { react: "^18.3.1", "react-dom": "^18.3.1" },
          devDependencies: {
            vite: "^6.1.0",
            "@vitejs/plugin-react": "^4.3.4",
            tailwindcss: "^4.0.0",
            "@tailwindcss/vite": "^4.0.0",
          },
        }),
        "index.html":
          '<div id="root"></div><script type="module" src="/src/main.jsx"></script>',
        "src/main.jsx": 'import App from "./App.jsx";',
        "src/App.jsx":
          "export default function App() { return <h1>Bakery</h1>; }",
        "src/index.css": '@import "tailwindcss";',
        "vite.config.js": "export default {};",
      }).map(([path, code]) => [path, { code }]),
    ),
  };
}
const output = () => JSON.stringify(project());
const reply = (content = output(), finish_reason = "stop") => ({
  choices: [{ message: { content }, finish_reason }],
});
const response = (body, status = 200) =>
  new Response(JSON.stringify(body), { status });

test("defaults to local inference with explicit context/output bounds and no key", () => {
  const request = providerRequest(messages, {});
  assert.equal(request.url, "http://localhost:11434/api/chat");
  assert.equal(request.init.headers.Authorization, undefined);
  const body = JSON.parse(request.init.body);
  assert.equal(body.model, "qwen2.5-coder:7b");
  assert.equal(body.options.num_ctx, 16384);
  assert.equal(body.options.num_predict, 8192);
});
test("free hosted requests enforce free model IDs and zero price caps", () => {
  for (const model of ["qwen/qwen3-coder:free", "openrouter/free"]) {
    const request = providerRequest(messages, { ...freeEnv, AI_MODEL: model });
    const body = JSON.parse(request.init.body);
    assert.equal(body.model, model);
    assert.deepEqual(body.provider.max_price, {
      prompt: 0,
      completion: 0,
      request: 0,
    });
    assert.equal(body.provider.require_parameters, true);
    assert.equal(body.models, undefined);
    assert.equal(body.plugins, undefined);
  }
});
test("paid IDs, chained variants, cloud Ollama and legacy Groq fail before network", async () => {
  let calls = 0;
  for (const env of [
    { ...freeEnv, AI_MODEL: "qwen/qwen3-coder" },
    { ...freeEnv, AI_MODEL: "qwen/qwen3-coder:free:online" },
    { ...freeEnv, AI_MODEL: "@preset/test" },
    { AI_MODEL: "qwen3-coder:480b-cloud" },
    { AI_PROVIDER: "groq", GROQ_API_KEY: "test" },
    { AI_PROVIDER: "unknown" },
    { AI_FREE_ONLY: "flase" },
  ])
    await assert.rejects(
      complete(messages, {
        env,
        fetchImpl: async () => {
          calls++;
        },
      }),
      { status: 503 },
    );
  assert.equal(calls, 0);
});
test("provider misconfiguration and oversized context fail before generation", () => {
  assert.throws(
    () => providerRequest(messages, { AI_PROVIDER: "openrouter" }),
    /key/,
  );
  assert.throws(
    () => providerRequest(messages, { AI_MAX_OUTPUT_TOKENS: "NaN" }),
    /integer/,
  );
  assert.throws(
    () => providerRequest(messages, { OLLAMA_CONTEXT_LENGTH: "8192" }),
    /must exceed/,
  );
  assert.throws(
    () => providerRequest([{ role: "user", content: "x".repeat(24001) }], {}),
    { status: 413 },
  );
});
test("errors preserve useful categories without leaking provider secrets or retrying", async () => {
  for (const [upstream, expected] of [
    [429, 429],
    [402, 503],
    [401, 503],
    [403, 503],
    [404, 503],
    [500, 503],
  ]) {
    let calls = 0;
    await assert.rejects(
      complete(messages, {
        env: freeEnv,
        fetchImpl: async () => {
          calls++;
          return response({ error: "secret-provider-details" }, upstream);
        },
      }),
      (error) =>
        error.status === expected &&
        !error.message.includes("secret-provider-details"),
    );
    assert.equal(calls, 1);
  }
});
test("truncated, empty, embedded-error and unavailable responses fail", async () => {
  for (const body of [
    reply(output(), "length"),
    reply(""),
    { error: { message: "secret" } },
  ])
    await assert.rejects(
      complete(messages, {
        env: freeEnv,
        fetchImpl: async () => response(body),
      }),
      { status: 502 },
    );
  await assert.rejects(
    complete(messages, {
      env: {},
      fetchImpl: async () =>
        response({ message: { content: output() }, done_reason: "length" }),
    }),
    { status: 502 },
  );
  await assert.rejects(
    complete(messages, {
      env: {},
      fetchImpl: async () => {
        throw new Error("network secret");
      },
    }),
    { status: 503 },
  );
});
test("complete project JSON is accepted and normalized", () => {
  const input = project();
  input.files["/src/App.jsx"] = input.files["src/App.jsx"];
  delete input.files["src/App.jsx"];
  assert.deepEqual(
    parseProject("```json\n" + JSON.stringify(input) + "\n```"),
    project(),
  );
});
test("incomplete projects, invalid manifests and path collisions are rejected", () => {
  const mutations = [
    (p) => {
      delete p.files["src/main.jsx"];
    },
    (p) => {
      p.files["package.json"].code = "{}";
    },
    (p) => {
      p.files["package.json"].code = "{";
    },
    (p) => {
      p.projectTitle = {};
    },
    (p) => {
      p.files = [];
    },
    (p) => {
      p.files["/src/App.jsx"] = { code: "x" };
    },
    (p) => {
      p.files["src/../secret"] = { code: "x" };
    },
    (p) => {
      p.files["src//App.jsx"] = { code: "x" };
    },
    (p) => {
      p.files["__proto__"] = { code: "x" };
    },
  ];
  // JSON.parse preserves __proto__ as a data key, unlike assignment on a plain object.
  assert.throws(() =>
    parseProject('{"files":{"__proto__":{"code":"x"}}}', { complete: false }),
  );
  for (const mutate of mutations.slice(0, -1)) {
    const p = project();
    mutate(p);
    assert.throws(() => parseProject(JSON.stringify(p)), { status: 502 });
  }
});
test("package scripts and required dependencies are validated", () => {
  for (const field of ["scripts", "dependencies", "devDependencies"]) {
    const p = project();
    const pkg = JSON.parse(p.files["package.json"].code);
    pkg[field] = {};
    p.files["package.json"].code = JSON.stringify(pkg);
    assert.throws(() => parseProject(JSON.stringify(p)), { status: 502 });
  }
});
test("orchestration validates previous content and output before returning a revision", async () => {
  let calls = 0;
  const options = {
    env: freeEnv,
    fetchImpl: async (_url, init) => {
      calls++;
      const request = JSON.parse(init.body);
      assert.equal(request.messages[1].role, "assistant");
      assert.equal(
        JSON.parse(request.messages[1].content).projectTitle,
        "Bakery",
      );
      return response(reply());
    },
  };
  assert.deepEqual(
    JSON.parse(await generateProject("Add a menu", output(), options)),
    project(),
  );
  await assert.rejects(generateProject("Add a menu", "invalid", options), {
    status: 400,
  });
  assert.equal(calls, 1);
  await assert.rejects(
    generateProject("Create site", undefined, {
      env: freeEnv,
      fetchImpl: async () =>
        response(reply('{"files":{"src/App.jsx":{"code":"x"}}}')),
    }),
    { status: 502 },
  );
});
