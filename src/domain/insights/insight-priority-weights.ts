/** Urutan tampil insight / bobot relatif untuk notifikasi — lebih tinggi = lebih dulu. */
const INSIGHT_PRIORITY_WEIGHTS: Readonly<Record<string, number>> = {
  "balance-depleted": 110,
  "balance-runway": 100,
  "daily-over-limit": 95,
  "week-spike": 88,
  "pattern-week-spike": 84,
  "food-category-heavy-month": 82,
  "pattern-late-night-spend": 80,
  "pattern-impulsive-shopping": 79,
  "pattern-impulsive-shopping-mom": 78,
  "pattern-unstable-daily": 76,
  "savings-category-gap": 76,
  "pattern-saving-streak": 75,
  "savings-category-up": 74,
  "healthy-week-down": 72,
  "safe-daily-calendar": 68,
  "daily-within-limit": 40,
};

export function insightPriorityWeight(insightId: string): number {
  return INSIGHT_PRIORITY_WEIGHTS[insightId] ?? 50;
}
