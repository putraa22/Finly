import { QUICK_AMOUNTS } from "../../addExpense.constants";
import { quickChipLabel } from "../../addExpense.utils";

export function ExpenseQuickAmountRow({
  onPick,
  onReset,
  disabled = false,
}: Readonly<{
  onPick: (n: number) => void;
  onReset: () => void;
  disabled?: boolean;
}>) {
  return (
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {QUICK_AMOUNTS.map((q) => (
        <button
          key={q}
          type="button"
          disabled={disabled}
          onClick={() => onPick(q)}
          className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:border-primary/40 hover:bg-primary/12 hover:text-primary enabled:active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        >
          + Rp{quickChipLabel(q)}
        </button>
      ))}
      <button
        type="button"
        disabled={disabled}
        onClick={onReset}
        className="shrink-0 rounded-full px-3 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        Reset
      </button>
    </div>
  );
}
