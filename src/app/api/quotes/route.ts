import { NextResponse } from "next/server";
import { holdings } from "@/data/holdings";

// Server-side fetch only — this is exactly why it has to be an API route
// rather than a browser fetch: Yahoo Finance blocks cross-origin requests,
// and this is also where we'd plug in a paid data source later without
// touching the frontend at all.

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface QuoteOut {
  symbol: string;
  price: number | null;
  prevClose: number | null;
  changePercent: number | null;
  asOf: number | null;
  stale: boolean;
}

// The old /v7/finance/quote batch endpoint now sits behind Yahoo's
// cookie+crumb auth wall and fails unpredictably on unauthenticated
// requests. /v8/finance/chart/{symbol} is the endpoint yfinance and most
// scrapers now use instead — single-symbol only, so we fetch in parallel
// and let each ticker fail independently instead of one bad symbol (e.g.
// a demerged entity not yet indexed) killing the whole batch.
const CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

async function fetchOne(symbol: string): Promise<QuoteOut> {
  const url = `${CHART_URL}/${symbol}.NS?interval=1d&range=1d`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { symbol, price: null, prevClose: null, changePercent: null, asOf: null, stale: true };
    }

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    const meta = result?.meta;

    if (!meta || typeof meta.regularMarketPrice !== "number") {
      return { symbol, price: null, prevClose: null, changePercent: null, asOf: null, stale: true };
    }

    const price = meta.regularMarketPrice;
    const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? null;
    const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : null;

    return {
      symbol,
      price,
      prevClose,
      changePercent,
      asOf: meta.regularMarketTime ? meta.regularMarketTime * 1000 : Date.now(),
      stale: false,
    };
  } catch {
    return { symbol, price: null, prevClose: null, changePercent: null, asOf: null, stale: true };
  }
}

export async function GET() {
  const symbols = holdings.map((h) => h.symbol);

  const results = await Promise.all(symbols.map((s) => fetchOne(s)));

  const out: Record<string, QuoteOut> = {};
  let anySuccess = false;
  for (const r of results) {
    out[r.symbol] = r;
    if (!r.stale) anySuccess = true;
  }

  return NextResponse.json({
    quotes: out,
    fetchedAt: Date.now(),
    ok: anySuccess,
  });
}
