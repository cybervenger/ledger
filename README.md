# Ledger

A live NSE portfolio tracker. Dark, terminal-styled dashboard with a
30-second auto-refreshing price feed, allocation donut, and a sortable
holdings table that flashes green/red when a price ticks.

## How it works

- **Holdings** live in `src/data/holdings.ts` — a plain array of
  `{ symbol, name, qty, cmpFallback }`. Edit this file whenever you buy
  or sell. `symbol` is the bare NSE ticker (no `.NS` suffix).
- **Live prices** come from `/api/quotes`, a server-side Next.js route
  that hits Yahoo Finance's chart endpoint per symbol (so one bad/illiquid
  ticker can't take down the rest of the batch). This has to run
  server-side — Yahoo blocks browser-origin requests, and a server route
  also means you never expose any credentials to the client.
- **No login, no API key.** Prices are delayed roughly 15 minutes, which
  is the standard delay on free Yahoo Finance data. That's a fine
  trade-off for a personal tracker; it is not for placing trades.
- If a symbol fails to resolve (demerged entities, very illiquid small
  caps, Yahoo rate-limiting you), the UI falls back to the last known
  price from `holdings.ts` and shows a small dot next to the price
  instead of treating it as live.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploying

This is a stock Next.js app — push to GitHub, then import the repo at
[vercel.com/new](https://vercel.com/new). No environment variables are
required for the default Yahoo Finance setup. Every push to `main`
redeploys automatically.

## Adding optional P&L tracking

`Holding` in `holdings.ts` has an optional `avgCost` field. Set it per
stock and the dashboard will start showing P&L — it's left blank by
default since average cost isn't something to commit to git if you'd
rather keep it private to a local-only branch or `.env`.

## Swapping the data source later

Everything price-related is isolated in `src/app/api/quotes/route.ts`.
To switch to a paid/broker data feed (Zerodha Kite Connect, etc.), only
that file needs to change — the response shape (`{ price, prevClose,
changePercent, asOf, stale }` per symbol) is what the frontend expects,
not where the data came from.

## Disclaimer

Personal-use price tracker. Data is delayed and provided as-is; this
project is not a substitute for your broker's app and shouldn't be used
to make trading decisions.
