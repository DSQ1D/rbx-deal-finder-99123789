import { Router, type Request, type Response } from "express";
import type { Item, ItemProvider, SearchResponse } from "../types/item.js";
import { playerok } from "../services/playerok.js";
import { funpay } from "../services/funpay.js";
import { starvell } from "../services/starvell.js";
import { beepro } from "../services/beepro.js";

/**
 * Registered marketplace providers. Add or remove entries here to
 * change what the aggregator queries. All providers run in parallel.
 */
const providers: ItemProvider[] = [playerok, funpay, starvell, beepro];

export const searchRouter = Router();

searchRouter.get("/search", async (req: Request, res: Response) => {
  const q = String(req.query.q ?? "").trim();

  if (!q) {
    const body: SearchResponse = { status: "empty", items: [], errors: [] };
    return res.json(body);
  }

  if (providers.length === 0) {
    const body: SearchResponse = { status: "no-providers", items: [], errors: [] };
    return res.json(body);
  }

  const settled = await Promise.allSettled(
    providers.map((p) => p.search(q)),
  );

  const items: Item[] = [];
  const errors: SearchResponse["errors"] = [];
  settled.forEach((r, i) => {
    const p = providers[i]!;
    if (r.status === "fulfilled") {
      items.push(...r.value.map((it) => ({ ...it, query: q })));
    } else {
      errors.push({
        provider: p.name,
        message: r.reason instanceof Error ? r.reason.message : String(r.reason),
      });
    }
  });

  const body: SearchResponse = {
    status: items.length ? "ok" : "no-results",
    items,
    errors,
  };
  return res.json(body);
});
