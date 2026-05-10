import { formatIDR, formatIDRFull } from "@/lib/finance";
import type { DashboardInsight } from "@/lib/insights/types";

import type { FinlyInsightEngineInput } from "@/lib/insights/engine-input";

/** Batas atas hari runway untuk menyimpan insight sebagai angka masuk akal di UI. */
const RUNWAY_CAP_DAYS = 365;

/** Daily safe (saldo / sisa hari bulan) + burn runway dari rata-rata pengeluaran bulan ini. */
export function generatePredictionInsights(
  input: FinlyInsightEngineInput,
): DashboardInsight[] {
  const {
    balance,
    spentThisMonth,
    dayOfMonth,
    daysLeftInMonth,
  } = input;

  const out: DashboardInsight[] = [];
  const safeDaysLeft = Math.max(1, daysLeftInMonth);

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

  if (balance > 0) {
    const safeDaily = balance / safeDaysLeft;
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

  const dailyBurn = spentThisMonth / Math.max(1, dayOfMonth);
  if (balance > 0 && dailyBurn > 0) {
    const rawDays = balance / dailyBurn;
    const daysUntilEmpty = Math.max(1, Math.floor(rawDays));
    if (daysUntilEmpty <= RUNWAY_CAP_DAYS) {
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
