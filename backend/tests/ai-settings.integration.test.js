import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { randomBytes, randomUUID } from "node:crypto";
import { app } from "../app.js";
import User from "../models/User.js";
import AIConnection from "../models/AIConnection.js";
import SavedResponse from "../models/Response.js";
import { loadMigrations, migrate } from "../services/migrations.js";

test(
  "real database: BYOK CRUD, owner isolation, selected generation and key deletion",
  { skip: !process.env.MIGRATION_TEST_URI },
  async () => {
    process.env.JWT_SECRET = "integration-test-secret-with-32-characters";
    process.env.API_KEY_ENCRYPTION_KEY = randomBytes(32).toString("base64");
    const dbName = `connections_test_${randomUUID().replaceAll("-", "")}`;
    await mongoose.connect(process.env.MIGRATION_TEST_URI, {
      dbName,
      autoIndex: false,
    });
    let server;
    const nativeFetch = globalThis.fetch;
    try {
      await migrate(mongoose.connection.db, await loadMigrations(), () => {});
      const [alice, bob] = await User.create([
        { username: "Alice", email: "alice@test.example", password: "hash" },
        { username: "Bob", email: "bob@test.example", password: "hash" },
      ]);
      const token = (user) => jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      server = app.listen(0, "127.0.0.1");
      await new Promise((resolve) => server.on("listening", resolve));
      const base = `http://127.0.0.1:${server.address().port}`;
      const request = async (path, method = "GET", body, user = alice) => {
        const r = await nativeFetch(base + "/api" + path, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...(user ? { Authorization: `Bearer ${token(user)}` } : {}),
          },
          ...(body ? { body: JSON.stringify(body) } : {}),
        });
        return {
          status: r.status,
          data: await r.json(),
          cache: r.headers.get("cache-control"),
        };
      };
      assert.equal(
        (await request("/ai-settings", "GET", undefined, null)).status,
        401,
      );
      const payload = {
        provider: "openai",
        label: "My GPT",
        model: "gpt-4.1",
        apiKey: "test-key-alice-1234",
        billingAccepted: true,
      };
      assert.equal(
        (
          await request("/ai-settings/connections", "POST", {
            ...payload,
            billingAccepted: false,
          })
        ).status,
        400,
      );
      const created = await request(
        "/ai-settings/connections",
        "POST",
        payload,
      );
      assert.equal(created.status, 201);
      const id = created.data.connection.id;
      assert.ok(!JSON.stringify(created).includes(payload.apiKey));
      const stored = await mongoose.connection.db
        .collection("aiconnections")
        .findOne({ _id: new mongoose.Types.ObjectId(id) });
      assert.ok(stored.encryptedKey.data);
      assert.ok(!JSON.stringify(stored).includes(payload.apiKey));
      assert.equal(
        (await request("/ai-settings/connections", "POST", payload)).status,
        409,
      );
      const listing = await request("/ai-settings");
      assert.equal(listing.cache, "no-store");
      assert.equal(listing.data.connections.length, 1);
      assert.equal(listing.data.providers.length, 7);
      assert.equal(
        (await request("/ai-settings", "GET", undefined, bob)).data.connections
          .length,
        0,
      );
      for (const [path, method, body] of [
        [
          `/ai-settings/connections/${id}`,
          "PUT",
          { label: "Stolen", model: "gpt-4.1", billingAccepted: true },
        ],
        [`/ai-settings/connections/${id}`, "DELETE"],
        [`/ai-settings/connections/${id}/check`, "POST"],
        ["/ai-settings/default", "PUT", { connectionId: id }],
        [
          "/projects/generate",
          "POST",
          { prompt: "Build a website", connectionId: id },
        ],
      ])
        assert.equal((await request(path, method, body, bob)).status, 404);
      assert.equal(
        (await request("/ai-settings/default", "PUT", { connectionId: id }))
          .status,
        200,
      );
      assert.equal((await request("/ai-settings")).data.activeConnectionId, id);
      const files = Object.fromEntries(
        Object.entries({
          "package.json": JSON.stringify({
            scripts: {
              dev: "vite",
              build: "vite build",
              preview: "vite preview",
            },
            dependencies: { react: "^18.3.1", "react-dom": "^18.3.1" },
            devDependencies: {
              vite: "^6.0.0",
              "@vitejs/plugin-react": "^4.0.0",
              tailwindcss: "^4.0.0",
              "@tailwindcss/vite": "^4.0.0",
            },
          }),
          "index.html": '<div id="root"></div>',
          "src/main.jsx": 'import App from "./App.jsx";',
          "src/App.jsx": "export default function App(){return <h1>Hello</h1>}",
          "src/index.css": '@import "tailwindcss";',
          "vite.config.js": "export default {}",
        }).map(([path, code]) => [path, { code }]),
      );
      let calls = 0;
      globalThis.fetch = async (url, init) => {
        calls++;
        assert.equal(url, "https://api.openai.com/v1/responses");
        assert.equal(init.headers.Authorization, `Bearer ${payload.apiKey}`);
        assert.equal(JSON.parse(init.body).model, "gpt-4.1");
        return new Response(
          JSON.stringify({
            status: "completed",
            output: [
              {
                type: "message",
                content: [
                  {
                    type: "output_text",
                    text: JSON.stringify({
                      projectTitle: "Hello",
                      explanation: "A website",
                      files,
                    }),
                  },
                ],
              },
            ],
          }),
        );
      };
      assert.equal(
        (
          await request("/projects/generate", "POST", {
            prompt: "Build a website",
          })
        ).status,
        201,
      );
      assert.equal(
        (
          await request("/projects/update", "POST", {
            prompt: "Change the heading",
            previousContent: JSON.stringify({ files }),
            connectionId: id,
          })
        ).status,
        201,
      );
      assert.equal(calls, 2);
      assert.equal(await SavedResponse.countDocuments({ owner: alice.id }), 2);
      assert.equal(
        (
          await request(`/ai-settings/connections/${id}`, "PUT", {
            label: "Renamed",
            model: "gpt-4.1",
            billingAccepted: true,
          })
        ).status,
        200,
      );
      globalThis.fetch = async (url, init) => {
        assert.equal(url, "https://api.openai.com/v1/models");
        assert.equal(init.headers.Authorization, `Bearer ${payload.apiKey}`);
        return new Response("{}");
      };
      assert.equal(
        (await request(`/ai-settings/connections/${id}/check`, "POST")).status,
        200,
      );
      payload.apiKey = "replacement-test-key-5678";
      assert.equal(
        (await request(`/ai-settings/connections/${id}`, "PUT", payload))
          .status,
        200,
      );
      assert.equal(
        (await request(`/ai-settings/connections/${id}/check`, "POST")).status,
        200,
      );
      globalThis.fetch = async () => {
        calls++;
        return new Response("private-provider-details", { status: 401 });
      };
      const failure = await request("/projects/generate", "POST", {
        prompt: "Build another website",
        connectionId: id,
      });
      assert.equal(failure.status, 503);
      assert.ok(!JSON.stringify(failure).includes("private-provider-details"));
      assert.equal(calls, 3);
      assert.equal(await SavedResponse.countDocuments({ owner: alice.id }), 2);
      assert.equal(
        (await request(`/ai-settings/connections/${id}`, "DELETE")).status,
        200,
      );
      assert.equal(
        (await request("/ai-settings")).data.activeConnectionId,
        null,
      );
      assert.equal(await AIConnection.countDocuments({ owner: alice.id }), 0);
      assert.equal(
        (
          await request("/projects/generate", "POST", {
            prompt: "Build another website",
            connectionId: id,
          })
        ).status,
        404,
      );
    } finally {
      globalThis.fetch = nativeFetch;
      if (server) await new Promise((resolve) => server.close(resolve));
      await mongoose.connection.db.dropDatabase();
      await mongoose.disconnect();
    }
  },
);
