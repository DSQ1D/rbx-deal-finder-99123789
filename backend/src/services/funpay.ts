import * as cheerio from "cheerio";
import type { Item, ItemProvider } from "../types/item.js";

// ---------------------------------------------------------------------------
// Configuration — all values can be overridden via environment variables.
// ---------------------------------------------------------------------------

/**
 * Base URL for FunPay.  Override with FUNPAY_BASE_URL if you need to point
 * at a staging mirror or a local proxy.
 * @default "https://funpay.com"
 */
const BASE_URL = (process.env.FUNPAY_BASE_URL ?? "https://funpay.com").replace(
  /\/+$/,
  "",
);

/**
 * Maximum milliseconds to wait for a single category page to respond.
 * Override with FUNPAY_TIMEOUT_MS.
 * @default 10000
 */
const FETCH_TIMEOUT_MS = Math.max(
  1_000,
  parseInt(process.env.FUNPAY_TIMEOUT_MS ?? "10000", 10) || 10_000,
);

/**
 * User-Agent sent with every request.
 * Override with FUNPAY_USER_AGENT.
 */
const USER_AGENT =
  process.env.FUNPAY_USER_AGENT ??
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/**
 * Accept-Language header value.
 * Override with FUNPAY_ACCEPT_LANGUAGE.
 */
const ACCEPT_LANGUAGE =
  process.env.FUNPAY_ACCEPT_LANGUAGE ?? "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7";

// ---------------------------------------------------------------------------
// Category paths
// ---------------------------------------------------------------------------

/**
 * Publicly accessible FunPay category paths for Roblox listings, relative to
 * BASE_URL.  FunPay does not expose a guest search API; results are fetched
 * from these known category pages and filtered locally by the query string.
 *
 * Category IDs:
 *   chips/99  — Robux (in-game currency)
 *   lots/401  — Roblox Accounts
 *   lots/402  — Roblox Other
 *   lots/927  — Roblox Adopt Me
 *   lots/2644 — Roblox Rivals
 *
 * To add a category, append its path here — the parser picks it up
 * automatically.  Remove a path if that category disappears from the site.
 */
const CATEGORY_PATHS: string[] = [
  "/chips/99/",
  "/lots/401/",
  "/lots/402/",
  "/lots/927/",
  "/lots/2644/",
];

// ---------------------------------------------------------------------------
// Logging helpers
// ---------------------------------------------------------------------------

const LOG_PREFIX = "[funpay]";

function log(message: string): void {
  console.log(`${LOG_PREFIX} ${message}`);
}

function warn(message: string): void {
  console.warn(`${LOG_PREFIX} ${message}`);
}

// ---------------------------------------------------------------------------
// Diagnostic (runs once per process, first search() call only)
// ---------------------------------------------------------------------------

let diagnosticDone = false;

/**
 * Fetch one category URL and emit a structured diagnostic report.
 * Runs once per process lifetime so it never floods the logs.
 * Does not touch the parser or affect search results.
 */
async function diagnoseFetch(path: string): Promise<void> {
  const url = `${BASE_URL}${path}`;
  const divider = "─".repeat(60);

  log(`\n${divider}`);
  log(`DIAGNOSTIC — ${url}`);
  log(divider);

  let res: Response;
  let html: string;

  try {
    res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": ACCEPT_LANGUAGE,
      },
      // fetch() follows redirects automatically; res.url is the final URL.
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    warn(`DIAGNOSTIC — request failed: ${reason}`);
    log(divider);
    return;
  }

  // --- Final URL (after redirects) ----------------------------------------
  log(`Final URL   : ${res.url}`);
  log(`Redirected  : ${res.url !== url ? `yes → ${res.url}` : "no"}`);

  // --- HTTP status -----------------------------------------------------------
  log(`HTTP status : ${res.status} ${res.statusText}`);

  // --- Response headers ------------------------------------------------------
  log("Response headers:");
  res.headers.forEach((value, name) => {
    log(`  ${name}: ${value}`);
  });

  // --- Body ------------------------------------------------------------------
  try {
    html = await res.text();
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    warn(`DIAGNOSTIC — could not read body: ${reason}`);
    log(divider);
    return;
  }

  log(`Body length : ${html.length} bytes`);

  const snippet = html.slice(0, 500).replace(/\s+/g, " ").trim();
  log(`First 500ch : ${snippet}`);

  // --- Content signals -------------------------------------------------------
  const lower = html.toLowerCase();

  const hasTcItem      = lower.includes("tc-item");
  const hasCaptcha     = lower.includes("captcha");
  const hasLogin       = lower.includes("login") || lower.includes("войти");
  const hasCloudflare  =
    lower.includes("cloudflare") ||
    res.headers.get("server")?.toLowerCase().includes("cloudflare") === true ||
    res.headers.has("cf-ray") ||
    lower.includes("cf-browser-verification") ||
    lower.includes("attention required");

  log(`Has tc-item        : ${hasTcItem}`);
  log(`Has captcha        : ${hasCaptcha}`);
  log(`Has login prompt   : ${hasLogin}`);
  log(`Has Cloudflare     : ${hasCloudflare}`);

  // Extra Cloudflare detail when detected
  if (hasCloudflare) {
    const cfRay = res.headers.get("cf-ray");
    const server = res.headers.get("server");
    warn(
      `DIAGNOSTIC — Cloudflare detected. ` +
        `cf-ray=${cfRay ?? "absent"} server=${server ?? "absent"}`,
    );
  }

  log(divider);
}

