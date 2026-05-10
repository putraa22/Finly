import type { FinancialHealthScore } from "@/domain/finance/financial-health-score";
import { financialHealthLevelFromScore } from "@/domain/finance/financial-health-score";
import type { MiniSimulatorComputed } from "@/domain/finance/mini-simulator-model";

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export type SimulatorHealthProjectionInput = Readonly<{
  baseline: FinancialHealthScore;
  monthlyIncome: number;
  foodCutPct: number;
  savePlusPct: number;
  metrics: MiniSimulatorComputed;
}>;

/**
 * Pratinjau skor dari slider mini-simulator (tanpa agregat transaksi penuh).
 * Slider 0/0 mengembalikan baseline persis seperti server.
 */
export function projectFinancialHealthWithSimulator(
  input: SimulatorHealthProjectionInput,
): FinancialHealthScore {
  const {
    baseline,
    monthlyIncome,
    foodCutPct,
    savePlusPct,
    metrics,
  } = input;

  if (foodCutPct <= 0 && savePlusPct <= 0) {
    return baseline;
  }

  const runwayDelta =
    metrics.projectedRunwayDays - metrics.baselineRunwayDays;

  const savingsSignal =
    metrics.monthlyCombined / Math.max(monthlyIncome, 1);
  const savingsBoost = clamp(Math.round(savingsSignal * 52), 0, 22);
  const runwayBoost = clamp(Math.round(runwayDelta * 1.35), 0, 18);

  const score = clamp(
    Math.round(baseline.score + savingsBoost + runwayBoost),
    0,
    100,
  );

  const level = financialHealthLevelFromScore(score);

  const parts: string[] = [];
  if (runwayDelta > 0) {
    parts.push(`runway saldo +${runwayDelta} hari`);
  }
  if (metrics.monthlyCombined > 0) {
    parts.push("potensi tabungan bulanan naik");
  }
  const simReason =
    parts.length > 0
      ? `+ Simulasi: ${parts.join(", ")}.`
      : "+ Simulasi: rencana slider memperbaiki ritme menabung.";

  const reasons = [simReason, ...baseline.reasons].slice(0, 6);

  return {
    score,
    level,
    reasons,
  };
}
