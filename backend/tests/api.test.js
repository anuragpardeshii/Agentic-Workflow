import test from "node:test";
import assert from "node:assert/strict";
import { app } from "../app.js";
import { parseProject } from "../services/ai/project.js";
process.env.JWT_SECRET = "test-secret-that-is-at-least-thirty-two-characters";
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.on("listening", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
test.after(() => server.close());
for (const path of [
  "/api/responses",
  "/api/responses/507f1f77bcf86cd799439011",
  "/api/projects/generate",
  "/api/projects/update",
  "/api/groq/generate",
]) {
  test(`rejects unauthenticated access to ${path}`, async () => {
    const response = await fetch(base + path, {
      method:
        path.includes("generate") || path.includes("update") ? "POST" : "GET",
    });
    assert.equal(response.status, 401);
  });
}
test("registration validates before database access", async () => {
  const response = await fetch(base + "/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: { $ne: null }, password: "123" }),
  });
  assert.equal(response.status, 400);
});
test("malformed JSON gets a JSON error", async () => {
  const response = await fetch(base + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(response.status, 400);
  assert.ok((await response.json()).error);
});
test("health reports unavailable database", async () => {
  assert.equal((await fetch(base + "/health")).status, 503);
});
test("validates model output and unsafe paths", () => {
  assert.deepEqual(
    parseProject('{"files":{"src/App.jsx":{"code":"hello"}}}', {
      complete: false,
    }).files["src/App.jsx"],
    { code: "hello" },
  );
  for (const content of [
    "invalid",
    "{}",
    '{"files":{"../secret":{"code":"x"}}}',
    '{"files":{"App.jsx":{"code":{}}}}',
  ])
    assert.throws(() => parseProject(content));
});

test("project lookup always scopes by authenticated owner", async () => {
  const { default: jwt } = await import("jsonwebtoken");
  const { default: Response } = await import("../models/Response.js");
  const owner = "507f1f77bcf86cd799439012";
  const projectId = "507f1f77bcf86cd799439011";
  const token = jwt.sign({ id: owner }, process.env.JWT_SECRET);
  const original = Response.findOne;
  let query;
  Response.findOne = async (filter) => {
    query = filter;
    return null;
  };
  try {
    const response = await fetch(base + "/api/responses/" + projectId, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(response.status, 404);
    assert.deepEqual(query, { _id: projectId, owner });
  } finally {
    Response.findOne = original;
  }
});

test("updates require an existing project before calling AI or the database", async () => {
  const { default: jwt } = await import("jsonwebtoken");
  const token = jwt.sign(
    { id: "507f1f77bcf86cd799439012" },
    process.env.JWT_SECRET,
  );
  const response = await fetch(base + "/api/projects/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt: "Add a pricing section" }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /existing project/);
});
