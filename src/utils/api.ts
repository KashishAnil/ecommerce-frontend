import { BASE_NAME, BASE_URL } from "../constants/api";

/**
 * Shared fetch() helper.
 * - Adds Content-Type: application/json
 * - Attaches Authorization: Bearer <token> from localStorage when present
 * - Throws an Error with a readable message if the response is not ok
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = localStorage.getItem("token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      "Could not reach the server. Is the backend running on port 3000?",
    );
  }

  const text = await res.text();
  let data: { error?: string; message?: string } = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!res.ok) {
    throw new Error(
      data.error || data.message || `Request failed (${res.status})`,
    );
  }

  return data as T;
}

export function formatMoney(amount: number | undefined | null) {
  return `$${(Number(amount) || 0).toFixed(2)}`;
}

export function appUrl(path: string) {
  const base = BASE_NAME.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!base) return `${window.location.origin}${p}`;
  return `${window.location.origin}${base}${p}`;
}
