import { CATEGORIES } from "@/lib/finance";
import { buildInsightsV1 } from "@/lib/insights/engine";
import type { DashboardInsight } from "@/lib/insights/types";
import { prisma } from "@/lib/prisma";

import type { DashboardRecentTransaction } from "@/components/dashboard/dashboard.types";

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
  insights: DashboardInsight[];
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
  const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const t1 = new Date(
    createdAt.getFullYear(),
    createdAt.getMonth(),
    createdAt.getDate(),
  ).getTime();
  const diffDays = Math.round((t0 - t1) / 86_400_000);

  if (diffDays === 0) return `Hari ini · ${timeStr}`;
  if (diffDays === 1) return `Kemarin · ${timeStr}`;
  if (diffDays >= 2 && diffDays < 7) return `${diffDays} hari lalu · ${timeStr}`;
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
  const dayStart = startOfCalendarDay(now);
  const weekStart = startOfMondayWeek(now);
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const [
    allAgg,
    monthAgg,
    todayAgg,
    thisWeekAgg,
    lastWeekAgg,
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

  const startingBalance = parseEnvNumber("STARTING_BALANCE", 0);
  const balance = startingBalance - totalSpending;

  /** Default selaras placeholder `ProgressToday` (limit harian demo). */
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

  const insights = buildInsightsV1({
    spentToday,
    spentThisWeek,
    spentLastWeek,
    spentThisMonth,
    dailyLimit,
    remainingBudget,
  });

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
    insights,
    latestTransactions: rows.map(mapTransaction),
  };
}
