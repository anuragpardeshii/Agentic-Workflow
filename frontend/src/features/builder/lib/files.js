// Source files are canonical. Preview-only adapters must never be saved.
export function normalizeFiles(files) {
  return Object.fromEntries(
    Object.entries(files).map(([path, file]) => [
      path.replace(/^\//, ""),
      { code: file.code },
    ]),
  );
}

export function validateFilePath(input, files, previousPath) {
  const path = input.trim();
  if (
    !/^[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*$/.test(path) ||
    path
      .split("/")
      .some((part) =>
        [".", "..", "__proto__", "node_modules", ".git"].includes(part),
      )
  ) {
    throw new Error(
      "Use a relative path such as src/components/Header.jsx. Spaces and parent paths are not supported.",
    );
  }
  const others = Object.keys(files).filter((name) => name !== previousPath);
  if (
    others.some(
      (name) =>
        name === path ||
        name.startsWith(`${path}/`) ||
        path.startsWith(`${name}/`),
    )
  ) {
    throw new Error("That path already exists or conflicts with a folder.");
  }
  if (!previousPath && others.length >= 100)
    throw new Error("Projects can contain up to 100 files.");
  return path;
}

export function fileTree(files) {
  const root = { children: new Map() };
  for (const path of Object.keys(files).sort()) {
    let node = root;
    const segments = path.split("/");
    segments.forEach((name, index) => {
      if (!node.children.has(name))
        node.children.set(name, {
          name,
          path: segments.slice(0, index + 1).join("/"),
          children: new Map(),
        });
      node = node.children.get(name);
    });
  }
  return root;
}

export const entryFiles = new Set([
  "package.json",
  "index.html",
  "src/main.jsx",
  "src/App.jsx",
  "src/index.css",
  "vite.config.js",
  "App.js",
  "src/App.js",
]);

export function createPreview(files) {
  const app = files["src/App.jsx"]
    ? "src/App.jsx"
    : files["src/App.js"]
      ? "src/App.js"
      : "App.js";
  let dependencies = {};
  let error = "";
  try {
    const manifest = JSON.parse(files["package.json"]?.code || "{}");
    if (!manifest || typeof manifest !== "object" || Array.isArray(manifest))
      throw new Error();
    dependencies = manifest.dependencies || {};
    if (
      typeof dependencies !== "object" ||
      Array.isArray(dependencies) ||
      Object.values(dependencies).some((version) => typeof version !== "string")
    )
      throw new Error();
  } catch {
    error =
      "Fix package.json to restart the preview. Your source edits are still available.";
  }
  return {
    app,
    dependencies,
    error,
    files: {
      ...Object.fromEntries(
        Object.entries(files)
          .filter(
            ([path]) =>
              !["package.json", "index.html", "public/index.html"].includes(
                path,
              ),
          )
          .map(([path, file]) => [`/${path}`, file.code]),
      ),
      "/public/index.html":
        '<!doctype html><html><head></head><body><div id="root"></div></body></html>',
      "/index.js": `import React from 'react'; import {createRoot} from 'react-dom/client'; import App from '/${app}'; ${files["src/index.css"] ? "import './src/index.css';" : ""} createRoot(document.getElementById('root')).render(<App/>);`,
    },
  };
}
