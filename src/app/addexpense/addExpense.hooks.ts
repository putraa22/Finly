"use client";

import * as React from "react";

import {
  MAX_AMOUNT_DIGITS,
  type NumpadKey,
} from "@/app/addexpense/addExpense.constants";

export function useExpenseAmountString() {
  const [amount, setAmount] = React.useState("");

  const numeric = Number(amount) || 0;

  const appendKey = React.useCallback((key: NumpadKey) => {
    if (key === "back") {
      setAmount((prev) => prev.slice(0, -1));
      return;
    }
    setAmount((prev) => {
      if (prev.length >= MAX_AMOUNT_DIGITS) return prev;
      if (key === "000" && prev === "") return prev;
      return prev === "0" ? key : prev + key;
    });
  }, []);

  const bumpBy = React.useCallback((delta: number) => {
    setAmount((prev) => String((Number(prev) || 0) + delta));
  }, []);

  const clear = React.useCallback(() => setAmount(""), []);

  return {
    amount,
    numeric,
    appendKey,
    bumpBy,
    clear,
  };
}
