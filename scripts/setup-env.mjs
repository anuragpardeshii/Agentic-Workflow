import { readFile, writeFile, lstat, chmod } from "node:fs/promises";
import { randomBytes } from "node:crypto";
const target = new URL("../.env", import.meta.url);
const example = await readFile(
  new URL("../.env.example", import.meta.url),
  "utf8",
);
try {
  await writeFile(
    target,
    example
      .replace(
        "replace-with-a-random-secret-of-at-least-32-characters",
        randomBytes(32).toString("hex"),
      )
      .replace(
        /^API_KEY_ENCRYPTION_KEY=.*$/m,
        `API_KEY_ENCRYPTION_KEY=${randomBytes(32).toString("base64")}`,
      ),
    { flag: "wx", mode: 0o600 },
  );
  console.log("Created .env with JWT and API-key encryption secrets.");
} catch (error) {
  if (error.code !== "EEXIST") throw error;
  if ((await lstat(target)).isSymbolicLink())
    throw new Error("Refusing to edit a symlinked .env");
  const current = await readFile(target, "utf8");
  const entries =
    current.match(/^\s*(?:export\s+)?API_KEY_ENCRYPTION_KEY\s*=.*$/gm) || [];
  if (entries.length > 1)
    throw new Error(
      "Duplicate API_KEY_ENCRYPTION_KEY entries; resolve them without replacing an existing key.",
    );
  if (
    !entries.length ||
    /^\s*(?:export\s+)?API_KEY_ENCRYPTION_KEY\s*=\s*(?:""|'')?\s*(?:#.*)?$/.test(
      entries[0],
    )
  ) {
    const line = `API_KEY_ENCRYPTION_KEY=${randomBytes(32).toString("base64")}`;
    await chmod(target, 0o600);
    await writeFile(
      target,
      entries.length
        ? current.replace(entries[0], line)
        : `${current.trimEnd()}\n${line}\n`,
      { mode: 0o600 },
    );
    console.log(
      "Added API-key encryption secret to existing .env; other settings preserved.",
    );
  } else console.log("Using existing .env and encryption secret.");
}
