"use client";

import { CalendarRange } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { MonthlyFinancialSnapshot } from "@/lib/dashboard/monthly-snapshot";
import { formatIDRFull } from "@/lib/finance";
import { cn } from "@/lib/utils";

import { CardShell } from "./CardShell";

function sentimentStyles(sentiment: MonthlyFinancialSnapshot["lines"][0]["sentiment"]) {
  switch (sentiment) {
    case "alert":
      return "border-l-orange-500 bg-orange-500/[0.06]";
    case "positive":
      return "border-l-emerald-500 bg-emerald-500/[0.06]";
    default:
      return "border-l-muted-foreground/40 bg-muted/40";
  }
}

export function MonthlySnapshotCard({
  snapshot,
  className,
}: Readonly<{
  snapshot: MonthlyFinancialSnapshot;
  className?: string;
}>) {
  const { lines, savings } = snapshot;

  return (
    <CardShell className={cn("p-5", className)}>
      <div className="flex items-start gap-2">
        <CalendarRange
          className="mt-0.5 size-5 shrink-0 text-primary"
          aria-hidden
        />
        <div className="min-w-0">
          <h2 className="font-heading text-base font-bold text-foreground">
            Ringkasan bulan ini
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Bandingkan pola pengeluaran dengan bulan lalu
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {lines.map((line) => (
          <li
            key={line.id}
            className={cn(
              "rounded-xl border border-transparent border-l-4 px-3 py-2.5",
              sentimentStyles(line.sentiment),
            )}
          >
            <p className="text-sm font-semibold text-foreground">{line.title}</p>
            {line.subtitle ? (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {line.subtitle}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl bg-muted/50 p-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Target tabungan
          </p>
          <p className="text-xs font-semibold tabular-nums text-foreground">
            {formatIDRFull(savings.savedAmount)} /{" "}
            {formatIDRFull(savings.goalAmount)}
          </p>
        </div>
        <Progress className="mt-2 h-2" value={savings.pct} />
        <p className="mt-2 text-center text-xs font-semibold tabular-nums text-primary">
          Tercapai {savings.pct}%
        </p>
      </div>
    </CardShell>
  );
}
