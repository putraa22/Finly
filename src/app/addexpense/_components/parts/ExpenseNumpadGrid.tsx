import { Delete } from "lucide-react";

import { NUMPAD_KEYS, type NumpadKey } from "../../addExpense.constants";

export function ExpenseNumpadGrid({
  onKey,
}: Readonly<{ onKey: (k: NumpadKey) => void }>) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {NUMPAD_KEYS.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onKey(k)}
          className="h-12 rounded-2xl bg-card text-lg font-semibold text-foreground shadow-sm transition-all duration-150 ease-out active:scale-95 active:bg-secondary/25"
        >
          {k === "back" ? <Delete className="mx-auto size-4" aria-hidden /> : k}
        </button>
      ))}
    </div>
  );
}
