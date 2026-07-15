import type { SearchProvider } from "./types";

/**
 * PlayerOK search module.
 * TODO: wire real PlayerOK API / parser. Must never return fabricated data.
 */
export const playerok: SearchProvider = {
  id: "playerok",
  name: "PlayerOK",
  enabled: false,
  async search(_query: string, _signal?: AbortSignal) {
    return [];
  },
};
