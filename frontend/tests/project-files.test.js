import test from "node:test";
import assert from "node:assert/strict";
import {
  createPreview,
  fileTree,
  normalizeFiles,
  validateFilePath,
} from "../src/features/builder/lib/files.js";

const fixture = () =>
  normalizeFiles({
    "/package.json": { code: '{"dependencies":{"react":"18.3.1"}}' },
    "/src/App.jsx": { code: "export default function App() {}" },
    "index.html": { code: "original HTML" },
    "index.js": { code: "original entry" },
  });

test("preview adaptation cannot overwrite source HTML, entry or manifest", () => {
  const files = fixture();
  const before = structuredClone(files);
  const preview = createPreview(files);
  assert.deepEqual(files, before);
  assert.notEqual(
    preview.files["/public/index.html"],
    files["index.html"].code,
  );
  assert.notEqual(preview.files["/index.js"], files["index.js"].code);
  assert.equal(preview.files["/package.json"], undefined);
  assert.equal(preview.files["/src/App.jsx"], files["src/App.jsx"].code);
});

test("file operations reject traversal, duplicates and file/folder collisions", () => {
  const files = fixture();
  for (const path of [
    "../a.js",
    "src/../a.js",
    "/absolute.js",
    "node_modules/a.js",
    ".git/config",
    "__proto__/a.js",
    "src/App.jsx",
    "src",
    "src/App.jsx/nested.js",
    "src\\bad.js",
  ])
    assert.throws(() => validateFilePath(path, files));
  assert.equal(
    validateFilePath("src/components/Header.jsx", files),
    "src/components/Header.jsx",
  );
  assert.equal(
    validateFilePath("src/App.jsx", files, "src/App.jsx"),
    "src/App.jsx",
  );
  const full = Object.fromEntries(
    Array.from({ length: 100 }, (_, i) => [`file${i}.js`, { code: "" }]),
  );
  assert.throws(() => validateFilePath("new.js", full));
  assert.equal(validateFilePath("new.js", full, "file0.js"), "new.js");
});

test("invalid manifests stay editable and produce a preview error", () => {
  for (const code of [
    "{",
    "null",
    "[]",
    '{"dependencies":["react"]}',
    '{"dependencies":{"react":true}}',
  ]) {
    const files = { ...fixture(), "package.json": { code } };
    assert.ok(createPreview(files).error);
    assert.equal(files["package.json"].code, code);
  }
  assert.equal(createPreview(fixture()).error, "");
});

test("folder tree retains nested source paths", () => {
  const files = { ...fixture(), "src/components/Header.jsx": { code: "" } };
  const root = fileTree(files);
  assert.equal(
    root.children
      .get("src")
      .children.get("components")
      .children.get("Header.jsx").path,
    "src/components/Header.jsx",
  );
});
