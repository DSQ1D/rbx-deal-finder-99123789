import type { Item, ItemProvider } from "../types/item.js";

/**
 * Playerok provider.
 * TODO: wire real API / parser. Must never return fabricated data.
 */
export const playerok: ItemProvider = {
  id: "playerok",
  name: "Playerok",
  async search(_query: string, _signal?: AbortSignal): Promise<Item[]> {
    return [];
  },
};
