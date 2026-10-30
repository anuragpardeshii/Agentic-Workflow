import { aiError } from "./errors.js";

const record = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const requiredFiles = [
  "package.json",
  "index.html",
  "src/main.jsx",
  "src/App.jsx",
  "src/index.css",
  "vite.config.js",
];

// Validate data only. Generated code and package scripts are never executed here.
export function parseProject(content, { complete = true, status = 502 } = {}) {
  const fail = (message) => {
    throw aiError(message, status);
  };
  let project;
  try {
    if (typeof content !== "string" || content.length > 500000)
      throw new Error();
    project = JSON.parse(
      content.match(/^\s*```(?:json)?\s*([\s\S]*?)```\s*$/)?.[1] || content,
    );
  } catch {
    fail("Project must contain valid JSON within the 500,000 character limit.");
  }
  if (
    !record(project) ||
    !record(project.files) ||
    !Object.keys(project.files).length ||
    Object.keys(project.files).length > 100
  )
    fail("The model returned an invalid project file map.");

  const files = Object.create(null);
  for (const [path, file] of Object.entries(project.files)) {
    const normalized = path.replace(/^\//, "");
    if (
      !/^[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*$/.test(normalized) ||
      normalized
        .split("/")
        .some((part) =>
          [".", "..", "__proto__", "node_modules", ".git"].includes(part),
        ) ||
      Object.hasOwn(files, normalized) ||
      !record(file) ||
      typeof file.code !== "string"
    )
      fail("The project contains an invalid or duplicate file path.");
    files[normalized] = { code: file.code };
  }
  if (complete) {
    if (
      typeof project.projectTitle !== "string" ||
      !project.projectTitle.trim() ||
      project.projectTitle.length > 200 ||
      typeof project.explanation !== "string" ||
      project.explanation.length > 10000
    )
      fail("The model returned invalid project details.");
    for (const path of requiredFiles)
      if (!files[path]?.code.trim())
        fail(
          `The generated project is missing ${path}. Please try a smaller request.`,
        );
    let pkg;
    try {
      pkg = JSON.parse(files["package.json"].code);
    } catch {
      fail("The generated package.json is invalid JSON.");
    }
    if (
      !record(pkg) ||
      !record(pkg.scripts) ||
      !record(pkg.dependencies) ||
      !record(pkg.devDependencies)
    )
      fail("The generated package.json is missing scripts or dependencies.");
    for (const script of ["dev", "build", "preview"])
      if (
        typeof pkg.scripts[script] !== "string" ||
        !pkg.scripts[script].trim()
      )
        fail(`The generated package.json is missing the ${script} script.`);
    for (const name of [
      "react",
      "react-dom",
      "vite",
      "@vitejs/plugin-react",
      "tailwindcss",
      "@tailwindcss/vite",
    ])
      if (
        typeof (pkg.dependencies[name] ?? pkg.devDependencies[name]) !==
          "string" ||
        !(pkg.dependencies[name] ?? pkg.devDependencies[name]).trim()
      )
        fail(`The generated package.json is missing ${name}.`);
  }
  return { ...project, files: { ...files } };
}
