import { QUICK_AMOUNTS } from "../../addExpense.constants";
import { quickChipLabel } from "../../addExpense.utils";

export function ExpenseQuickAmountRow({
  onPick,
  onReset,
}: Readonly<{
  onPick: (n: number) => void;
  onReset: () => void;
}>) {
  return (
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {QUICK_AMOUNTS.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onPick(q)}
          className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:border-primary/40 hover:bg-primary/12 hover:text-primary active:scale-95"
        >
          + Rp{quickChipLabel(q)}
        </button>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="shrink-0 rounded-full px-3 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
      >
        Reset
      </button>
    </div>
  );
}
