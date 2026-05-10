export type { Category } from "@/domain/finance/categories";
export { CATEGORIES } from "@/domain/finance/categories";
export type {
  FinancialHealthScore,
  FinancialHealthScoreParams,
} from "@/domain/finance/financial-health-score";
export {
  computeFinancialHealthScore,
  financialHealthLevelFromScore,
} from "@/domain/finance/financial-health-score";
export type {
  BalanceForecastResult,
  BurnRateResult,
  SafeDailyBudgetResult,
  SpendingVelocityResult,
} from "@/domain/finance/dashboard-derived-metrics";
export {
  computeBalanceForecast,
  computeBurnRate,
  computeSafeDailyBudget,
  computeSpendingVelocity,
  DASHBOARD_RUNWAY_CAP_DAYS,
} from "@/domain/finance/dashboard-derived-metrics";
export type { SimulatorHealthProjectionInput } from "@/domain/finance/simulator-health-projection";
export { projectFinancialHealthWithSimulator } from "@/domain/finance/simulator-health-projection";
export { formatIDR, formatIDRFull } from "@/formatters/currency";
