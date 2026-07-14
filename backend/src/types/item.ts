/**
 * Normalized marketplace item returned by every provider.
 * Fields mirror the frontend `Deal` type so responses can be
 * consumed by the UI without transformation.
 */
export interface Item {
  id: string;
  title: string;
  marketplace: string;
  price: string;
  seller: string;
  url: string;
  query?: string;
}

/**
 * Contract every marketplace provider must implement.
 * Providers MUST return only real data fetched from their source.
 * When nothing is found (or the source is not yet wired), return `[]`.
 */
export interface ItemProvider {
  id: string;
  name: string;
  search(query: string, signal?: AbortSignal): Promise<Item[]>;
}

export type SearchStatus = "empty" | "no-providers" | "no-results" | "ok";

export interface SearchResponse {
  status: SearchStatus;
  items: Item[];
  errors: { provider: string; message: string }[];
}
