# RBXDeals Backend

Node.js + Express + TypeScript REST API for aggregating Roblox item deals
from multiple marketplaces (Playerok, FunPay, Starvell, BeePro).

## Endpoints

- `GET /api/search?q=<query>` — aggregates results from all registered
  providers. Returns `{ status, items, errors }`.

## Structure

```
src/
  server.ts              # Express bootstrap
  routes/search.ts       # /api/search route
  services/
    playerok.ts          # Playerok provider (stub)
    funpay.ts            # FunPay provider (stub)
    starvell.ts          # Starvell provider (stub)
    beepro.ts            # BeePro provider (stub)
  types/item.ts          # Shared Item / Provider types
```

Providers currently return empty arrays — no fake data. Wire real API
calls or parsers inside each `services/*.ts` file. The route will
automatically pick them up.

## Dev

```bash
cd backend
npm install
npm run dev
```

Server listens on `http://localhost:${PORT:-3001}`.
