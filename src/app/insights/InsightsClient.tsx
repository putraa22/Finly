"use client";

import { Sparkles } from "lucide-react";

import { CoachInsight, type QuickActionId } from "@/components/dashboard";
import { FALLBACK_INSIGHTS } from "@/lib/insights/fallback";
import type { DashboardInsight } from "@/lib/insights/types";
import { toast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useInsightUiStore, type InsightListFilter } from "@/store/insight-store";

import { QUICK_ACTION_FEEDBACK_COPY } from "../dashboard/quickAction.copy";

const FILTERS: ReadonlyArray<{ id: InsightListFilter; label: string }> = [
  { id: "all", label: "Semua" },
  { id: "warnings_only", label: "Peringatan saja" },
];

/** Kartu “peringatan” + perilaku seperti spike mingguan (`tone: warning`). */
function isWarningsOnlyInsight(insight: DashboardInsight): boolean {
  return (
    insight.kind === "warning" ||
    insight.tone === "urgent" ||
    insight.tone === "warning"
  );
}

export function InsightsClient({
  insightsAll,
}: Readonly<{ insightsAll: DashboardInsight[] }>) {
  const listFilter = useInsightUiStore((s) => s.listFilter);
  const setListFilter = useInsightUiStore((s) => s.setListFilter);

  const base =
    insightsAll.length > 0 ? insightsAll : FALLBACK_INSIGHTS;

  const visible =
    listFilter === "warnings_only"
      ? base.filter(isWarningsOnlyInsight)
      : base;

  const handleQuickAction = (action: QuickActionId) => {
    const copy = QUICK_ACTION_FEEDBACK_COPY[action];
    toast({
      title: copy.title,
      description: copy.description,
    });
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-28 pt-8 sm:max-w-lg md:max-w-xl lg:max-w-5xl">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" aria-hidden />
        <h1 className="font-heading text-lg font-bold text-foreground">
          Insights
        </h1>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Insight dari transaksi dan saldomu — diperbarui saat kamu membuka halaman
        ini.
      </p>

      <div
        className="mt-5 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter insight"
      >
        {FILTERS.map(({ id, label }) => {
          const active = listFilter === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setListFilter(id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <section className="mt-6 space-y-3" aria-live="polite">
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tidak ada insight dalam filter ini — coba &quot;Semua&quot;.
          </p>
        ) : (
          visible.map((insight, index) => {
            const showKindLabel =
              index === 0 ||
              insight.kind !== visible[index - 1]!.kind;

            const kindLabel =
              insight.kind === "warning"
                ? "Peringatan"
                : insight.kind === "encouragement"
                  ? "Semangat"
                  : insight.kind === "spending_awareness"
                    ? "Kesadaran pengeluaran"
                    : "Feedback perilaku";

            return (
              <div key={insight.id} className="space-y-2">
                {showKindLabel ? (
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {kindLabel}
                  </p>
                ) : null}
                <CoachInsight
                  tone={insight.tone}
                  priority={insight.priority}
                  problem={insight.problem}
                  impact={insight.impact}
                  action={insight.action}
                  onAction={
                    insight.quickAction
                      ? () =>
                          handleQuickAction(
                            insight.quickAction as QuickActionId,
                          )
                      : undefined
                  }
                />
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
