import type { Item, ItemProvider } from "../types/item.js";

/**
 * BeePro provider.
 * TODO: wire real API / parser. Must never return fabricated data.
 */
export const beepro: ItemProvider = {
  id: "beepro",
  name: "BeePro",
  async search(_query: string, _signal?: AbortSignal): Promise<Item[]> {
    return [];
  },
};
