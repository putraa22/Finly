export type Category = {
  id: string;
  label: string;
  emoji: string;
  color: string;
};

export const CATEGORIES: Category[] = [
  {
    id: "food",
    label: "Makanan",
    emoji: "🍜",
    color: "bg-secondary/15 text-secondary",
  },
  {
    id: "transport",
    label: "Transport",
    emoji: "🚕",
    color: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
  {
    id: "shopping",
    label: "Belanja",
    emoji: "🛍️",
    color: "bg-destructive/15 text-destructive",
  },
  {
    id: "bills",
    label: "Tagihan",
    emoji: "🧾",
    color: "bg-primary/15 text-primary",
  },
  {
    id: "entertainment",
    label: "Hiburan",
    emoji: "🎬",
    color: "bg-accent text-accent-foreground",
  },
  {
    id: "health",
    label: "Kesehatan",
    emoji: "💊",
    color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  {
    id: "savings",
    label: "Tabungan",
    emoji: "💰",
    color: "bg-primary/15 text-primary",
  },
  {
    id: "other",
    label: "Lainnya",
    emoji: "✨",
    color: "bg-muted text-muted-foreground",
  },
];

/** Ringkas: Rp…jt / Rp…rb / Rp… (nilai negatif tetap dapat prefiks −). */
export function formatIDR(n: number) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    const jt = abs / 1_000_000;
    return `${sign}Rp${jt.toFixed(abs % 1_000_000 === 0 ? 0 : 1)}jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp${Math.round(abs / 1_000)}rb`;
  }
  return `${sign}Rp${abs}`;
}

export function formatIDRFull(n: number) {
  return `Rp${new Intl.NumberFormat("id-ID").format(Math.round(n))}`;
}
