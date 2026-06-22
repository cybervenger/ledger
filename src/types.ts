export interface QuoteOut {
  symbol: string;
  price: number | null;
  prevClose: number | null;
  changePercent: number | null;
  asOf: number | null;
  stale: boolean;
}

export interface QuotesResponse {
  quotes: Record<string, QuoteOut>;
  fetchedAt: number;
  ok: boolean;
}

export interface EnrichedHolding {
  symbol: string;
  name: string;
  qty: number;
  avgCost?: number;
  cmp: number;
  changePercent: number | null;
  isLive: boolean;
  value: number;
  pnl: number | null;
  pnlPercent: number | null;
}
