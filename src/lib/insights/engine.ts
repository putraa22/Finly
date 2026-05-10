import { formatIDRFull } from "@/lib/finance";

import type { DashboardInsight } from "./types";

const MAX_INSIGHTS = 3;

export type InsightEngineInput = Readonly<{
  spentToday: number;
  spentThisWeek: number;
  spentLastWeek: number;
  spentThisMonth: number;
  dailyLimit: number;
  remainingBudget: number;
}>;

export function buildInsightsV1(input: InsightEngineInput): DashboardInsight[] {
  const { spentToday, spentThisWeek, spentLastWeek, dailyLimit, remainingBudget } =
    input;

  const out: DashboardInsight[] = [];

  const safeDailyLimit = Math.max(dailyLimit, 1);

  if (spentToday > safeDailyLimit) {
    out.push({
      id: "overspending-today",
      kind: "warning",
      tone: "urgent",
      priority: "high",
      problem: `Hari ini pengeluaranmu ${formatIDRFull(spentToday)} melewati limit harian ${formatIDRFull(safeDailyLimit)}.`,
      impact: "Risiko menghabiskan sisa budget lebih cepat jika pola ini berlanjut beberapa hari berturut-turut.",
      action: "Atur ulang limit harian atau kurangi pengeluaran esok",
      quickAction: "set-limit",
    });
  }

  if (
    out.length < MAX_INSIGHTS &&
    spentLastWeek > 0 &&
    spentThisWeek > spentLastWeek * 1.2
  ) {
    out.push({
      id: "spending-spike-week",
      kind: "warning",
      tone: "warning",
      problem: `Lonjakan minggu ini: ${formatIDRFull(spentThisWeek)} vs ${formatIDRFull(spentLastWeek)} minggu lalu (>20%).`,
      impact: "Pola mingguan lebih tinggi dari biasanya — bagus untuk disadari sebelum kebiasaan baru terbentuk.",
      action: "Tinjau 3 transaksi terbesar minggu ini",
      quickAction: "fix",
    });
  }

  if (out.length < MAX_INSIGHTS && remainingBudget > 0) {
    out.push({
      id: "safe-budget",
      kind: "encouragement",
      tone: "win",
      problem: `Masih ada sisa budget bulan ini: ${formatIDRFull(remainingBudget)}.`,
      impact: "Kamu masih dalam koridor yang terkendali untuk bulan berjalan.",
      action: "Pertahankan — bisa alokasikan ke tabungan kecil",
      quickAction: "auto-save",
    });
  }

  if (out.length < MAX_INSIGHTS) {
    out.push(buildSmartFeedback(input, out.some((i) => i.id === "spending-spike-week")));
  }

  return out.slice(0, MAX_INSIGHTS);
}

function buildSmartFeedback(
  input: InsightEngineInput,
  spikeAlreadyShown: boolean,
): DashboardInsight {
  const { spentThisWeek, spentLastWeek } = input;

  if (spentLastWeek > 0 && !spikeAlreadyShown) {
    const pct = Math.round((spentThisWeek / spentLastWeek - 1) * 100);
    const direction =
      pct > 0
        ? `${pct}% lebih tinggi dari minggu lalu`
        : pct < 0
          ? `${Math.abs(pct)}% lebih rendah dari minggu lalu`
          : "sejajar dengan minggu lalu";

    return {
      id: "feedback-week-compare",
      kind: "feedback",
      tone: "tip",
      problem: `Ringkasan minggu: ${formatIDRFull(spentThisWeek)} (${direction}).`,
      impact: "Membandingkan minggu ke minggu membantu melihat kebiasaan tanpa menghakimi.",
      action: "Lihat detail di Insight",
      quickAction: "challenge",
    };
  }

  if (spentThisWeek > 0) {
    return {
      id: "feedback-week-total",
      kind: "feedback",
      tone: "tip",
      problem: `Total minggu ini ${formatIDRFull(spentThisWeek)}.`,
      impact: "Terus catat transaksi supaya pola makin jelas dari waktu ke waktu.",
      action: "Tambah pengeluaran kalau ada yang terlewat",
      quickAction: "fix",
    };
  }

  return {
    id: "feedback-quiet-week",
    kind: "feedback",
    tone: "tip",
    problem: "Belum ada pengeluaran tercatat minggu ini.",
    impact: "Saat mulai ada transaksi, dashboard dan insight akan ikut bergerak.",
    action: "Catat pengeluaran pertama minggu ini",
    quickAction: "fix",
  };
}
