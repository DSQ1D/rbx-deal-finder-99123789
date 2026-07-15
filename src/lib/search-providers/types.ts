import type { Deal } from "@/lib/types";

/**
 * Contract every marketplace search module must implement.
 * Providers MUST return only real data they actually fetched from
 * their source. When nothing is found or the integration is not yet
 * wired, return `[]` — never fabricate results.
 */
export interface SearchProvider {
  id: string;
  name: string;
  /**
   * Set to `false` while the integration is a stub. The aggregator
   * uses this flag to distinguish "no results" from "not yet wired".
   */
  enabled: boolean;
  search(query: string, signal?: AbortSignal): Promise<Deal[]>;
}
