"use client";

import { Activity } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { FinancialHealthScore } from "@/domain/finance/financial-health-score";
import { cn } from "@/lib/utils";

import { CardShell } from "./CardShell";

function levelMeta(level: FinancialHealthScore["level"]): {
  label: string;
  chip: string;
} {
  switch (level) {
    case "excellent":
      return {
        label: "Sangat baik",
        chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
      };
    case "good":
      return {
        label: "Baik",
        chip: "bg-primary/15 text-primary",
      };
    case "fair":
      return {
        label: "Cukup",
        chip: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
      };
    case "poor":
      return {
        label: "Perlu perhatian",
        chip: "bg-destructive/15 text-destructive",
      };
  }
}

export function FinancialHealthCard({
  financialHealth,
  simulationActive = false,
  className,
}: Readonly<{
  financialHealth: FinancialHealthScore;
  simulationActive?: boolean;
  className?: string;
}>) {
  const { score, level, reasons } = financialHealth;
  const meta = levelMeta(level);

  return (
    <CardShell className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <Activity
            className="mt-0.5 size-5 shrink-0 text-primary"
            aria-hidden
          />
          <div className="min-w-0">
            <h2 className="font-heading text-base font-bold text-foreground">
              Financial Health Score
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {simulationActive
                ? "Pratinjau realtime dari slider simulasi di bawah"
                : "Ringkas dari stabilitas, tabungan, ritme belanja, dan mix kategori"}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
            meta.chip,
          )}
        >
          {meta.label}
        </span>
      </div>

      <div className="mt-4 flex items-end gap-2">
        <p className="text-4xl font-bold tabular-nums tracking-tight text-foreground">
          {score}
        </p>
        <span className="pb-1.5 text-sm font-semibold text-muted-foreground">
          / 100
        </span>
      </div>
      <Progress className="mt-3 h-2" value={score} />

      <ul className="mt-4 space-y-1.5">
        {reasons.map((line, i) => (
          <li
            key={`${i}-${line.slice(0, 24)}`}
            className="text-sm leading-snug text-foreground"
          >
            {line}
          </li>
        ))}
      </ul>
    </CardShell>
  );
}
