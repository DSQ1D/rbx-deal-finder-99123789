import type { Deal } from "./types";

/**
 * Provider adapter contract for a Roblox marketplace / price source.
 *
 * Implement one adapter per marketplace (official Roblox API, third-party
 * marketplaces, custom parsers) and register it in `providers` below.
 * Each adapter MUST return only real deals it actually fetched — never
 * fabricated data. Return `[]` when there are no matches.
 */
export interface DealsProvider {
  id: string;
  name: string;
  search(query: string, signal?: AbortSignal): Promise<Deal[]>;
}

/**
 * Registered providers. Empty by default — add real adapters here once
 * API keys / endpoints are available. The UI will automatically pick them up.
 */
export const providers: DealsProvider[] = [];

export type SearchStatus = "empty" | "no-providers" | "no-results" | "ok";

export interface SearchResponse {
  status: SearchStatus;
  deals: Deal[];
  errors: { provider: string; message: string }[];
}

/**
 * Aggregated search across all registered providers. Runs providers in
 * parallel, collects successful results, and reports per-provider errors
 * without failing the whole request.
 */
export async function searchDeals(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const q = query.trim();
  if (!q) return { status: "empty", deals: [], errors: [] };
  if (providers.length === 0) {
    return { status: "no-providers", deals: [], errors: [] };
  }

  const settled = await Promise.allSettled(
    providers.map((p) => p.search(q, signal)),
  );

  const deals: Deal[] = [];
  const errors: SearchResponse["errors"] = [];
  settled.forEach((r, i) => {
    const p = providers[i];
    if (r.status === "fulfilled") deals.push(...r.value);
    else errors.push({ provider: p.name, message: String(r.reason?.message ?? r.reason) });
  });

  return {
    status: deals.length ? "ok" : "no-results",
    deals,
    errors,
  };
}
