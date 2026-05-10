import type { DashboardInsight } from "@/domain/insights/types";
import type { FinlyInsightEngineInput } from "@/domain/insights/engine-input";

import { generatePredictionInsights } from "@/domain/insights/prediction-insights";
import {
  detectSpendingPatterns,
  patternsToDashboardInsights,
} from "@/domain/insights/pattern-detector";
import type { PatternTxRow } from "@/domain/insights/pattern-detector";
import { insightPriorityWeight } from "@/domain/insights/insight-priority-weights";
import { generateSavingsInsights } from "@/domain/insights/savings-insights";
import { generateSpendingInsights } from "@/domain/insights/spending-insights";

export type { FinlyInsightEngineInput } from "@/domain/insights/engine-input";
export type { PatternFinding, PatternTxRow } from "@/domain/insights/pattern-detector";

/** Konteks pola pengeluaran (opsional) — diisi dari persistence transaksi + agregat. */
export type FinlyPatternDetectorContext = Readonly<{
  now: Date;
  transactions: readonly PatternTxRow[];
  monthShoppingSpend?: number;
  prevMonthShoppingSpend?: number;
  weekSpikeWarnPct: number;
}>;

function insightScore(insight: DashboardInsight): number {
  return insightPriorityWeight(insight.id);
}

/** Hilangkan kartu pola spike jika insight minggu native sudah ada (isi sama). */
function dropDuplicateWeekSpikePatterns(
  insights: DashboardInsight[],
): DashboardInsight[] {
  const hasNative = insights.some((i) => i.id === "week-spike");
  if (!hasNative) return insights;
  return insights.filter((i) => i.id !== "pattern-week-spike");
}

/** Gabungkan modul insight dan urutkan prioritas (tanpa potong — slice di summary / lainnya). */
export function generateFinlyInsights(
  input: FinlyInsightEngineInput,
  patternContext?: FinlyPatternDetectorContext,
): DashboardInsight[] {
  const combined: DashboardInsight[] = [
    ...generatePredictionInsights(input),
    ...generateSpendingInsights(input),
    ...generateSavingsInsights(input),
  ];

  if (patternContext !== undefined) {
    const findings = detectSpendingPatterns({
      now: patternContext.now,
      transactions: patternContext.transactions,
      spentThisWeek: input.spentThisWeek,
      spentLastWeek: input.spentLastWeek,
      weekSpikeWarnPct: patternContext.weekSpikeWarnPct,
      monthShoppingSpend: patternContext.monthShoppingSpend,
      prevMonthShoppingSpend: patternContext.prevMonthShoppingSpend,
    });
    combined.push(...patternsToDashboardInsights(findings));
  }

  const merged = dropDuplicateWeekSpikePatterns(combined);
  merged.sort((a, b) => insightScore(b) - insightScore(a));

  return merged;
}
