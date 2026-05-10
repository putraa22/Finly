import { formatIDRFull } from "@/lib/finance";
import type { DashboardInsight } from "@/lib/insights/types";

import {
  parseEnvPercent,
  parseOptionalEnvAmount,
} from "@/lib/insights/env";
import type { FinlyInsightEngineInput } from "@/lib/insights/engine-input";

/** Overspending harian, spike minggu, dominasi kategori makan (basis bulan). */
export function generateSpendingInsights(
  input: FinlyInsightEngineInput,
): DashboardInsight[] {
  const {
    spentToday,
    spentThisWeek,
    spentLastWeek,
    dailyLimit,
    spentThisMonth,
    foodSpendThisMonth,
  } = input;

  const safeDailyLimit = Math.max(dailyLimit, 1);
  const spikePct = parseEnvPercent("SPIKE_WEEK_PCT", 20);
  const foodMonthSharePct = parseEnvPercent("FOOD_MONTH_SHARE_ALERT", 40);
  const foodMonthRatio = foodMonthSharePct / 100;
  const foodAmountAlert = parseOptionalEnvAmount("FOOD_MONTHLY_AMOUNT_ALERT");

  const out: DashboardInsight[] = [];

  if (spentToday > safeDailyLimit) {
    out.push({
      id: "daily-over-limit",
      kind: "warning",
      tone: "urgent",
      priority: "high",
      problem: "Pengeluaran hari ini mulai tinggi ⚠️",
      impact: `Hari ini ${formatIDRFull(spentToday)}, melewati limit harian ${formatIDRFull(safeDailyLimit)}.`,
      action: "Atur limit atau kurangi pengeluaran sore ini",
      quickAction: "set-limit",
    });
  } else {
    out.push({
      id: "daily-within-limit",
      kind: "encouragement",
      tone: "win",
      problem: "Pengeluaran hari ini masih aman 👍",
      impact:
        spentToday > 0
          ? `Total hari ini ${formatIDRFull(spentToday)} — masih di bawah limit ${formatIDRFull(safeDailyLimit)}.`
          : `Belum ada pengeluaran hari ini — limit harian ${formatIDRFull(safeDailyLimit)}.`,
      action: "Pertahankan ritme ini",
      quickAction: "auto-save",
    });
  }

  const spikeMultiplier = 1 + spikePct / 100;
  if (
    spentLastWeek > 0 &&
    spentThisWeek > spentLastWeek * spikeMultiplier
  ) {
    const pctUp = Math.round((spentThisWeek / spentLastWeek - 1) * 100);
    out.push({
      id: "week-spike",
      kind: "spending_awareness",
      tone: "warning",
      problem: `Pengeluaran naik ${pctUp}% dibanding minggu lalu.`,
      impact: `Minggu ini ${formatIDRFull(spentThisWeek)} vs minggu lalu ${formatIDRFull(spentLastWeek)}.`,
      action: "Tinjau besar pengeluaran minggu ini",
      quickAction: "fix",
    });
  }

  const foodDominatesMonthShare =
    spentThisMonth > 0 &&
    foodSpendThisMonth / spentThisMonth >= foodMonthRatio;
  const foodDominatesMonthAmount =
    foodAmountAlert !== undefined &&
    foodSpendThisMonth >= foodAmountAlert;

  if (
    spentThisMonth > 0 &&
    (foodDominatesMonthShare || foodDominatesMonthAmount)
  ) {
    const sharePct = Math.round((foodSpendThisMonth / spentThisMonth) * 100);
    out.push({
      id: "food-category-heavy-month",
      kind: "behavioral_feedback",
      tone: "tip",
      problem: "Pengeluaran makan mulai mendominasi bulan ini 🍜",
      impact: `Makanan ${formatIDRFull(foodSpendThisMonth)} dari ${formatIDRFull(spentThisMonth)} bulan ini (${sharePct}% dari total).`,
      action: "Rencanakan meal prep atau batas kategori makan",
      quickAction: "set-limit",
    });
  }

  return out;
}
