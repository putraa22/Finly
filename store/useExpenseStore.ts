import { create } from "zustand";

type ExpenseStore = {
  amount: number;
  setAmount: (value: number) => void;
};

export const useExpenseStore = create<ExpenseStore>((set) => ({
  amount: 0,
  setAmount: (value) => set({ amount: value }),
}));

