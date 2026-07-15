import type { Deal } from "./types";

export type SearchStatus = "empty" | "unavailable" | "no-results" | "ok";

export interface SearchResponse {
  status: SearchStatus;
  deals: Deal[];
  errors: { provider: string; message: string }[];
}

/**
 * Calls the internal /api/search endpoint. All marketplace integrations
 * live server-side under `src/lib/search-providers/*` and are aggregated
 * by `src/routes/api/search.ts`.
 */
export async function searchDeals(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const q = query.trim();
  if (!q) return { status: "empty", deals: [], errors: [] };

  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal });
  if (!res.ok) {
    throw new Error(`Search request failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as SearchResponse;
}
