import type { CategoryAggregateRow } from "@/domain/finance/monthly-snapshot";
import { prisma } from "@/lib/prisma";

import {
  calendarDaysInMonth,
  daysLeftInCalendarMonth,
  startOfCalendarDay,
  startOfCalendarMonth,
  startOfMondayWeek,
  startOfPreviousCalendarMonth,
} from "@/domain/finance/calendar";

export type DashboardLatestTransactionRow = Readonly<{
  id: string;
  amount: number;
  category: string;
  note: string | null;
  createdAt: Date;
}>;

/** Bundle agregat + baris mentah untuk `getDashboardSummary` (tanpa formula bisnis). */
export type DashboardAggregateBundle = Readonly<{
  totalSpending: number;
  spentThisMonth: number;
  spentToday: number;
  spentThisWeek: number;
  spentLastWeek: number;
  monthByCategory: CategoryAggregateRow[];
  prevMonthByCategory: CategoryAggregateRow[];
  latestTransactions: DashboardLatestTransactionRow[];
  meta: Readonly<{
    dayOfMonth: number;
    daysInMonth: number;
    daysLeftInMonth: number;
  }>;
}>;

export async function fetchDashboardAggregateBundle(
  now: Date,
): Promise<DashboardAggregateBundle> {
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

  return {
    totalSpending: allAgg._sum.amount ?? 0,
    spentThisMonth: monthAgg._sum.amount ?? 0,
    spentToday: todayAgg._sum.amount ?? 0,
    spentThisWeek: thisWeekAgg._sum.amount ?? 0,
    spentLastWeek: lastWeekAgg._sum.amount ?? 0,
    monthByCategory,
    prevMonthByCategory,
    latestTransactions: rows,
    meta: {
      dayOfMonth,
      daysInMonth,
      daysLeftInMonth,
    },
  };
}
