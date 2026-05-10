import type { DashboardInsight } from "@/lib/insights/types";

import type { FinlyInsightEngineInput } from "@/lib/insights/engine-input";
import { generatePredictionInsights } from "@/lib/insights/prediction-insights";
import { generateSavingsInsights } from "@/lib/insights/savings-insights";
import { generateSpendingInsights } from "@/lib/insights/spending-insights";

export type { FinlyInsightEngineInput } from "@/lib/insights/engine-input";

/** Urutan tampil: lebih tinggi = lebih dulu. */
const PRIORITY_SCORE: Readonly<Record<string, number>> = {
  "balance-depleted": 110,
  "balance-runway": 100,
  "daily-over-limit": 95,
  "week-spike": 88,
  "food-category-heavy-month": 82,
  "savings-category-gap": 76,
  "savings-category-up": 74,
  "healthy-week-down": 72,
  "safe-daily-calendar": 68,
  "daily-within-limit": 40,
};

function insightScore(insight: DashboardInsight): number {
  return PRIORITY_SCORE[insight.id] ?? 50;
}

/** Gabungkan modul insight dan urutkan prioritas (tanpa potong — slice di summary / lainnya). */
export function generateFinlyInsights(
  input: FinlyInsightEngineInput,
): DashboardInsight[] {
  const combined: DashboardInsight[] = [
    ...generatePredictionInsights(input),
    ...generateSpendingInsights(input),
    ...generateSavingsInsights(input),
  ];

  combined.sort((a, b) => insightScore(b) - insightScore(a));

  return combined;
}