// ---------------------------------------------------------------------------
// HTTP fetch
// ---------------------------------------------------------------------------

/**
 * Fetch a single category page and parse all `a.tc-item` listings from it.
 * Returns an empty array on any failure — never throws.
 */
async function fetchCategory(
  path: string,
  signal: AbortSignal,
): Promise<Item[]> {
  const url = `${BASE_URL}${path}`;
  let html: string;

  try {
    log(`GET ${url}`);

    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": ACCEPT_LANGUAGE,
      },
      signal,
    });

    log(`${res.status} ${res.statusText} — ${url}`);

    if (!res.ok) {
      warn(
        `Skipping ${url}: HTTP ${res.status} ${res.statusText}. ` +
          "Category may be unavailable, geo-restricted, or removed.",
      );
      return [];
    }

    html = await res.text();
    log(`Received ${html.length} bytes from ${url}`);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    warn(`Network error fetching ${url}: ${reason}`);
    return [];
  }

  try {
    const items = parseListings(html, url);
    log(`Parsed ${items.length} listings from ${url}`);
    return items;
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    warn(
      `Parse failure for ${url}: ${reason}. ` +
        "FunPay may have changed its HTML layout.",
    );
    return [];
  }
}

// ---------------------------------------------------------------------------
// HTML parser
// ---------------------------------------------------------------------------

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
 * If required fields are missing on a card it is silently skipped — the rest
 * of the page is still processed.  If the layout changes so severely that
 * zero cards are found, the caller logs and returns [].
 */
