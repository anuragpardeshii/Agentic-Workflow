export function aiError(message, status = 502) {
  return Object.assign(new Error(message), { status });
}
