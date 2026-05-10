import {
  calendarDaysInMonth,
  startOfCalendarDay,
  startOfCalendarMonth,
} from "@/domain/finance/calendar";
import type { DashboardInsight } from "@/domain/insights/types";

/** Baris transaksi ringkas (tanpa Prisma). */
export type PatternTxRow = Readonly<{
  amount: number;
  category: string;
  createdAt: Date;
}>;

export type SpendingPatternKind =
  | "impulsive"
  | "late_night"
  | "spike"
  | "unstable"
  | "saving_streak";

export type PatternFinding = Readonly<{
  id: string;
  kind: SpendingPatternKind;
  headline: string;
  detail?: string;
}>;

export type PatternDetectorInput = Readonly<{
  now: Date;
  transactions: readonly PatternTxRow[];
  spentThisWeek: number;
  spentLastWeek: number;
  weekSpikeWarnPct: number;
  /** Dari agregat — MoM belanja impulsif tanpa scan dobel. */
  monthShoppingSpend?: number;
  prevMonthShoppingSpend?: number;
}>;

const NIGHT_HOUR_START = 22;
const NIGHT_HOUR_END = 5;

const LATE_NIGHT_SHARE_MIN = 0.35;
const LATE_NIGHT_MIN_TX = 6;
const LATE_NIGHT_MIN_SPEND = 80_000;

const IMPULSE_SHOPPING_SHARE_MIN = 0.28;
const IMPULSE_MOM_PCT_MIN = 15;
const IMPULSE_MIN_NON_SAVINGS_SPEND = 120_000;

const UNSTABLE_WINDOW_DAYS = 14;
const UNSTABLE_MIN_TX = 8;
const UNSTABLE_CV_MIN = 1.15;

const STREAK_MIN_DAYS = 3;

function isNightHour(d: Date): boolean {
  const h = d.getHours();
  return h >= NIGHT_HOUR_START || h <= NIGHT_HOUR_END;
}

function localDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDayKey(key: string): { y: number; m: number; d: number } {
  const [ys, ms, ds] = key.split("-");
  return {
    y: Number(ys),
    m: Number(ms) - 1,
    d: Number(ds),
  };
}

function prevCalendarDayKey(key: string): string {
  const { y, m, d } = parseDayKey(key);
  const dt = new Date(y, m, d - 1);
  return localDayKey(dt);
}

function isExpenseRow(r: PatternTxRow): boolean {
  return r.amount > 0 && r.category !== "savings";
}

function monthToDateRows(
  rows: readonly PatternTxRow[],
  now: Date,
): PatternTxRow[] {
  const ms = startOfCalendarMonth(now).getTime();
  const end = now.getTime();
  return rows.filter((r) => {
    const t = r.createdAt.getTime();
    return t >= ms && t <= end;
  });
}

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function populationStdev(xs: number[]): number {
  if (xs.length === 0) return 0;
  const m = mean(xs);
  const v =
    xs.reduce((acc, x) => acc + (x - m) * (x - m), 0) / Math.max(1, xs.length);
  return Math.sqrt(v);
}

