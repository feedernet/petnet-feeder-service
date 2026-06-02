export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = { ...(init?.headers ?? {}) };
  if (init?.body !== undefined) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }
  const res = await fetch(url, { credentials: "include", ...init, headers });
  if (!res.ok) throw new Error(res.statusText);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}
