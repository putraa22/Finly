import { CATEGORIES } from "@/lib/finance";
import { generateFinlyInsights } from "@/lib/insights";
import { parseEnvInt } from "@/lib/insights/env";
import type { DashboardInsight } from "@/lib/insights/types";
import { notificationsFromInsights } from "@/lib/notifications/from-insights";
import type { FinlyNotification } from "@/lib/notifications/types";
import { prisma } from "@/lib/prisma";

import type { SpendingBreakdownItem } from "@/components/dashboard/SpendingBreakdown";
import type { DashboardRecentTransaction } from "@/components/dashboard/dashboard.types";
import {
  buildMonthlyFinancialSnapshot,
  type MonthlyFinancialSnapshot,
} from "@/lib/dashboard/monthly-snapshot";

export type DashboardSummary = {
  balance: number;
  totalSpending: number;
  spentThisMonth: number;
  monthlyIncome: number;
  /** Budget bulanan untuk sisa budget (`MONTHLY_BUDGET` atau fallback ke income sintetis). */
  monthlyBudget: number;
  remainingBudget: number;
  dailyLimit: number;
  spentToday: number;
  spentThisWeek: number;
  spentLastWeek: number;
  /** Hari terhitung di bulan berjalan (untuk rata-rata harian). */
  dayOfMonth: number;
  /** Jumlah hari di bulan berjalan. */
  daysInMonth: number;
  /** Inklusif hari ini sampai akhir bulan kalender (minimal 1). */
  daysLeftInMonth: number;
  spendingBreakdownItems: SpendingBreakdownItem[];
  insights: DashboardInsight[];
  /** Daftar insight lengkap untuk halaman /insights (dashboard memakai `insights` terpotong). */
  insightsAll: DashboardInsight[];
  notifications: FinlyNotification[];
  /** Proporsi pengeluaran makan bulan ini (0–1) untuk slider simulasi; fallback env jika belum ada transaksi. */
  simulatorFoodShare: number;
  monthlySnapshot: MonthlyFinancialSnapshot;
  latestTransactions: DashboardRecentTransaction[];
};

function parseEnvNumber(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function startOfCalendarMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

function startOfPreviousCalendarMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
}

