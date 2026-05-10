import { create } from "zustand";

/** Filter daftar insight (halaman /insights — daftar data menyusul). */
export type InsightListFilter = "all" | "warnings_only";

type InsightUiStore = {
  listFilter: InsightListFilter;
  setListFilter: (filter: InsightListFilter) => void;
};

export const useInsightUiStore = create<InsightUiStore>((set) => ({
  listFilter: "all",
  setListFilter: (listFilter) => set({ listFilter }),
}));
