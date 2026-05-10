/** Input agregat untuk generator insight (isi dari getDashboardSummary). */
export type FinlyInsightEngineInput = Readonly<{
  balance: number;
  spentThisMonth: number;
  dayOfMonth: number;
  daysLeftInMonth: number;
  remainingBudget: number;
  spentToday: number;
  spentThisWeek: number;
  spentLastWeek: number;
  dailyLimit: number;
  foodSpendThisMonth: number;
  savingsSpendThisMonth: number;
  savingsSpendLastMonth: number;
}>;
