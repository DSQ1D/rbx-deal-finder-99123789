import type { Deal } from "./types";

export type SearchStatus = "empty" | "unavailable" | "no-results" | "ok";

export interface SearchResponse {
  status: SearchStatus;
  deals: Deal[];
  errors: { provider: string; message: string }[];
}

/**
 * Base URL of the external backend API.
 * Configure via the `VITE_API_URL` environment variable, e.g.
 *   VITE_API_URL=https://api.rbxdeals.example.com
 * Trailing slashes are stripped so callers can safely append paths.
 */
const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

/**
 * Thrown when the external search API cannot be reached or returns a
 * non-2xx response. The UI catches this to render a friendly message.
 */
export class SearchApiUnavailableError extends Error {
  constructor(message = "Search API unavailable") {
    super(message);
    this.name = "SearchApiUnavailableError";
  }
}

/**
 * Calls the external backend at `${VITE_API_URL}/search?q=...`.
 * Never falls back to local data — if the API is missing or fails,
 * throws `SearchApiUnavailableError` so the UI can show a clear message.
 */
export async function searchDeals(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const q = query.trim();
  if (!q) return { status: "empty", deals: [], errors: [] };

  if (!API_BASE) {
    throw new SearchApiUnavailableError("VITE_API_URL is not configured");
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`, {
      signal,
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw err;
    throw new SearchApiUnavailableError(
      err instanceof Error ? err.message : String(err),
    );
  }

  if (!res.ok) {
    throw new SearchApiUnavailableError(
      `Search API responded ${res.status} ${res.statusText}`,
    );
  }

  try {
    return (await res.json()) as SearchResponse;
  } catch (err) {
    throw new SearchApiUnavailableError(
      `Invalid JSON from search API: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
