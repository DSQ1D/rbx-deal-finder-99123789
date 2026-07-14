# RBXDeals

A Roblox marketplace deal aggregator. Search for items across multiple third-party Roblox marketplaces (Playerok, FunPay, Starvell, BeePro), compare prices, save favourites, and track price drops.

The UI is in Russian.

## Stack

- **Frontend**: TanStack Start (SSR) + React 19 + TanStack Router + Tailwind v4 + shadcn/ui
- **Backend**: Node.js + Express + TypeScript (separate service in `./backend/`)
- **Package manager**: Bun (frontend) / npm (backend)
- **Build tool**: Vite via `@lovable.dev/vite-tanstack-config`

## Running the app

```bash
bun run dev        # starts the frontend dev server on port 8080
```

The workflow **Start application** runs `bun run dev` automatically.

To run the backend API separately:

```bash
cd backend && npm run dev   # starts Express on port 3001
```

## Project structure

```
src/
  routes/          # TanStack Router file-based routes (search, favorites, compare, tracking, history, about)
  components/      # AppShell, DealCard, EmptyState + shadcn/ui primitives
  lib/
    deals-api.ts   # Provider aggregator — register real providers here
    store.ts       # Zustand store (favorites, compare, tracking, history)
    types.ts       # Shared TypeScript types
backend/
  src/
    server.ts      # Express entrypoint (port 3001)
    routes/        # /api/search route
    services/      # Marketplace provider stubs (Playerok, FunPay, Starvell, BeePro)
```

## Adding marketplace providers

All four backend providers in `backend/src/services/` are stubs returning `[]`.
Wire real HTTP calls or scrapers there, then register the frontend-side providers in `src/lib/deals-api.ts`.

## Notes

- The `@lovable.dev/vite-tanstack-config` package defaults to `host: "::"` (IPv6). Replit doesn't support IPv6, so `vite.config.ts` overrides it to `host: "0.0.0.0"`.
- No external API keys are currently required — the providers are stubs.
