import { createFileRoute } from "@tanstack/react-router";
import { providers } from "@/lib/search-providers";
import type { Deal } from "@/lib/types";

export type SearchStatus =
  | "empty"
  | "unavailable"
  | "no-results"
  | "ok";

export interface SearchApiResponse {
  status: SearchStatus;
  deals: Deal[];
  errors: { provider: string; message: string }[];
}

/**
 * Internal search API. The frontend calls this endpoint when the user
 * presses "Найти цены". Aggregates every enabled provider in parallel;
 * per-provider failures are reported without failing the whole request.
 *
 * When no providers are enabled yet the response uses status "unavailable"
 * so the UI can render: "Поиск по торговым площадкам пока недоступен."
 */
export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const q = (url.searchParams.get("q") ?? "").trim();

        if (!q) {
          return json({ status: "empty", deals: [], errors: [] });
        }

        const active = providers.filter((p) => p.enabled);
        if (active.length === 0) {
          return json({ status: "unavailable", deals: [], errors: [] });
        }

        const settled = await Promise.allSettled(
          active.map((p) => p.search(q)),
        );

        const deals: Deal[] = [];
        const errors: SearchApiResponse["errors"] = [];
        settled.forEach((r, i) => {
          const p = active[i]!;
          if (r.status === "fulfilled") {
            deals.push(...r.value.map((d) => ({ ...d, query: q })));
          } else {
            errors.push({
              provider: p.name,
              message:
                r.reason instanceof Error ? r.reason.message : String(r.reason),
            });
          }
        });

        return json({
          status: deals.length ? "ok" : "no-results",
          deals,
          errors,
        });
      },
    },
  },
});

function json(body: SearchApiResponse): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
