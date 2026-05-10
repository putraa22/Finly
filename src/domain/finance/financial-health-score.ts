import type { CategoryAggregateRow } from "@/domain/finance/monthly-snapshot";

/** Overspending minggu/hari dalam v1 memakai proxy agregat (bukan hitungan per hari). */
export type FinancialHealthScoreLevel = "poor" | "fair" | "good" | "excellent";

export type FinancialHealthScore = Readonly<{
  score: number;
  level: FinancialHealthScoreLevel;
  reasons: string[];
}>;

export type FinancialHealthScoreParams = Readonly<{
  spentThisMonth: number;
  dayOfMonth: number;
  daysInMonth: number;
  spentLastMonthTotal: number;
  monthByCategory: readonly CategoryAggregateRow[];
  prevMonthByCategory: readonly CategoryAggregateRow[];
  savingsSpendThisMonth: number;
  monthlyIncome: number;
  savingsGoalFromEnv?: number;
  spentToday: number;
  spentThisWeek: number;
  spentLastWeek: number;
  dailyLimit: number;
  monthlyBudget: number;
  /** Default 20 — samakan dengan SPIKE_WEEK_PCT di layer application bila perlu. */
  weekSpikeWarnPct?: number;
  /** Minimum delta MoM % kategori belanja untuk pesan "impulsif" (default 15). */
  shoppingMomAlertPct?: number;
}>;

const W_STABILITY = 0.3;
const W_SAVINGS = 0.25;
const W_OVERSPEND = 0.25;
const W_BALANCE = 0.2;

const NEUTRAL_STABILITY_NO_PRIOR = 65;
const NEUTRAL_BALANCE_NO_SPEND = 65;

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** projected / lastMonth → skor 0–100 (lebih rendah ratio = lebih baik). */
function stabilityFromMomRatio(ratio: number): number {
  if (!Number.isFinite(ratio) || ratio <= 0) return NEUTRAL_STABILITY_NO_PRIOR;
  if (ratio <= 0.75) return 100;
  if (ratio <= 0.85) return lerp(100, 94, (ratio - 0.75) / 0.1);
  if (ratio <= 1.0) return lerp(94, 72, (ratio - 0.85) / 0.15);
  if (ratio <= 1.2) return lerp(72, 45, (ratio - 1.0) / 0.2);
  if (ratio <= 1.45) return lerp(45, 22, (ratio - 1.2) / 0.25);
  return 22;
}

function savingsGoal(monthlyIncome: number, savingsGoalFromEnv?: number): number {
  if (
    savingsGoalFromEnv !== undefined &&
    Number.isFinite(savingsGoalFromEnv) &&
    savingsGoalFromEnv > 0
  ) {
    return savingsGoalFromEnv;
  }
  return Math.max(monthlyIncome * 0.1, 1);
}

function savingsSubscore(achievement: number): number {
  if (!Number.isFinite(achievement) || achievement <= 0) return 35;
  if (achievement >= 1) return 100;
  return lerp(35, 100, achievement);
}

function rowsToMap(rows: readonly CategoryAggregateRow[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const r of rows) {
    m[r.category] = r._sum?.amount ?? 0;
  }
  return m;
}

function spendingExcludingSavings(rows: readonly CategoryAggregateRow[]): number {
  let t = 0;
  for (const r of rows) {
    if (r.category === "savings") continue;
    t += r._sum?.amount ?? 0;
  }
  return t;
}

/** Entropy dinormalisasi max = ln(k), k = jumlah kategori dengan alokasi positif. */
function balanceSubscoreFromEntropy(rows: readonly CategoryAggregateRow[]): number {
  const total = spendingExcludingSavings(rows);
  if (total <= 0) return NEUTRAL_BALANCE_NO_SPEND;

  const shares: number[] = [];
  for (const r of rows) {
    if (r.category === "savings") continue;
    const a = r._sum?.amount ?? 0;
    if (a > 0) shares.push(a / total);
  }

  const k = shares.length;
  if (k <= 1) return 42;

  let h = 0;
  for (const p of shares) {
    h -= p * Math.log(p);
  }
  const maxH = Math.log(k);
  return clamp((h / maxH) * 100, 0, 100);
}

