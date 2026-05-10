import {
  computeBurnRate,
  computeSafeDailyBudget,
  DASHBOARD_RUNWAY_CAP_DAYS,
} from "@/domain/finance/dashboard-derived-metrics";
import { formatIDR, formatIDRFull } from "@/formatters/currency";
import type { DashboardInsight } from "@/domain/insights/types";

import type { FinlyInsightEngineInput } from "@/domain/insights/engine-input";

/** Daily safe (saldo / sisa hari bulan) + burn runway dari rata-rata pengeluaran bulan ini. */
export function generatePredictionInsights(
  input: FinlyInsightEngineInput,
): DashboardInsight[] {
  const {
    balance,
    spentThisMonth,
    dayOfMonth,
    daysLeftInMonth,
    remainingBudget,
  } = input;

  const out: DashboardInsight[] = [];

  if (balance <= 0 && spentThisMonth > 0) {
    out.push({
      id: "balance-depleted",
      kind: "warning",
      tone: "urgent",
      priority: "high",
      problem: "Saldo perhitungan sudah di bawah nol 📉",
      impact:
        "Pengeluaran terakumulasi melebihi saldo awal yang dikonfigurasi.",
      action: "Tinjau transaksi besar atau sesuaikan saldo awal di pengaturan",
      quickAction: "fix",
    });
    return out;
  }

  const safeDaysLeft = Math.max(1, daysLeftInMonth);
  const { balanceCalendarPerDay } = computeSafeDailyBudget({
    balance,
    remainingBudget,
    daysLeftInMonth,
  });

  if (balance > 0) {
    const safeDaily = balanceCalendarPerDay;
    out.push({
      id: "safe-daily-calendar",
      kind: "spending_awareness",
      tone: "tip",
      problem: `Aman dipakai ${formatIDR(safeDaily)}/hari.`,
      impact: `Dibagi ${safeDaysLeft} hari tersisa bulan ini dari saldo ${formatIDRFull(balance)}.`,
      action: "Sesuaikan jika ada pemasukan atau pengeluaran besar mendatang",
      quickAction: "set-limit",
    });
  }

  const { dailyBurn } = computeBurnRate({ spentThisMonth, dayOfMonth });
  if (balance > 0 && dailyBurn > 0) {
    const rawDays = balance / dailyBurn;
    const daysUntilEmpty = Math.max(1, Math.floor(rawDays));
    if (daysUntilEmpty <= DASHBOARD_RUNWAY_CAP_DAYS) {
      const urgentRunway = daysUntilEmpty <= daysLeftInMonth;
      out.push({
        id: "balance-runway",
        kind: "warning",
        tone: urgentRunway ? "urgent" : "warning",
        ...(urgentRunway ? { priority: "high" as const } : {}),
        problem: `Perkiraan saldo habis dalam ${daysUntilEmpty} hari 🔥`,
        impact: `Rata-rata keluar harian bulan ini ~${formatIDRFull(Math.round(dailyBurn))} dari ${formatIDRFull(spentThisMonth)} (${dayOfMonth} hari).`,
        action:
          daysUntilEmpty <= daysLeftInMonth
            ? "Perketat pengeluaran atau tambah pemasukan sebelum akhir bulan"
            : "Pantau ritme ini — masih ada ruang jika pengeluaran stabil",
        quickAction: "set-limit",
      });
    }
  }

  return out;
}
