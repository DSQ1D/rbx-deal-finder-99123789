import type { Item, ItemProvider } from "../types/item.js";

/**
 * FunPay provider.
 * TODO: wire real API / parser. Must never return fabricated data.
 */
export const funpay: ItemProvider = {
  id: "funpay",
  name: "FunPay",
  async search(_query: string, _signal?: AbortSignal): Promise<Item[]> {
    return [];
  },
};
