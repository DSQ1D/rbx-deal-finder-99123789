import type { SearchProvider } from "./types";

/**
 * FunPay search module.
 *
 * FunPay does not expose a public guest search API. A real implementation
 * fetches known Roblox category pages (e.g. /chips/99/, /lots/401/) and
 * filters offer cards (`a.tc-item`) by the user's query.
 *
 * TODO: wire the real fetch + HTML parser here. Suggested steps:
 *   1. fetch category HTML with a browser-like User-Agent
 *   2. parse `a.tc-item` cards with cheerio
 *   3. extract title / seller / price / url and map to `Deal`
 *   4. filter locally by `query` (case-insensitive substring match)
 *
 * Until wired, this module MUST return `[]` and stay `enabled: false`
 * so the UI reports the correct empty state.
 */
export const funpay: SearchProvider = {
  id: "funpay",
  name: "FunPay",
  enabled: false,
  async search(_query: string, _signal?: AbortSignal) {
    // TODO: replace with real FunPay fetch + parser.
    return [];
  },
};
