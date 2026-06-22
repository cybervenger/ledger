"use client";

import { useMemo, useState } from "react";
import { useLivePortfolio } from "@/hooks/useLivePortfolio";
import { AllocationRing } from "@/components/AllocationRing";
import { HoldingsTable } from "@/components/HoldingsTable";

function fmtINR(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

function timeAgo(ts: number | null) {
  if (!ts) return "—";
  const sec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  return `${min}m ago`;
}

export default function Home() {
  const { holdings, lastUpdated, isLoading, anyLive, flashDirection, refresh } = useLivePortfolio();
  const [, forceTick] = useState(0);

  const total = useMemo(() => holdings.reduce((s, h) => s + h.value, 0), [holdings]);
  const totalPnl = useMemo(() => {
    const withCost = holdings.filter((h) => h.pnl !== null);
    if (withCost.length === 0) return null;
    return withCost.reduce((s, h) => s + (h.pnl ?? 0), 0);
  }, [holdings]);

  const dayChangeValue = useMemo(() => {
    return holdings.reduce((s, h) => {
      if (h.changePercent === null) return s;
      const prevValue = h.value / (1 + h.changePercent / 100);
      return s + (h.value - prevValue);
    }, 0);
  }, [holdings]);

  const dayChangePct = total > 0 ? (dayChangeValue / (total - dayChangeValue)) * 100 : 0;
  const isDayUp = dayChangeValue >= 0;

  return (
    <main className="flex-1 px-4 sm:px-8 py-8 max-w-[1100px] w-full mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: anyLive ? "var(--lime)" : "var(--text-faint)" }}
          />
          <h1 className="text-lg font-semibold tracking-tight">Ledger</h1>
        </div>
        <button
          onClick={() => {
            refresh();
            forceTick((t) => t + 1);
          }}
          disabled={isLoading}
          className="text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          style={{ border: "1px solid var(--border-bright)", color: "var(--text-dim)" }}
        >
          {isLoading ? "refreshing…" : `refresh · ${timeAgo(lastUpdated)}`}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>
            Total value
          </div>
          <div className="text-3xl font-mono-num font-bold tabular-nums">₹{fmtINR(total)}</div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>
            Day change
          </div>
          <div
            className="text-3xl font-mono-num font-bold tabular-nums"
            style={{ color: isDayUp ? "var(--lime)" : "var(--red)" }}
          >
            {isDayUp ? "+" : ""}
            {dayChangePct.toFixed(2)}%
          </div>
          <div className="text-xs font-mono-num mt-1" style={{ color: "var(--text-faint)" }}>
            {isDayUp ? "+" : ""}₹{fmtINR(Math.abs(dayChangeValue))}
          </div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>
            Holdings tracked
          </div>
          <div className="text-3xl font-mono-num font-bold tabular-nums">{holdings.length}</div>
          {totalPnl !== null && (
            <div className="text-xs font-mono-num mt-1" style={{ color: "var(--text-faint)" }}>
              P&amp;L needs avg cost — add to holdings.ts
            </div>
          )}
        </div>
      </div>

      <div
        className="rounded-2xl p-6 mb-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <AllocationRing holdings={holdings} total={total} />
      </div>

      <HoldingsTable holdings={holdings} total={total} flashDirection={flashDirection} />

      <p className="text-xs mt-6 text-center" style={{ color: "var(--text-faint)" }}>
        Prices via Yahoo Finance, ~15 min delayed. Auto-refreshes every 30s while this tab is open. Not for trading decisions.
      </p>
    </main>
  );
}
