/**
 * Fetch JSON from the dev proxy (/api → localhost:4000).
 * Avoids `res.json()` on empty bodies (e.g. API not running → "Unexpected end of JSON input").
 */
export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    let message = text.trim();
    if (message) {
      try {
        const j = JSON.parse(message) as { detail?: unknown };
        if (typeof j.detail === "string") message = j.detail;
        else if (Array.isArray(j.detail))
          message = j.detail.map(String).join(", ");
      } catch {
        /* use raw body */
      }
    }
    throw new Error(message || `Request failed (${res.status})`);
  }
  if (!text.trim()) {
    throw new Error(
      "Empty response from the API. Start the backend on port 4000 (see README), then refresh."
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Server did not return valid JSON.");
  }
}

export function getAdminAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("adminAuth") || "";
  return token ? { Authorization: `Basic ${token}` } : {};
}

export async function fetchAdminJson<T>(
  input: string,
  init?: RequestInit
): Promise<T> {
  return fetchJson<T>(input, {
    ...init,
    headers: {
      ...getAdminAuthHeader(),
      ...init?.headers,
    },
  });
}

export type NewsListQuery = {
  source?: string;
  /** Exact match for `category_ta` in the database (Tamil label). */
  category_ta?: string;
};

export async function fetchNewsList<T>(
  query?: NewsListQuery
): Promise<T[]> {
  const sp = new URLSearchParams();
  if (query?.source) sp.set("source", query.source);
  if (query?.category_ta) sp.set("category_ta", query.category_ta);
  const qs = sp.toString();
  const url = qs ? `/api/news?${qs}` : "/api/news";
  const data = await fetchJson<unknown>(url);
  if (!Array.isArray(data)) {
    throw new Error("Expected a JSON array from /api/news");
  }
  return data as T[];
}