export function financialHealthLevelFromScore(
  score: number,
): FinancialHealthScoreLevel {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

function levelFromScore(score: number): FinancialHealthScoreLevel {
  return financialHealthLevelFromScore(score);
}

export function computeFinancialHealthScore(
  params: FinancialHealthScoreParams,
): FinancialHealthScore {
  const {
    spentThisMonth,
    dayOfMonth,
    daysInMonth,
    spentLastMonthTotal,
    monthByCategory,
    prevMonthByCategory,
    savingsSpendThisMonth,
    monthlyIncome,
    savingsGoalFromEnv,
    spentToday,
    spentThisWeek,
    spentLastWeek,
    dailyLimit,
    monthlyBudget,
    weekSpikeWarnPct = 20,
    shoppingMomAlertPct = 15,
  } = params;

  const dayDenom = Math.max(1, dayOfMonth);
  const projectedMonth = spentThisMonth * (daysInMonth / dayDenom);
  const spikeMult = 1 + weekSpikeWarnPct / 100;
  const weekSpikeFlag =
    spentLastWeek > 0 && spentThisWeek > spentLastWeek * spikeMult;

  let stability: number;
  let momRatio: number | null = null;
  if (spentLastMonthTotal <= 0) {
    stability = NEUTRAL_STABILITY_NO_PRIOR;
  } else {
    momRatio = projectedMonth / spentLastMonthTotal;
    stability = stabilityFromMomRatio(momRatio);
    if (spentLastWeek > 0 && !weekSpikeFlag) {
      stability = Math.min(100, stability + 5);
    }
    if (weekSpikeFlag) stability = Math.max(0, stability - 12);
  }
  stability = clamp(stability, 0, 100);

  const goal = savingsGoal(monthlyIncome, savingsGoalFromEnv);
  const achievement = savingsSpendThisMonth / goal;
  const savingsScore = savingsSubscore(achievement);

  const safeDailyLimit = Math.max(dailyLimit, 1);
  let overspend = 90;
  if (spentToday > safeDailyLimit) {
    const over = spentToday / safeDailyLimit - 1;
    overspend -= clamp(18 + over * 45, 12, 38);
  }
  if (weekSpikeFlag) overspend -= 28;

  const safeBudget = Math.max(monthlyBudget, 1);
  const expectedSoFar = safeBudget * (dayOfMonth / Math.max(1, daysInMonth));
  if (expectedSoFar > 0 && spentThisMonth > expectedSoFar * 1.1) {
    const paceOver = spentThisMonth / expectedSoFar - 1;
    overspend -= clamp(10 + paceOver * 35, 8, 30);
  }
  overspend = clamp(overspend, 0, 100);

  const balanceScore = balanceSubscoreFromEntropy(monthByCategory);

  const score = Math.round(
    W_STABILITY * stability +
      W_SAVINGS * savingsScore +
      W_OVERSPEND * overspend +
      W_BALANCE * balanceScore,
  );
  const clampedScore = clamp(score, 0, 100);
  const level = levelFromScore(clampedScore);

  const thisMap = rowsToMap(monthByCategory);
  const prevMap = rowsToMap(prevMonthByCategory);
  const curShop = thisMap.shopping ?? 0;
  const prevShop = prevMap.shopping ?? 0;
  const projectedShop = curShop * (daysInMonth / dayDenom);
  let shoppingMomPct: number | null = null;
  if (prevShop > 0) {
    shoppingMomPct = Math.round(((projectedShop - prevShop) / prevShop) * 100);
  }

  const positives: string[] = [];
  const negatives: string[] = [];

  if (momRatio !== null && momRatio <= 1.02) {
    positives.push("+ Pengeluaran stabil");
  } else if (momRatio !== null && momRatio > 1.08) {
    negatives.push("- Pola pengeluaran naik dibanding bulan lalu");
  }

  if (achievement >= 0.85) {
    positives.push("+ Tabungan mendekati target");
  } else if (achievement < 0.45) {
    negatives.push("- Alokasi tabungan masih rendah");
  }

  if (!weekSpikeFlag && spentLastWeek > 0) {
    positives.push("+ Tidak overspending minggu ini");
  } else if (weekSpikeFlag) {
    negatives.push("- Pengeluaran minggu ini melonjak");
  }

  if (spentToday <= safeDailyLimit && spentToday > 0) {
    positives.push("+ Hari ini masih dalam limit harian");
  } else if (spentToday > safeDailyLimit) {
    negatives.push("- Hari ini melewati limit harian");
  }

  if (shoppingMomPct !== null && shoppingMomPct >= shoppingMomAlertPct) {
    negatives.push("- Belanja impulsif meningkat");
  } else if (shoppingMomPct !== null && shoppingMomPct <= -12) {
    positives.push("+ Belanja non-esensial lebih tertahan");
  }

  if (balanceScore >= 72 && spendingExcludingSavings(monthByCategory) > 0) {
    positives.push("+ Mix kategori pengeluaran seimbang");
  } else if (balanceScore < 48 && spendingExcludingSavings(monthByCategory) > 0) {
    negatives.push("- Satu kategori mendominasi pengeluaran");
  }

  if (positives.length === 0 && negatives.length === 0) {
    positives.push("+ Terus catat transaksi untuk skor lebih akurat");
  }

  const reasons = [...positives, ...negatives].slice(0, 6);

  return {
    score: clampedScore,
    level,
    reasons,
  };
}