export function detectSpendingPatterns(
  input: PatternDetectorInput,
): PatternFinding[] {
  const {
    now,
    transactions,
    spentThisWeek,
    spentLastWeek,
    weekSpikeWarnPct,
    monthShoppingSpend,
    prevMonthShoppingSpend,
  } = input;

  const findings: PatternFinding[] = [];
  const mtd = monthToDateRows(transactions, now);

  const spikeMult = 1 + weekSpikeWarnPct / 100;
  if (spentLastWeek > 0 && spentThisWeek > spentLastWeek * spikeMult) {
    const pctUp = Math.round((spentThisWeek / spentLastWeek - 1) * 100);
    findings.push({
      id: "pattern-week-spike",
      kind: "spike",
      headline:
        "Pola mingguanmu menunjukkan lonjakan pengeluaran dibanding minggu sebelumnya.",
      detail: `Minggu ini naik sekitar ${pctUp}% dibanding minggu lalu.`,
    });
  }

  let nightSpend = 0;
  let daySpend = 0;
  let mtdExpenseCount = 0;
  let mtdShopping = 0;
  let mtdNonSavings = 0;

  for (const r of mtd) {
    if (!isExpenseRow(r)) continue;
    mtdExpenseCount += 1;
    mtdNonSavings += r.amount;
    if (r.category === "shopping") mtdShopping += r.amount;
    if (isNightHour(r.createdAt)) nightSpend += r.amount;
    else daySpend += r.amount;
  }

  const totalDayNight = nightSpend + daySpend;
  if (
    mtdExpenseCount >= LATE_NIGHT_MIN_TX &&
    totalDayNight >= LATE_NIGHT_MIN_SPEND &&
    nightSpend / totalDayNight >= LATE_NIGHT_SHARE_MIN
  ) {
    const pct = Math.round((nightSpend / totalDayNight) * 100);
    findings.push({
      id: "pattern-late-night-spend",
      kind: "late_night",
      headline: "Kamu cenderung belanja lebih banyak malam hari.",
      detail: `Sekitar ${pct}% pengeluaran bulan ini tercatat antara jam ${NIGHT_HOUR_START}:00 dan ${NIGHT_HOUR_END}:59.`,
    });
  }

  let impulseTriggered = false;
  if (
    mtdNonSavings >= IMPULSE_MIN_NON_SAVINGS_SPEND &&
    mtdShopping / mtdNonSavings >= IMPULSE_SHOPPING_SHARE_MIN
  ) {
    impulseTriggered = true;
    const sharePct = Math.round((mtdShopping / mtdNonSavings) * 100);
    findings.push({
      id: "pattern-impulsive-shopping",
      kind: "impulsive",
      headline: "Proporsi belanja non-esensial tinggi di bulan ini.",
      detail: `Kategori belanja menyumbang sekitar ${sharePct}% dari pengeluaran (tanpa tabungan).`,
    });
  }

  if (
    !impulseTriggered &&
    monthShoppingSpend !== undefined &&
    prevMonthShoppingSpend !== undefined &&
    prevMonthShoppingSpend > 0
  ) {
    const dayDenom = Math.max(1, now.getDate());
    const daysInMonth = calendarDaysInMonth(now);
    const projectedShop =
      monthShoppingSpend * (daysInMonth / dayDenom);
    const momPct = Math.round(
      ((projectedShop - prevMonthShoppingSpend) /
        prevMonthShoppingSpend) *
        100,
    );
    if (momPct >= IMPULSE_MOM_PCT_MIN) {
      findings.push({
        id: "pattern-impulsive-shopping-mom",
        kind: "impulsive",
        headline: "Belanja impulsif tampak meningkat dibanding bulan lalu.",
        detail: `Proyeksi akhir bulan untuk kategori belanja naik sekitar ${momPct}% dibanding total bulan lalu.`,
      });
    }
  }

  const windowEnd = startOfCalendarDay(now);
  const series: number[] = [];
  for (let i = 0; i < UNSTABLE_WINDOW_DAYS; i++) {
    const dt = new Date(windowEnd);
    dt.setDate(dt.getDate() - i);
    const key = localDayKey(dt);
    let daySum = 0;
    for (const r of transactions) {
      if (!isExpenseRow(r)) continue;
      if (localDayKey(r.createdAt) === key) daySum += r.amount;
    }
    series.push(daySum);
  }
  series.reverse();

  const expenseTxInWindow = transactions.filter((r) => {
    const dayStart = startOfCalendarDay(now).getTime();
    const oldest = dayStart - (UNSTABLE_WINDOW_DAYS - 1) * 86_400_000;
    const t = r.createdAt.getTime();
    return t >= oldest && t <= now.getTime() && isExpenseRow(r);
  }).length;

  const mDaily = mean(series);
  const sdDaily = populationStdev(series);
  const cv = mDaily > 1e-6 ? sdDaily / mDaily : 0;

  if (expenseTxInWindow >= UNSTABLE_MIN_TX && cv >= UNSTABLE_CV_MIN) {
    findings.push({
      id: "pattern-unstable-daily",
      kind: "unstable",
      headline:
        "Pola pengeluaran harianmu tidak stabil minggu ini — ada swing besar antar hari.",
      detail: `Variabilitas harian (banding rata-rata) tinggi; pertimbangkan meratakan pengeluaran.`,
    });
  }

  let streak = 0;
  let cursorKey = localDayKey(now);
  const savingsDays = new Set<string>();
  for (const r of transactions) {
    if (r.category !== "savings" || r.amount <= 0) continue;
    savingsDays.add(localDayKey(r.createdAt));
  }

  if (savingsDays.has(cursorKey)) {
    streak = 1;
    while (true) {
      const prev = prevCalendarDayKey(cursorKey);
      if (!savingsDays.has(prev)) break;
      streak += 1;
      cursorKey = prev;
    }
  }

  if (streak >= STREAK_MIN_DAYS) {
    findings.push({
      id: "pattern-saving-streak",
      kind: "saving_streak",
      headline: "Kamu lagi dalam momentum nyicil tabungan yang konsisten.",
      detail: `${streak} hari berturut-turut ada catatan ke tabungan. Pertahankan ya.`,
    });
  }

  return findings;
}

export function patternsToDashboardInsights(
  findings: readonly PatternFinding[],
): DashboardInsight[] {
  return findings.map((f) => ({
    id: f.id,
    kind: "behavioral_feedback",
    tone: f.kind === "saving_streak" ? "win" : "tip",
    problem: f.headline,
    impact: f.detail ?? "",
    action:
      f.kind === "saving_streak"
        ? "Pertahankan ritme tabunganmu"
        : "Sesuaikan ritme belanja berdasarkan pola ini",
    quickAction: f.kind === "saving_streak" ? "auto-save" : "fix",
  }));
}
