"use client";

import { TrendingDown, TrendingUp, Minus } from "lucide-react";

import { CATEGORIES, formatIDRFull } from "@/lib/finance";
import { cn } from "@/lib/utils";

import { CardShell } from "./CardShell";

export type SpendingBreakdownItem = Readonly<{
  categoryId: string;
  amount: number;
  trend?: number;
  flag?: "problem" | "good" | null;
}>;

export type SpendingBreakdownProps = Readonly<{
  className?: string;
  items: SpendingBreakdownItem[];
  total: number;
  onDetail?: () => void;
}>;

const BAR_SEGMENT_CLASSES = [
  "bg-primary",
  "bg-secondary",
  "bg-chart-3",
  "bg-destructive",
  "bg-emerald-500/70",
  "bg-muted-foreground",
] as const;

export function SpendingBreakdown({
  className,
  items,
  total,
  onDetail,
}: SpendingBreakdownProps) {
  const sorted = [...items].sort((a, b) => b.amount - a.amount);
  const safeTotal = Math.max(1, total);

  return (
    <CardShell className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-bold text-foreground">
            Ke mana uangmu pergi
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Bulan ini · {sorted.length} kategori
          </p>
        </div>
        <button
          type="button"
          onClick={onDetail}
          className="shrink-0 text-xs font-semibold text-primary"
        >
          Detail
        </button>
      </div>

      <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {sorted.map((it, i) => {
          const pct = (it.amount / safeTotal) * 100;
          return (
            <div
              key={it.categoryId}
              className={cn(
                BAR_SEGMENT_CLASSES[i % BAR_SEGMENT_CLASSES.length],
                "min-w-0 transition-all duration-500 ease-out",
              )}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>

      <ul className="mt-5 space-y-3.5">
        {sorted.slice(0, 4).map((it) => {
          const cat = CATEGORIES.find((c) => c.id === it.categoryId);
          const pct = Math.round((it.amount / safeTotal) * 100);
          const trend = it.trend ?? 0;
          const isProblem = it.flag === "problem";
          const isGood = it.flag === "good";

          return (
            <li key={it.categoryId} className="flex items-center gap-3">
              <div
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-2xl text-lg leading-none",
                  cat?.color ?? "bg-muted",
                )}
              >
                <span aria-hidden>{cat?.emoji ?? "•"}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {cat?.label ?? it.categoryId}
                  </p>
                  <p className="shrink-0 tabular-nums text-sm font-semibold text-foreground">
                    {formatIDRFull(it.amount)}
                  </p>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    {pct}%
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                      isProblem && "bg-destructive/15 text-destructive",
                      isGood &&
                        "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
                      !isProblem &&
                        !isGood &&
                        "bg-muted text-muted-foreground",
                    )}
                  >
                    {trend > 0 ? (
                      <TrendingUp className="h-3 w-3" aria-hidden />
                    ) : trend < 0 ? (
                      <TrendingDown className="h-3 w-3" aria-hidden />
                    ) : (
                      <Minus className="h-3 w-3" aria-hidden />
                    )}
                    {trend > 0 ? `+${trend}%` : `${trend}%`} vs minggu lalu
                  </span>
                  {isGood ? (
                    <span className="text-[11px]" aria-hidden>
                      👍
                    </span>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </CardShell>
  );
}
