import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Clock, Shield } from "lucide-react";

import { formatIDRFull } from "@/lib/finance";
import { cn } from "@/lib/utils";

import { MOCK_SPENT_TODAY } from "../../addExpense.constants";
import { type SpendStatus, getDailySpendSummary } from "../../addExpense.utils";

const STATUS_PRESENTATION: Record<
  SpendStatus,
  { ring: string; chip: string; Icon: LucideIcon; msg: string }
> = {
  safe: {
    ring: "ring-emerald-500/35",
    chip: "bg-white/15 text-white",
    Icon: Shield,
    msg: "Masih aman, lanjut santai 👍",
  },
  warn: {
    ring: "ring-secondary/45",
    chip: "bg-secondary/90 text-secondary-foreground",
    Icon: AlertTriangle,
    msg: "Mendekati batas harian ⚠️",
  },
  over: {
    ring: "ring-destructive/50",
    chip: "bg-destructive/90 text-destructive-foreground",
    Icon: AlertTriangle,
    msg: "Akan melewati batas harianmu",
  },
};

export function ExpenseAmountHeroCard({
  animatedDigits,
  summary,
}: Readonly<{
  animatedDigits: string;
  summary: ReturnType<typeof getDailySpendSummary>;
}>) {
  const ui = STATUS_PRESENTATION[summary.status];
  const StatusIcon = ui.Icon;
  const fillPct = Math.min(100, summary.ratio * 100);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-emerald-600 p-6 text-primary-foreground shadow-[0_16px_48px_rgba(0,0,0,0.18)] ring-1 ring-white/15 transition-all dark:shadow-[0_16px_48px_rgba(0,0,0,0.45)]",
        ui.ring,
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 size-32 rounded-full bg-primary/25 blur-2xl" />

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">
          Jumlah pengeluaran
        </p>
        <span
          className={cn(
            "inline-flex max-w-[58%] items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-tight",
            ui.chip,
          )}
        >
          <StatusIcon className="size-3.5 shrink-0" aria-hidden />
          <span className="wrap-break-word">{ui.msg}</span>
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-primary-foreground/80">
          Rp
        </span>
        <span className="font-heading text-[44px] font-bold leading-none tracking-tight tabular-nums">
          {animatedDigits}
        </span>
      </div>

      <div className="mt-5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              summary.status === "over"
                ? "bg-destructive"
                : summary.status === "warn"
                  ? "bg-secondary"
                  : "bg-white",
            )}
            style={{ width: `${fillPct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-primary-foreground/85">
          <span className="inline-flex min-w-0 items-center gap-1">
            <Clock className="size-3 shrink-0" aria-hidden />
            <span className="truncate">
              Hari ini terpakai {formatIDRFull(MOCK_SPENT_TODAY)}
            </span>
          </span>
          <span className="shrink-0 font-semibold text-white">
            Sisa aman {formatIDRFull(summary.remaining)}
          </span>
        </div>
      </div>
    </div>
  );
}
