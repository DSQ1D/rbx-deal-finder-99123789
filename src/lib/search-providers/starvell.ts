import type { SearchProvider } from "./types";

/**
 * Starvell search module.
 * TODO: wire real Starvell API / parser. Must never return fabricated data.
 */
export const starvell: SearchProvider = {
  id: "starvell",
  name: "Starvell",
  enabled: false,
  async search(_query: string, _signal?: AbortSignal) {
    return [];
  },
};
