/**
 * Use case server: orkestrasi infra (query Prisma) + domain (insight, snapshot, notifikasi).
 * Presentation mengimpor `getDashboardSummary` via `@/lib/dashboard/summary` (barrel kompatibilitas).
 */

import type { DashboardRecentTransaction } from "@/components/dashboard/dashboard.types";
import type { SpendingBreakdownItem } from "@/components/dashboard/SpendingBreakdown";
import type { DashboardSummary } from "@/application/dashboard/dashboard-summary.types";
import { CATEGORIES } from "@/domain/finance/categories";
import {
  buildMonthlyFinancialSnapshot,
} from "@/domain/finance/monthly-snapshot";
import { generateFinlyInsights } from "@/domain/insights";
import {
  parseEnvInt,
  parseEnvNumber,
} from "@/domain/insights/env";
import { notificationsFromInsights } from "@/domain/notifications/map-from-insights";
import { fetchDashboardAggregateBundle } from "@/infrastructure/persistence/dashboard-queries";

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
  const bundle = await fetchDashboardAggregateBundle(now);

  const {
    totalSpending,
    spentThisMonth,
    spentToday,
    spentThisWeek,
    spentLastWeek,
    monthByCategory,
    prevMonthByCategory,
    latestTransactions,
    meta,
  } = bundle;

  const { dayOfMonth, daysInMonth, daysLeftInMonth } = meta;

  const foodSpendThisMonth =
    monthByCategory.find((r) => r.category === "food")?._sum?.amount ?? 0;
  const savingsSpendThisMonth =
    monthByCategory.find((r) => r.category === "savings")?._sum?.amount ?? 0;

  const savingsSpendLastMonth =
    prevMonthByCategory.find((r) => r.category === "savings")?._sum?.amount ??
    0;

  const spentLastMonthTotal = prevMonthByCategory.reduce(
    (sum, r) => sum + (r._sum?.amount ?? 0),
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

  const defaultSimFoodShare = parseEnvNumber(
    "SIMULATOR_DEFAULT_FOOD_SHARE",
    0.32,
  );
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
      amount: r._sum?.amount ?? 0,
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
    latestTransactions: latestTransactions.map(mapTransaction),
  };
}
