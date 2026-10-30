import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { aiError } from "./errors.js";

function masterKey(env) {
  const value = env.API_KEY_ENCRYPTION_KEY;
  if (
    typeof value !== "string" ||
    !/^[A-Za-z0-9+/]{43}=$/.test(value) ||
    Buffer.from(value, "base64").length !== 32
  )
    throw aiError(
      "API key storage is not configured. Ask the administrator to run make setup and restart the API.",
      503,
    );
  return Buffer.from(value, "base64");
}
export function vaultReady(env = process.env) {
  try {
    masterKey(env);
    return true;
  } catch {
    return false;
  }
}
const context = (connection) =>
  Buffer.from(
    `${connection.owner}:${connection._id}:${connection.provider}`,
    "utf8",
  );
export function encryptKey(apiKey, connection, env = process.env) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", masterKey(env), iv);
  cipher.setAAD(context(connection));
  const ciphertext = Buffer.concat([
    cipher.update(apiKey, "utf8"),
    cipher.final(),
  ]);
  return {
    version: 1,
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    data: ciphertext.toString("base64"),
  };
}
export function decryptKey(connection, env = process.env) {
  const key = masterKey(env);
  try {
    const encrypted = connection.encryptedKey;
    if (encrypted.version !== 1) throw new Error();
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(encrypted.iv, "base64"),
    );
    decipher.setAAD(context(connection));
    decipher.setAuthTag(Buffer.from(encrypted.tag, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(encrypted.data, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw aiError(
      "This API key could not be unlocked. Replace it in AI settings or contact the administrator.",
      503,
    );
  }
}
