const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
  /\/+$/,
  ""
);

function apiUrl(input: string): string {
  if (/^https?:\/\//i.test(input) || !API_BASE_URL) return input;
  return `${API_BASE_URL}${input.startsWith("/") ? input : `/${input}`}`;
}

function backendUrl(input: string): string {
  if (/^https?:\/\//i.test(input) || !API_BASE_URL) return input;
  return `${API_BASE_URL}${input.startsWith("/") ? input : `/${input}`}`;
}

function normalizeBackendUrls<T>(value: T): T {
  if (!API_BASE_URL || value == null) return value;
  if (Array.isArray(value)) return value.map(normalizeBackendUrls) as T;
  if (typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (typeof entry === "string" && key === "image" && entry.startsWith("/")) {
        return [key, backendUrl(entry)];
      }
      return [key, normalizeBackendUrls(entry)];
    })
  ) as T;
}

/**
 * Fetch JSON from the dev proxy (/api → localhost:4000).
 * Avoids `res.json()` on empty bodies (e.g. API not running → "Unexpected end of JSON input").
 */
export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(input), {
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
    return normalizeBackendUrls(JSON.parse(text) as T);
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

export async function fetchPopularNews<T>(limit: number): Promise<T[]> {
  try {
    return await fetchJson<T[]>(`/api/news/popular?limit=${limit}`);
  } catch {
    return fetchJson<T[]>(`/api/news?sort=popular&limit=${limit}`);
  }
}