function parseListings(html: string, sourceUrl: string): Item[] {
  const $ = cheerio.load(html);
  const cards = $("a.tc-item");

  if (cards.length === 0) {
    warn(
      `No a.tc-item elements found on ${sourceUrl}. ` +
        "Page may require login, be empty, or the layout may have changed.",
    );
    return [];
  }

  const items: Item[] = [];
  let skipped = 0;

  cards.each((_, el) => {
    try {
      const anchor = $(el);
      const href = anchor.attr("href")?.trim();
      if (!href) {
        skipped++;
        return;
      }

      const title = anchor.find(".tc-desc-text").first().text().trim();
      const seller = anchor.find(".media-user-name").first().text().trim();

      if (!title || !seller) {
        skipped++;
        return;
      }

      // Prefer raw numeric data-s for precision; fall back to visible text.
      const priceEl = anchor.find(".tc-price").first();
      const priceNum = priceEl.attr("data-s");
      const priceText = priceEl.find("div").first().text().trim();
      const price = priceNum
        ? formatPrice(priceNum)
        : (priceText || "—");

      const absoluteUrl = href.startsWith("http")
        ? href
        : `${BASE_URL}${href.startsWith("/") ? "" : "/"}${href}`;

      // Stable ID derived from the offer URL, survives re-fetches.
      const id = `funpay-${absoluteUrl
        .replace(/[^a-z0-9]+/gi, "-")
        .toLowerCase()}`;

      items.push({
        id,
        title,
        marketplace: "FunPay",
        price,
        seller,
        url: absoluteUrl,
      });
    } catch (err) {
      // Individual card failed — log and continue with the rest.
      const reason = err instanceof Error ? err.message : String(err);
      warn(`Skipping malformed card on ${sourceUrl}: ${reason}`);
      skipped++;
    }
  });

  if (skipped > 0) {
    warn(`Skipped ${skipped} of ${cards.length} cards on ${sourceUrl} (missing required fields).`);
  }

  return items;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a raw numeric price string (e.g. "28004.07332") into "28 004 ₽". */
function formatPrice(raw: string): string {
  const num = parseFloat(raw);
  if (Number.isNaN(num)) {
    warn(`Could not parse price value: "${raw}"`);
    return raw;
  }
  return (
    num.toLocaleString("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }) + " ₽"
  );
}

// ---------------------------------------------------------------------------
// Debug probe (used by GET /api/debug/funpay — never called by search())
// ---------------------------------------------------------------------------

export interface CategoryProbeResult {
  url: string;
  httpStatus: number | null;   // null when a network error prevented any response
  httpStatusText: string | null;
  itemsParsed: number | null;  // null when fetch failed before parsing
  error: string | null;
}

/**
 * Fetch every category URL once and return a structured per-URL report.
 * Independent of search() — never shares state or side-effects with it.
 */
export async function debugProbe(): Promise<CategoryProbeResult[]> {
  const results = await Promise.allSettled(
    CATEGORY_PATHS.map(async (path): Promise<CategoryProbeResult> => {
      const url = `${BASE_URL}${path}`;
      let res: Response;

      try {
        res = await fetch(url, {
          headers: {
            "User-Agent": USER_AGENT,
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": ACCEPT_LANGUAGE,
          },
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
      } catch (err) {
        return {
          url,
          httpStatus: null,
          httpStatusText: null,
          itemsParsed: null,
          error: err instanceof Error ? err.message : String(err),
        };
      }

      if (!res.ok) {
        return {
          url,
          httpStatus: res.status,
          httpStatusText: res.statusText,
          itemsParsed: null,
          error: `HTTP ${res.status} ${res.statusText}`,
        };
      }

      let html: string;
      try {
        html = await res.text();
      } catch (err) {
        return {
          url,
          httpStatus: res.status,
          httpStatusText: res.statusText,
          itemsParsed: null,
          error: `Body read failed: ${err instanceof Error ? err.message : String(err)}`,
        };
      }

      let itemsParsed: number;
      try {
        itemsParsed = parseListings(html, url).length;
      } catch (err) {
        return {
          url,
          httpStatus: res.status,
          httpStatusText: res.statusText,
          itemsParsed: null,
          error: `Parse failed: ${err instanceof Error ? err.message : String(err)}`,
        };
      }

      return {
        url,
        httpStatus: res.status,
        httpStatusText: res.statusText,
        itemsParsed,
        error: null,
      };
    }),
  );

  return results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : {
          url: `${BASE_URL}${CATEGORY_PATHS[i]}`,
          httpStatus: null,
          httpStatusText: null,
          itemsParsed: null,
          error: r.reason instanceof Error ? r.reason.message : String(r.reason),
        },
  );
}

// ---------------------------------------------------------------------------
// Provider export
// ---------------------------------------------------------------------------

export const funpay: ItemProvider = {
  id: "funpay",
  name: "FunPay",

  async search(query: string, signal?: AbortSignal): Promise<Item[]> {
    log(
      `search("${query}") — base=${BASE_URL} timeout=${FETCH_TIMEOUT_MS}ms ` +
        `categories=${CATEGORY_PATHS.length}`,
    );

    // Run the diagnostic once per process on the first search call.
    if (!diagnosticDone) {
      diagnosticDone = true;
      // Fire-and-forget: diagnostic runs alongside the real fetches.
      diagnoseFetch(CATEGORY_PATHS[0]!).catch((err) => {
        warn(`DIAGNOSTIC — unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      });
    }

    // Single AbortSignal that fires on caller cancellation OR our own timeout.
    const timeout = AbortSignal.timeout(FETCH_TIMEOUT_MS);
    const combined =
      signal ? AbortSignal.any([signal, timeout]) : timeout;

    // Fetch all categories in parallel; one failure never aborts the rest.
    const settled = await Promise.allSettled(
      CATEGORY_PATHS.map((path) => fetchCategory(path, combined)),
    );

    const all: Item[] = settled.flatMap((r) =>
      r.status === "fulfilled" ? r.value : [],
    );

    // Client-side filtering — FunPay has no public guest search endpoint.
    const q = query.trim().toLowerCase();
    const results = q
      ? all.filter((item) => item.title.toLowerCase().includes(q))
      : all;

    log(
      `search("${query}") → ${results.length} results ` +
        `(${all.length} total across all categories)`,
    );

    return results;
  },
};
