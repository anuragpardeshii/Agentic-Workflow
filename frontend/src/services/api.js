export async function api(path, options = {}) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(
    `${import.meta.env.VITE_API_URL || "/api"}${path}`,
    {
      ...options,
      signal: options.signal || AbortSignal.timeout(190000),
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    },
  );
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an unexpected response.");
  }
  if (!response.ok) {
    if (response.status === 401 && token)
      window.dispatchEvent(new Event("auth-expired"));
    throw new Error(data.error || "Request failed. Please try again.");
  }
  return data;
}
export const generateResponse = async (prompt, connectionId) =>
  (
    await api("/projects/generate", {
      method: "POST",
      body: JSON.stringify({ prompt, connectionId }),
    })
  ).response;
