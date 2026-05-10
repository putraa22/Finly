export type DashboardTransaction = {
  id: string;
  title: string;
  category: string;
  note?: string;
  amount: number; // negative = expense, positive = income
  createdAt: string; // ISO string (for now)
};

/** Baris daftar transaksi terbaru (UI breakdown). */
export type DashboardRecentTransaction = Readonly<{
  id: string;
  /** `id` dari `CATEGORIES` di `@/lib/finance` */
  cat: string;
  title: string;
  /** Label pill (mis. Rutin, Impulsif) — dipetakan ke `TRANSACTION_LABEL_STYLES` */
  label: string;
  /** Teks waktu yang sudah diformat untuk ditampilkan */
  time: string;
  insight?: string;
  /** Negatif = pengeluaran, positif = pemasukan */
  amount: number;
}>;

export type DashboardBudget = {
  id: string;
  title: string;
  spent: number;
  limit: number;
  icon?: string;
};

