"use client";

import { useMemo, useState } from "react";
import type { EnrichedHolding } from "@/types";
import { colorFor } from "./AllocationRing";

type SortKey = "value" | "name" | "qty" | "cmp" | "change";

function fmtINR(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

function fmtPrice(n: number) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function HoldingsTable({
  holdings,
  total,
  flashDirection,
}: {
  holdings: EnrichedHolding[];
  total: number;
  flashDirection: Record<string, "up" | "down">;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  const colorBySymbol = useMemo(() => {
    const byValue = [...holdings].sort((a, b) => b.value - a.value);
    const map: Record<string, string> = {};
    byValue.forEach((h, i) => (map[h.symbol] = colorFor(i)));
    return map;
  }, [holdings]);

  const sorted = useMemo(() => {
    const arr = [...holdings];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "value":
          cmp = a.value - b.value;
          break;
        case "name":
          cmp = a.symbol.localeCompare(b.symbol);
          break;
        case "qty":
          cmp = a.qty - b.qty;
          break;
        case "cmp":
          cmp = a.cmp - b.cmp;
          break;
        case "change":
          cmp = (a.changePercent ?? -999) - (b.changePercent ?? -999);
          break;
      }
      return cmp * sortDir;
    });
    return arr;
  }, [holdings, sortKey, sortDir]);

  const maxValue = Math.max(...holdings.map((h) => h.value), 1);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(-1);
    }
  }

  const headers: { key: SortKey; label: string; align: "left" | "right" }[] = [
    { key: "name", label: "Stock", align: "left" },
    { key: "cmp", label: "CMP", align: "right" },
    { key: "change", label: "Chg%", align: "right" },
    { key: "qty", label: "Qty", align: "right" },
    { key: "value", label: "Value", align: "right" },
    { key: "value", label: "Weight", align: "left" },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {headers.map((h, i) => (
                <th
                  key={h.label + i}
                  onClick={() => i !== 5 && toggleSort(h.key)}
                  className={`px-4 py-3 font-medium select-none ${i !== 5 ? "cursor-pointer" : ""}`}
                  style={{
                    textAlign: h.align,
                    color: sortKey === h.key && i !== 5 ? "var(--lime)" : "var(--text-faint)",
                    fontSize: "12px",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {h.label}
                  {sortKey === h.key && i !== 5 && (sortDir === 1 ? " ↑" : " ↓")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((h) => {
              const pct = total > 0 ? (h.value / total) * 100 : 0;
              const barWidth = (h.value / maxValue) * 100;
              const flash = flashDirection[h.symbol];
              const isUp = (h.changePercent ?? 0) >= 0;

              return (
                <tr
                  key={h.symbol}
                  style={{ borderBottom: "1px solid var(--border)" }}
                  className="transition-colors hover:bg-[var(--surface-2)]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: colorBySymbol[h.symbol] }}
                      />
                      <div className="min-w-0">
                        <div className="font-medium leading-tight">{h.symbol}</div>
                        <div className="text-xs truncate" style={{ color: "var(--text-faint)" }}>
                          {h.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono-num tabular-nums rounded ${
                      flash === "up" ? "flash-up" : flash === "down" ? "flash-down" : ""
                    }`}
                  >
                    ₹{fmtPrice(h.cmp)}
                    {!h.isLive && (
                      <span className="ml-1.5" style={{ color: "var(--text-faint)", fontSize: "10px" }} title="Last known price, not live">
                        ·
                      </span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3 text-right font-mono-num tabular-nums"
                    style={{ color: h.changePercent === null ? "var(--text-faint)" : isUp ? "var(--lime)" : "var(--red)" }}
                  >
                    {h.changePercent === null ? "—" : `${isUp ? "+" : ""}${h.changePercent.toFixed(2)}%`}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-num tabular-nums" style={{ color: "var(--text-dim)" }}>
                    {h.qty}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-num tabular-nums font-medium">
                    ₹{fmtINR(h.value)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1.5 rounded-full flex-1 overflow-hidden"
                        style={{ background: "var(--surface-2)", minWidth: "40px" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${barWidth}%`, background: colorBySymbol[h.symbol] }}
                        />
                      </div>
                      <span className="font-mono-num text-xs w-10 text-right" style={{ color: "var(--text-faint)" }}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
