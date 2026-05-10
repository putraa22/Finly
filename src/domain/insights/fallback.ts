import type { DashboardInsight } from "@/domain/insights/types";

export const FALLBACK_INSIGHTS: DashboardInsight[] = [
  {
    id: "fallback-empty",
    kind: "spending_awareness",
    tone: "tip",
    problem: "Belum ada cukup data untuk insight personal.",
    impact: "Catat beberapa pengeluaran dulu — pola akan terlihat di sini.",
    action: "Tambah pengeluaran",
    quickAction: "fix",
  },
];
