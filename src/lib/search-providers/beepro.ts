import type { SearchProvider } from "./types";

/**
 * Beee.pro search module.
 * TODO: wire real Beee.pro API / parser. Must never return fabricated data.
 */
export const beepro: SearchProvider = {
  id: "beepro",
  name: "Beee.pro",
  enabled: false,
  async search(_query: string, _signal?: AbortSignal) {
    return [];
  },
};
