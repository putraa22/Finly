/** Batas tampilan hari runway di UI (hindari angka ekstrem). */
export const MINI_SIMULATOR_RUNWAY_CAP_DAYS = 365;

const EPS = 1e-9;

export type ComputeMiniSimulatorParams = Readonly<{
  balance: number;
  dailyBurn: number;
  foodCutPct: number;
  savePlusPct: number;
  monthlyIncome: number;
  /** Share pengeluaran makan terhadap total bulan ini (0–1). */
  foodShare: number;
  daysInMonth: number;
}>;

export type MiniSimulatorComputed = Readonly<{
  baselineRunwayDays: number;
  projectedRunwayDays: number;
  newDailyBurn: number;
  dailySavedFromFood: number;
  monthlyFromFood: number;
  monthlyFromSaveRate: number;
  monthlyCombined: number;
}>;

function cappedRunwayDays(balance: number, dailyBurn: number): number {
  if (dailyBurn <= EPS) return MINI_SIMULATOR_RUNWAY_CAP_DAYS;
  const raw = Math.floor(balance / dailyBurn);
  return Math.min(
    MINI_SIMULATOR_RUNWAY_CAP_DAYS,
    Math.max(0, raw),
  );
}

/**
 * Rumus slider: kurangi burn harian proporsional dengan share makan × persen potongan slider.
 * Tabungan bulanan gabungan = run-rate hemat makan + alokasi % pendapatan (slider kedua).
 */
export function computeMiniSimulator(
  params: ComputeMiniSimulatorParams,
): MiniSimulatorComputed {
  const {
    balance,
    dailyBurn,
    foodCutPct,
    savePlusPct,
    monthlyIncome,
    foodShare,
    daysInMonth,
  } = params;

  const baselineRunwayDays = cappedRunwayDays(balance, dailyBurn);

  const reductionFactor = Math.max(
    0,
    Math.min(1, 1 - foodShare * (foodCutPct / 100)),
  );
  const newDailyBurn = Math.max(EPS, dailyBurn * reductionFactor);

  const projectedRunwayDays = cappedRunwayDays(balance, newDailyBurn);

  const dailySavedFromFood = Math.max(0, dailyBurn - newDailyBurn);
  const monthlyFromFood = dailySavedFromFood * daysInMonth;
  const monthlyFromSaveRate = (monthlyIncome * savePlusPct) / 100;
  const monthlyCombined = monthlyFromFood + monthlyFromSaveRate;

  return {
    baselineRunwayDays,
    projectedRunwayDays,
    newDailyBurn,
    dailySavedFromFood,
    monthlyFromFood,
    monthlyFromSaveRate,
    monthlyCombined,
  };
}
