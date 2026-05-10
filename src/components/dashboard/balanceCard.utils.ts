export type BalanceStatus = "safe" | "warning" | "critical";

export function getBalanceStatus({
  monthProgress,
  spendProgress,
}: Readonly<{
  monthProgress: number;
  spendProgress: number;
}>): BalanceStatus {
  const gap = spendProgress - monthProgress;
  return gap > 15 ? "critical" : gap > 6 ? "warning" : "safe";
}

export function clampPct(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

