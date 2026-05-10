import type { Category } from "@/lib/finance";

export type SpendStatus = "safe" | "warn" | "over";

export type DailySpendSummary = Readonly<{
  projected: number;
  ratio: number;
  remaining: number;
  status: SpendStatus;
}>;

export function formatIdrDigits(n: number) {
  return new Intl.NumberFormat("id-ID").format(Math.round(n));
}

export function getDailySpendSummary(
  spentToday: number,
  entryAmount: number,
  dailyLimit: number,
): DailySpendSummary {
  const safeEntry = Math.max(0, entryAmount);
  const projected = spentToday + safeEntry;
  const ratio = Math.min(1, projected / dailyLimit);
  const remaining = Math.max(0, dailyLimit - projected);
  const status: SpendStatus =
    ratio >= 1 ? "over" : ratio >= 0.8 ? "warn" : "safe";
  return { projected, ratio, remaining, status };
}

export function sortCategoriesByFrequency(
  categories: readonly Category[],
  frequentIds: readonly string[],
): Category[] {
  const frequent = categories.filter((c) => frequentIds.includes(c.id));
  const rest = categories.filter((c) => !frequentIds.includes(c.id));
  return [...frequent, ...rest];
}

export function quickChipLabel(amount: number) {
  return amount >= 1000 ? `${amount / 1000}rb` : String(amount);
}
