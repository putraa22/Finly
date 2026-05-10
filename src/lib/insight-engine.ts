import { formatIDRFull } from "@/lib/finance";
import type { DashboardInsight } from "@/lib/insights/types";

/** Env `SPIKE_WEEK_PCT` / `FOOD_WEEK_SHARE_ALERT`: angka persen (mis. 20 = 20%). */
function parseEnvPercent(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function parseOptionalEnvAmount(key: string): number | undefined {
  const raw = process.env[key];
  if (raw === undefined || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export type FinlyInsightEngineInput = Readonly<{
  spentToday: number;
  spentThisWeek: number;
  spentLastWeek: number;
  dailyLimit: number;
  /** Total kategori `food` minggu berjalan. */
  foodSpendThisWeek: number;
}>;

/** Hingga 4 kartu: harian (peringatan atau aman) → spike minggu → dominasi makanan. */
export function generateFinlyInsights(input: FinlyInsightEngineInput): DashboardInsight[] {
  const { spentToday, spentThisWeek, spentLastWeek, dailyLimit, foodSpendThisWeek } =
    input;

  const safeDailyLimit = Math.max(dailyLimit, 1);
  const spikePct = parseEnvPercent("SPIKE_WEEK_PCT", 20);
  const foodSharePct = parseEnvPercent("FOOD_WEEK_SHARE_ALERT", 35);
  const foodShareRatio = foodSharePct / 100;
  const foodAmountAlert = parseOptionalEnvAmount("FOOD_WEEKLY_AMOUNT_ALERT");

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
      id: "daily-safe",
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
      problem: `Pengeluaran minggu ini naik ${pctUp}%`,
      impact: `Minggu ini ${formatIDRFull(spentThisWeek)} vs minggu lalu ${formatIDRFull(spentLastWeek)}.`,
      action: "Tinjau besar pengeluaran minggu ini",
      quickAction: "fix",
    });
  }

  const foodDominatesShare =
    spentThisWeek > 0 && foodSpendThisWeek / spentThisWeek >= foodShareRatio;
  const foodDominatesAmount =
    foodAmountAlert !== undefined && foodSpendThisWeek >= foodAmountAlert;

  if (spentThisWeek > 0 && (foodDominatesShare || foodDominatesAmount)) {
    const sharePct =
      spentThisWeek > 0 ? Math.round((foodSpendThisWeek / spentThisWeek) * 100) : 0;
    out.push({
      id: "food-category-heavy",
      kind: "behavioral_feedback",
      tone: "tip",
      problem: "Pengeluaran makan minggu ini cukup tinggi 🍜",
      impact: `Makanan ${formatIDRFull(foodSpendThisWeek)} dari ${formatIDRFull(spentThisWeek)} minggu ini (${sharePct}% dari total).`,
      action: "Rencanakan meal prep atau batas kategori makan",
      quickAction: "set-limit",
    });
  }

  return out.slice(0, 4);
}
