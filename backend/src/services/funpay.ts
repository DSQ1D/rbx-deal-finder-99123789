import * as cheerio from "cheerio";
import type { Item, ItemProvider } from "../types/item.js";

/**
 * Publicly accessible FunPay category pages for Roblox listings.
 * FunPay does not expose a guest search API; results are fetched from known
 * category pages and filtered locally by the query string.
 *
 * Category IDs:
 *   chips/99  — Robux (in-game currency)
 *   lots/401  — Roblox Accounts
 *   lots/402  — Roblox Other
 *   lots/927  — Roblox Adopt Me
 *   lots/2644 — Roblox Rivals
 *
 * To add a new category, append its URL here — the parser picks it up
 * automatically. Remove a URL if that category disappears from the site.
 */
const CATEGORY_URLS: string[] = [
  "https://funpay.com/chips/99/",
  "https://funpay.com/lots/401/",
  "https://funpay.com/lots/402/",
  "https://funpay.com/lots/927/",
  "https://funpay.com/lots/2644/",
];

const FETCH_TIMEOUT_MS = 10_000;

const REQUEST_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
};

/**
 * Fetch a single category page and parse all `a.tc-item` listings from it.
 * Returns an empty array if the page is unavailable, returns a non-200 status,
 * changes its HTML structure, or times out — never throws.
 */
async function fetchCategory(
  categoryUrl: string,
  signal: AbortSignal,
): Promise<Item[]> {
  let html: string;

  try {
    const res = await fetch(categoryUrl, {
      headers: REQUEST_HEADERS,
      signal,
    });

    if (!res.ok) return [];
    html = await res.text();
  } catch {
    // Network error, timeout, or abort — degrade gracefully
    return [];
  }

  try {
    return parseListings(html);
  } catch {
    // Unexpected parse error (FunPay changed its layout)
    return [];
  }
}

/**
 * Parse `a.tc-item` offer cards from a FunPay category page HTML string.
 *
 * Card structure (as of 2025):
 *   <a href="/lots/offer?id=…" class="tc-item">
 *     <div class="tc-desc">
 *       <div class="tc-desc-text">Item title</div>
 *     </div>
 *     <div class="tc-user">
 *       <div class="media-body">
 *         <div class="media-user-name">SellerName</div>
 *       </div>
 *     </div>
 *     <div class="tc-price" data-s="1234.56">
 *       <div>1 234 <span class="unit">₽</span></div>
 *     </div>
 *   </a>
 *
 * If the layout changes and required fields are missing, that card is silently
 * skipped rather than crashing the whole parse.
 */
function parseListings(html: string): Item[] {
  const $ = cheerio.load(html);
  const items: Item[] = [];

  $("a.tc-item").each((_, el) => {
    try {
      const anchor = $(el);
      const href = anchor.attr("href")?.trim();
      if (!href) return;

      const title = anchor.find(".tc-desc-text").first().text().trim();
      const seller = anchor.find(".media-user-name").first().text().trim();

      if (!title || !seller) return;

      // Prefer the raw numeric value from data-s; fall back to visible text.
      const priceEl = anchor.find(".tc-price").first();
      const priceNum = priceEl.attr("data-s");
      const priceText = priceEl.find("div").first().text().trim();
      const price = priceNum
        ? formatPrice(priceNum)
        : (priceText || priceNum || "—");

      const url = href.startsWith("http")
        ? href
        : `https://funpay.com${href}`;

      // Stable ID: encode the offer URL so it survives re-fetches
      const id = `funpay-${url.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;

      items.push({ id, title, marketplace: "FunPay", price, seller, url });
    } catch {
      // Skip malformed card, continue parsing the rest
    }
  });

  return items;
}

/** Format a raw numeric price string (e.g. "28004.07332") into "28 004 ₽". */
function formatPrice(raw: string): string {
  const num = parseFloat(raw);
  if (Number.isNaN(num)) return raw;
  return (
    num.toLocaleString("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }) + " ₽"
  );
}

export const funpay: ItemProvider = {
  id: "funpay",
  name: "FunPay",

  async search(query: string, signal?: AbortSignal): Promise<Item[]> {
    // One AbortSignal that fires on caller cancellation OR our own timeout
    const timeout = AbortSignal.timeout(FETCH_TIMEOUT_MS);
    const combined =
      signal ? AbortSignal.any([signal, timeout]) : timeout;

    // Fetch all categories in parallel; individual failures don't abort the rest
    const settled = await Promise.allSettled(
      CATEGORY_URLS.map((url) => fetchCategory(url, combined)),
    );

    const all: Item[] = settled.flatMap((r) =>
      r.status === "fulfilled" ? r.value : [],
    );

    // Client-side filtering: keep only listings whose title contains the query.
    // This is necessary because FunPay has no public guest search endpoint.
    const q = query.trim().toLowerCase();
    return q
      ? all.filter((item) => item.title.toLowerCase().includes(q))
      : all;
  },
};
