export async function apiRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  // Port 5000 can be occupied by an older Windows service during local
  // development.  The current API is therefore started on 5001 while Vite
  // keeps its normal 5173 address.  Production remains same-origin.
  const apiBase =
    window.location.port === "5173"
      ? `${window.location.protocol}//${window.location.hostname}:5001/api`
      : "/api";
  const response = await fetch(`${apiBase}${url}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? `Request failed with ${response.status}`);
  }

  // DELETE endpoints commonly return 204 (No Content). Trying to parse that
  // empty response as JSON makes a successful delete look like a failure.
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}