/** Awal hari kalender lokal (limit harian / agregasi “hari ini”). */
function startOfCalendarDay(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/** Senin 00:00 minggu yang berisi `now` (ISO-style week, Senin pertama). */
function startOfMondayWeek(now: Date): Date {
  const copy = startOfCalendarDay(now);
  const dow = copy.getDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  copy.setDate(copy.getDate() + offset);
  return copy;
}

function calendarDaysInMonth(now: Date): number {
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

/** Sisa hari kalender bulan ini, menghitung hari ini (minimal 1). */
function daysLeftInCalendarMonth(now: Date): number {
  const lastDay = calendarDaysInMonth(now);
  const d = now.getDate();
  return Math.max(1, lastDay - d + 1);
}

function categoryLabelOrOther(catId: string): string {
  return (
    CATEGORIES.find((c) => c.id === catId)?.label ??
    CATEGORIES.find((c) => c.id === "other")!.label
  );
}

function formatTransactionTimeId(createdAt: Date): string {
  const timeStr = createdAt.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const now = new Date();
  const t0 = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const t1 = new Date(
    createdAt.getFullYear(),
    createdAt.getMonth(),
    createdAt.getDate(),
  ).getTime();
  const diffDays = Math.round((t0 - t1) / 86_400_000);

  if (diffDays === 0) return `Hari ini · ${timeStr}`;
  if (diffDays === 1) return `Kemarin · ${timeStr}`;
  if (diffDays >= 2 && diffDays < 7)
    return `${diffDays} hari lalu · ${timeStr}`;
  return `${createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} · ${timeStr}`;
}

function mapTransaction(row: {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  createdAt: Date;
}): DashboardRecentTransaction {
  const note = row.note?.trim();
  const catLabel = categoryLabelOrOther(row.category);
  return {
    id: row.id,
    cat: row.category,
    title: note || catLabel,
    label: "Rutin",
    time: formatTransactionTimeId(row.createdAt),
    amount: -Math.abs(row.amount),
  };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const now = new Date();
  const monthStart = startOfCalendarMonth(now);
  const prevMonthStart = startOfPreviousCalendarMonth(now);
  const dayStart = startOfCalendarDay(now);
  const weekStart = startOfMondayWeek(now);
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const dayOfMonth = now.getDate();
  const daysInMonth = calendarDaysInMonth(now);
  const daysLeftInMonth = daysLeftInCalendarMonth(now);

  const [
    allAgg,
    monthAgg,
    todayAgg,
    thisWeekAgg,
    lastWeekAgg,
    monthByCategory,
    prevMonthByCategory,
    rows,
  ] = await Promise.all([
    prisma.transaction.aggregate({ _sum: { amount: true } }),
    prisma.transaction.aggregate({
      where: { createdAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { createdAt: { gte: dayStart } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { createdAt: { gte: weekStart } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        createdAt: {
          gte: lastWeekStart,
          lt: weekStart,
        },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["category"],
      where: { createdAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["category"],
      where: {
        createdAt: {
          gte: prevMonthStart,
          lt: monthStart,
        },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const totalSpending = allAgg._sum.amount ?? 0;
  const spentThisMonth = monthAgg._sum.amount ?? 0;
  const spentToday = todayAgg._sum.amount ?? 0;
  const spentThisWeek = thisWeekAgg._sum.amount ?? 0;
  const spentLastWeek = lastWeekAgg._sum.amount ?? 0;

  const foodSpendThisMonth =
    monthByCategory.find((r) => r.category === "food")?._sum.amount ?? 0;
  const savingsSpendThisMonth =
    monthByCategory.find((r) => r.category === "savings")?._sum.amount ?? 0;

  const savingsSpendLastMonth =
    prevMonthByCategory.find((r) => r.category === "savings")?._sum.amount ?? 0;

  const spentLastMonthTotal = prevMonthByCategory.reduce(
    (sum, r) => sum + (r._sum.amount ?? 0),
    0,
  );

  const startingBalance = parseEnvNumber("STARTING_BALANCE", 0);
  const balance = startingBalance - totalSpending;

  const dailyLimit = parseEnvNumber("DAILY_SPENDING_LIMIT", 500_000);

  const monthlyIncomeRaw = process.env.MONTHLY_INCOME;
  let monthlyIncome: number;
  if (monthlyIncomeRaw !== undefined && monthlyIncomeRaw !== "") {
    const n = Number(monthlyIncomeRaw);
    monthlyIncome = Number.isFinite(n) ? n : Math.max(spentThisMonth * 1.25, 1);
  } else {
    monthlyIncome = Math.max(spentThisMonth * 1.25, 1);
  }

  const monthlyBudgetRaw = process.env.MONTHLY_BUDGET;
  let monthlyBudget: number;
  if (monthlyBudgetRaw !== undefined && monthlyBudgetRaw !== "") {
    const n = Number(monthlyBudgetRaw);
    monthlyBudget = Number.isFinite(n) ? n : monthlyIncome;
  } else {
    monthlyBudget = monthlyIncome;
  }

  const remainingBudget = monthlyBudget - spentThisMonth;

  const defaultSimFoodShare = parseEnvNumber("SIMULATOR_DEFAULT_FOOD_SHARE", 0.32);
  const simulatorFoodShare =
    spentThisMonth > 0
      ? Math.min(
          0.9,
          Math.max(0.05, foodSpendThisMonth / spentThisMonth),
        )
      : defaultSimFoodShare;

  const insightsAll = generateFinlyInsights({
    balance,
    spentThisMonth,
    dayOfMonth,
    daysLeftInMonth,
    remainingBudget,
    spentToday,
    spentThisWeek,
    spentLastWeek,
    dailyLimit,
    foodSpendThisMonth,
    savingsSpendThisMonth,
    savingsSpendLastMonth,
  });
  const dashboardInsightCap = parseEnvInt("MAX_INSIGHTS", 6);
  const insights = insightsAll.slice(0, dashboardInsightCap);
  const notifications = notificationsFromInsights(insightsAll);

  const monthlySavingsGoalRaw = process.env.MONTHLY_SAVINGS_GOAL;
  let monthlySavingsGoalEnv: number | undefined;
  if (monthlySavingsGoalRaw !== undefined && monthlySavingsGoalRaw !== "") {
    const g = Number(monthlySavingsGoalRaw);
    if (Number.isFinite(g) && g > 0) monthlySavingsGoalEnv = g;
  }

  const monthlySnapshot = buildMonthlyFinancialSnapshot({
    spentThisMonth,
    spentLastMonthTotal,
    dayOfMonth,
    daysInMonth,
    monthByCategory,
    prevMonthByCategory,
    savingsSpendThisMonth,
    monthlyIncome,
    savingsGoalFromEnv: monthlySavingsGoalEnv,
  });

  const spendingBreakdownItems: SpendingBreakdownItem[] = monthByCategory
    .map((r) => ({
      categoryId: r.category,
      amount: r._sum.amount ?? 0,
    }))
    .filter((item) => item.amount > 0);

  return {
    balance,
    totalSpending,
    spentThisMonth,
    monthlyIncome,
    monthlyBudget,
    remainingBudget,
    dailyLimit,
    spentToday,
    spentThisWeek,
    spentLastWeek,
    dayOfMonth,
    daysInMonth,
    daysLeftInMonth,
    spendingBreakdownItems,
    insights,
    insightsAll,
    notifications,
    simulatorFoodShare,
    monthlySnapshot,
    latestTransactions: rows.map(mapTransaction),
  };
}
