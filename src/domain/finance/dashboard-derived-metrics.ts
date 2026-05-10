/** Selaras insight runway — batas tampilan/logika "masuk akal". */
export const DASHBOARD_RUNWAY_CAP_DAYS = 365;

const EPS = 1e-9;

export type BurnRateResult = Readonly<{
  /** Rata-rata pengeluaran harian bulan berjalan (belum dibulatkan). */
  dailyBurn: number;
}>;

export type SafeDailyBudgetResult = Readonly<{
  /** Sisa budget bulanan dibagi sisa hari kalender. */
  budgetPacePerDay: number;
  /** Saldo dibagi sisa hari kalender (aman pakai per hari). */
  balanceCalendarPerDay: number;
}>;

export type SpendingVelocityResult = Readonly<{
  expectedSpendSoFar: number;
  /** >1 berarti di atas pro-rata budget hingga hari ini. */
  velocityRatio: number;
}>;

export type BalanceForecastResult = Readonly<{
  projectedMonthSpend: number;
  /** Hari sampai saldo habis pada ritme burn sekarang (floor); 0 jika tidak terdefinisi. */
  runwayDaysAtBurn: number;
}>;

export function computeBurnRate(params: {
  spentThisMonth: number;
  dayOfMonth: number;
}): BurnRateResult {
  const dailyBurn = params.spentThisMonth / Math.max(1, params.dayOfMonth);
  return { dailyBurn };
}

export function computeSafeDailyBudget(params: {
  balance: number;
  remainingBudget: number;
  daysLeftInMonth: number;
}): SafeDailyBudgetResult {
  const safeDays = Math.max(1, params.daysLeftInMonth);
  return {
    budgetPacePerDay: params.remainingBudget / safeDays,
    balanceCalendarPerDay: params.balance / safeDays,
  };
}

export function computeSpendingVelocity(params: {
  spentThisMonth: number;
  monthlyBudget: number;
  dayOfMonth: number;
  daysInMonth: number;
}): SpendingVelocityResult {
  const denomDays = Math.max(1, params.daysInMonth);
  const expectedSpendSoFar =
    params.monthlyBudget * (params.dayOfMonth / denomDays);
  const velocityRatio =
    params.spentThisMonth / Math.max(EPS, expectedSpendSoFar);
  return { expectedSpendSoFar, velocityRatio };
}

export function computeBalanceForecast(params: {
  balance: number;
  spentThisMonth: number;
  dayOfMonth: number;
  daysInMonth: number;
}): BalanceForecastResult {
  const { dailyBurn } = computeBurnRate({
    spentThisMonth: params.spentThisMonth,
    dayOfMonth: params.dayOfMonth,
  });
  const projectedMonthSpend = dailyBurn * Math.max(1, params.daysInMonth);

  if (params.balance <= 0 || dailyBurn <= EPS) {
    return { projectedMonthSpend, runwayDaysAtBurn: 0 };
  }

  const runwayDaysAtBurn = Math.floor(params.balance / dailyBurn);
  return { projectedMonthSpend, runwayDaysAtBurn };
}
