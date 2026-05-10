import { CATEGORIES } from "@/lib/finance";

export type MonthlySnapshotLineSentiment = "alert" | "positive" | "neutral";

export type MonthlySnapshotLine = Readonly<{
  id: string;
  title: string;
  subtitle?: string;
  sentiment: MonthlySnapshotLineSentiment;
}>;

export type MonthlyFinancialSnapshot = Readonly<{
  lines: MonthlySnapshotLine[];
  savings: Readonly<{
    pct: number;
    goalAmount: number;
    savedAmount: number;
  }>;
}>;

type CategoryAggregateRow = Readonly<{
  category: string;
  _sum: { amount: number | null } | null;
}>;

function rowsToMap(rows: readonly CategoryAggregateRow[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const r of rows) {
    m[r.category] = r._sum?.amount ?? 0;
  }
  return m;
}

export type BuildMonthlyFinancialSnapshotParams = Readonly<{
  spentThisMonth: number;
  spentLastMonthTotal: number;
  dayOfMonth: number;
  daysInMonth: number;
  monthByCategory: readonly CategoryAggregateRow[];
  prevMonthByCategory: readonly CategoryAggregateRow[];
  savingsSpendThisMonth: number;
  monthlyIncome: number;
  /** Jika diisi dan positif, menggantikan fallback 10% pendapatan. */
  savingsGoalFromEnv?: number;
}>;

/**
 * Ringkasan bulan: MoM total (proyeksi vs bulan lalu), satu kategori dengan delta terbesar,
 * dan progress tabungan vs target.
 */
export function buildMonthlyFinancialSnapshot(
  params: BuildMonthlyFinancialSnapshotParams,
): MonthlyFinancialSnapshot {
  const lines: MonthlySnapshotLine[] = [];
  const {
    spentThisMonth,
    spentLastMonthTotal,
    dayOfMonth,
    daysInMonth,
    monthByCategory,
    prevMonthByCategory,
    savingsSpendThisMonth,
    monthlyIncome,
    savingsGoalFromEnv,
  } = params;

  const denom = Math.max(1, dayOfMonth);
  const projectedMonthSpend = spentThisMonth * (daysInMonth / denom);

  if (spentLastMonthTotal > 0) {
    const momTotalPct = Math.round(
      ((projectedMonthSpend - spentLastMonthTotal) / spentLastMonthTotal) * 100,
    );
    const title =
      momTotalPct === 0
        ? "Pengeluaran bulan ini sejajar dengan bulan lalu"
        : momTotalPct > 0
          ? `Pengeluaran naik ${momTotalPct}%`
          : `Pengeluaran turun ${Math.abs(momTotalPct)}%`;
    lines.push({
      id: "total-mom",
      title,
      subtitle: "Proyeksi akhir bulan vs total bulan lalu",
      sentiment:
        momTotalPct > 0 ? "alert" : momTotalPct < 0 ? "positive" : "neutral",
    });
  } else {
    lines.push({
      id: "total-mom-placeholder",
      title:
        "Belum ada data bulan lalu untuk membandingkan total pengeluaran.",
      subtitle:
        "Lengkapi bulan ini — perbandingan otomatis muncul bulan depan.",
      sentiment: "neutral",
    });
  }

  const thisMap = rowsToMap(monthByCategory);
  const prevMap = rowsToMap(prevMonthByCategory);

  let bestCatId: string | null = null;
  let bestPct = 0;
  let bestAbs = -1;

  for (const cat of CATEGORIES) {
    if (cat.id === "savings") continue;
    const prevAmt = prevMap[cat.id] ?? 0;
    if (prevAmt <= 0) continue;
    const curAmt = thisMap[cat.id] ?? 0;
    const projectedCat = curAmt * (daysInMonth / denom);
    const pct = Math.round(((projectedCat - prevAmt) / prevAmt) * 100);
    const abs = Math.abs(pct);
    if (abs > bestAbs) {
      bestAbs = abs;
      bestPct = pct;
      bestCatId = cat.id;
    }
  }

  if (bestCatId !== null && bestAbs >= 1) {
    const catMeta = CATEGORIES.find((c) => c.id === bestCatId)!;
    const verb = bestPct > 0 ? "naik" : "turun";
    lines.push({
      id: `category-${bestCatId}`,
      title: `${catMeta.label} ${verb} ${Math.abs(bestPct)}%`,
      subtitle: "Dibanding bulan lalu (proyeksi akhir bulan)",
      sentiment: bestPct > 0 ? "alert" : "positive",
    });
  }

  const goal =
    savingsGoalFromEnv !== undefined &&
    Number.isFinite(savingsGoalFromEnv) &&
    savingsGoalFromEnv > 0
      ? savingsGoalFromEnv
      : Math.max(monthlyIncome * 0.1, 1);

  const pctAchievement = Math.min(
    100,
    Math.round((savingsSpendThisMonth / goal) * 100),
  );

  return {
    lines,
    savings: {
      pct: pctAchievement,
      goalAmount: goal,
      savedAmount: savingsSpendThisMonth,
    },
  };
}
