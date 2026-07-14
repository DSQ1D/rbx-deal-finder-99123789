import { Router, type Request, type Response } from "express";
import { debugProbe, type CategoryProbeResult } from "../services/funpay.js";

export const debugRouter = Router();

interface FunpayDebugResponse {
  provider: "funpay";
  timestamp: string;
  categories: CategoryProbeResult[];
  totals: {
    urls: number;
    succeeded: number;   // httpStatus 2xx and items parsed without error
    failed: number;
    itemsParsed: number; // sum across successful categories
    errors: string[];    // one entry per failed category
  };
}

debugRouter.get("/funpay", async (_req: Request, res: Response) => {
  const timestamp = new Date().toISOString();

  const categories = await debugProbe();

  const succeeded = categories.filter((c) => c.error === null);
  const failed    = categories.filter((c) => c.error !== null);

  const body: FunpayDebugResponse = {
    provider: "funpay",
    timestamp,
    categories,
    totals: {
      urls: categories.length,
      succeeded: succeeded.length,
      failed: failed.length,
      itemsParsed: succeeded.reduce((sum, c) => sum + (c.itemsParsed ?? 0), 0),
      errors: failed.map((c) => `${c.url} — ${c.error}`),
    },
  };

  return res.json(body);
});
