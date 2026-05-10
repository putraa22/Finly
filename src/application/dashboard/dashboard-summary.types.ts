import type { SpendingBreakdownItem } from "@/components/dashboard/SpendingBreakdown";
import type { DashboardRecentTransaction } from "@/components/dashboard/dashboard.types";
import type { FinancialHealthScore } from "@/domain/finance/financial-health-score";
import type { MonthlyFinancialSnapshot } from "@/domain/finance/monthly-snapshot";
import type { DashboardInsight } from "@/domain/insights/types";
import type { FinlyNotification } from "@/domain/notifications/types";

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
  /** Rata-rata burn harian bulan ini (`spentThisMonth / dayOfMonth`). */
  dailyBurn: number;
  /** Sisa budget / sisa hari bulan. */
  safeDailyBudgetPace: number;
  /** Saldo / sisa hari bulan (aman dipakai per hari). */
  safeDailyFromBalance: number;
  /** Aktual vs pro-rata budget hingga hari ini. */
  spendingVelocityRatio: number;
  /** Proyeksi pengeluaran hingga `dayOfMonth` jika mengikuti budget linear. */
  expectedSpendSoFar: number;
  /** Proyeksi total pengeluaran akhir bulan jika ritme burn tetap. */
  projectedMonthSpend: number;
  /** Hari sampai saldo habis pada burn sekarang (0 jika tidak relevan). */
  balanceRunwayDays: number;
  spendingBreakdownItems: SpendingBreakdownItem[];
  insights: DashboardInsight[];
  /** Daftar insight lengkap untuk halaman /insights (dashboard memakai `insights` terpotong). */
  insightsAll: DashboardInsight[];
  notifications: FinlyNotification[];
  /** Proporsi pengeluaran makan bulan ini (0–1) untuk slider simulasi; fallback env jika belum ada transaksi. */
  simulatorFoodShare: number;
  monthlySnapshot: MonthlyFinancialSnapshot;
  financialHealth: FinancialHealthScore;
  latestTransactions: DashboardRecentTransaction[];
};
