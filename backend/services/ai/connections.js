import AIConnection from "../../models/AIConnection.js";
import User from "../../models/User.js";
import { decryptKey } from "./vault.js";
import { validateConnection, PROVIDERS, providerHeaders } from "./catalog.js";
import { aiError } from "./errors.js";

export function connectionMetadata(connection) {
  return {
    id: String(connection._id),
    label: connection.label,
    provider: connection.provider,
    model: connection.model,
    keyHint: `••••${connection.keyLastFour}`,
    updatedAt: connection.updatedAt,
  };
}
export async function ownedConnection(owner, id, secret = false) {
  const query = AIConnection.findOne({ _id: id, owner });
  const connection = await (secret ? query.select("+encryptedKey") : query);
  if (!connection) throw aiError("API connection not found.", 404);
  return connection;
}
export async function resolveAIEnvironment(owner, id, env = process.env) {
  if (id === undefined) {
    const user = await User.findById(owner).select("activeAiConnection");
    if (!user) throw aiError("Please sign in again", 401);
    id = user.activeAiConnection;
  }
  if (!id) return { ...env };
  const connection = await ownedConnection(owner, id, true);
  validateConnection(connection.provider, connection.model, env);
  // Never mutate process.env or fall back to the application's key.
  const resolved = {
    ...env,
    AI_PROVIDER: connection.provider,
    AI_MODEL: connection.model,
    AI_USER_FUNDED: "true",
  };
  for (const entry of Object.values(PROVIDERS)) resolved[entry.keyEnv] = "";
  resolved[PROVIDERS[connection.provider].keyEnv] = decryptKey(connection, env);
  return resolved;
}
export async function checkConnection(
  connection,
  { env = process.env, fetchImpl = fetch } = {},
) {
  validateConnection(connection.provider, connection.model, env);
  const key = decryptKey(connection, env);
  const url = PROVIDERS[connection.provider].checkUrl;
  try {
    const response = await fetchImpl(url, {
      headers: providerHeaders(connection.provider, key),
      signal: AbortSignal.timeout(15000),
      redirect: "error",
    });
    await response.body?.cancel();
    if ([401, 403].includes(response.status))
      throw aiError(
        "The provider rejected this key. Replace it and try again.",
        422,
      );
    if (response.status === 429)
      throw aiError(
        "The provider is rate limiting key checks. Try again later.",
        429,
      );
    if (!response.ok)
      throw aiError("The provider could not verify this key right now.", 502);
    return {
      message:
        "The provider accepted your key. Model access and available quota are checked when you generate.",
    };
  } catch (error) {
    if (error.status) throw error;
    throw aiError(
      "Could not reach the provider. Try checking the key again later.",
      502,
    );
  }
}
