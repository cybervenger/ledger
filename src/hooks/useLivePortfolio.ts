"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { holdings } from "@/data/holdings";
import type { EnrichedHolding, QuotesResponse } from "@/types";

const POLL_INTERVAL_MS = 30_000;

export function useLivePortfolio() {
  const [enriched, setEnriched] = useState<EnrichedHolding[]>(() =>
    holdings.map((h) => ({
      symbol: h.symbol,
      name: h.name,
      qty: h.qty,
      avgCost: h.avgCost,
      cmp: h.cmpFallback,
      changePercent: null,
      isLive: false,
      value: h.qty * h.cmpFallback,
      pnl: h.avgCost ? (h.cmpFallback - h.avgCost) * h.qty : null,
      pnlPercent: h.avgCost ? ((h.cmpFallback - h.avgCost) / h.avgCost) * 100 : null,
    }))
  );
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [anyLive, setAnyLive] = useState(false);
  const [flashDirection, setFlashDirection] = useState<Record<string, "up" | "down">>({});
  const prevPrices = useRef<Record<string, number>>({});

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/quotes", { cache: "no-store" });
      const data: QuotesResponse = await res.json();

      const flashes: Record<string, "up" | "down"> = {};

      setEnriched((current) =>
        current.map((h) => {
          const q = data.quotes[h.symbol];
          const fallback = holdings.find((x) => x.symbol === h.symbol)!.cmpFallback;
          const cmp = q && !q.stale && q.price ? q.price : h.cmp || fallback;

          const prev = prevPrices.current[h.symbol];
          if (prev !== undefined && cmp !== prev) {
            flashes[h.symbol] = cmp > prev ? "up" : "down";
          }
          prevPrices.current[h.symbol] = cmp;

          const value = h.qty * cmp;
          const pnl = h.avgCost ? (cmp - h.avgCost) * h.qty : null;
          const pnlPercent = h.avgCost ? ((cmp - h.avgCost) / h.avgCost) * 100 : null;

          return {
            ...h,
            cmp,
            changePercent: q?.changePercent ?? h.changePercent,
            isLive: !!q && !q.stale,
            value,
            pnl,
            pnlPercent,
          };
        })
      );

      setFlashDirection(flashes);
      setAnyLive(data.ok);
      setLastUpdated(data.fetchedAt);
    } catch {
      setAnyLive(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    if (Object.keys(flashDirection).length === 0) return;
    const t = setTimeout(() => setFlashDirection({}), 1200);
    return () => clearTimeout(t);
  }, [flashDirection]);

  return { holdings: enriched, lastUpdated, isLoading, anyLive, flashDirection, refresh };
}
