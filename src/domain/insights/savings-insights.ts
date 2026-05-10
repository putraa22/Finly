import { formatIDRFull } from "@/formatters/currency";
import type { DashboardInsight } from "@/domain/insights/types";

import { parseEnvNumber, parseEnvPercent } from "@/domain/insights/env";
import type { FinlyInsightEngineInput } from "@/domain/insights/engine-input";

/** Minggu lebih hemat dari minggu lalu; tren kategori tabungan vs bulan lalu. */
export function generateSavingsInsights(
  input: FinlyInsightEngineInput,
): DashboardInsight[] {
  const {
    spentThisWeek,
    spentLastWeek,
    savingsSpendThisMonth,
    savingsSpendLastMonth,
  } = input;

  const healthyDropPct = parseEnvPercent("HEALTHY_WEEK_DROP_PCT", 15);
  const dropMultiplier = 1 - healthyDropPct / 100;
  const out: DashboardInsight[] = [];

  if (
    spentLastWeek > 0 &&
    spentThisWeek > 0 &&
    spentThisWeek < spentLastWeek * dropMultiplier
  ) {
    const pctDown = Math.round((1 - spentThisWeek / spentLastWeek) * 100);
    out.push({
      id: "healthy-week-down",
      kind: "encouragement",
      tone: "win",
      problem: `Pengeluaran minggu ini turun ${pctDown}% dari minggu lalu ✨`,
      impact: `Minggu ini ${formatIDRFull(spentThisWeek)} vs ${formatIDRFull(spentLastWeek)} minggu lalu.`,
      action: "Pertahankan pola hemat ini",
      quickAction: "auto-save",
    });
  }

  const savingsUpRatio = parseEnvPercent("SAVINGS_UP_RATIO_PCT", 10) / 100;
  if (
    savingsSpendLastMonth > 0 &&
    savingsSpendThisMonth >= savingsSpendLastMonth * (1 + savingsUpRatio)
  ) {
    out.push({
      id: "savings-category-up",
      kind: "encouragement",
      tone: "win",
      problem: "Alokasi tabungan bulan ini lebih besar 📈",
      impact: `Kategori tabungan ${formatIDRFull(savingsSpendThisMonth)} bulan ini vs ${formatIDRFull(savingsSpendLastMonth)} bulan lalu.`,
      action: "Teruskan kebiasaan menyisihkan dulu",
      quickAction: "auto-save",
    });
  } else if (
    savingsSpendLastMonth > 0 &&
    savingsSpendThisMonth === 0 &&
    savingsSpendLastMonth >=
      parseEnvNumber("SAVINGS_ABSENCE_ALERT_MIN", 50_000)
  ) {
    out.push({
      id: "savings-category-gap",
      kind: "spending_awareness",
      tone: "tip",
      problem: "Belum ada catatan tabungan bulan ini",
      impact: `Bulan lalu kamu mencatat ${formatIDRFull(savingsSpendLastMonth)} ke tabungan.`,
      action: "Sisihkan sedikit hari ini — konsistensi penting",
      quickAction: "fix",
    });
  }

  return out;
}
