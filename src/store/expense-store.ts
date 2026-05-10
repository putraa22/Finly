import { create } from "zustand";

import {
  MAX_AMOUNT_DIGITS,
  type NumpadKey,
} from "@/app/addexpense/addExpense.constants";

type ExpenseDraftStore = {
  amount: string;
  categoryId: string;
  note: string;
  appendKey: (key: NumpadKey) => void;
  bumpBy: (delta: number) => void;
  clearAmount: () => void;
  setCategoryId: (id: string) => void;
  setNote: (note: string) => void;
  /** Kosongkan jumlah & catatan setelah submit sukses (kategori tetap). */
  resetDraft: () => void;
};

export const useExpenseDraftStore = create<ExpenseDraftStore>((set, get) => ({
  amount: "",
  categoryId: "food",
  note: "",
  appendKey: (key) => {
    const amount = get().amount;
    if (key === "back") {
      set({ amount: amount.slice(0, -1) });
      return;
    }
    if (amount.length >= MAX_AMOUNT_DIGITS) return;
    if (key === "000" && amount === "") return;
    set({ amount: amount === "0" ? key : amount + key });
  },
  bumpBy: (delta) => {
    const prev = get().amount;
    set({ amount: String((Number(prev) || 0) + delta) });
  },
  clearAmount: () => set({ amount: "" }),
  setCategoryId: (categoryId) => set({ categoryId }),
  setNote: (note) => set({ note }),
  resetDraft: () => set({ amount: "", note: "" }),
}));
