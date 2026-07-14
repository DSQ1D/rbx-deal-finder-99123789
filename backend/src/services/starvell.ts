import type { Item, ItemProvider } from "../types/item.js";

/**
 * Starvell provider.
 * TODO: wire real API / parser. Must never return fabricated data.
 */
export const starvell: ItemProvider = {
  id: "starvell",
  name: "Starvell",
  async search(_query: string, _signal?: AbortSignal): Promise<Item[]> {
    return [];
  },
};
