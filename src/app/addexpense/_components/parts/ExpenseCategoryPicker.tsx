import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  MOCK_FREQUENT_CATEGORY_IDS,
  MOCK_RECENT_CATEGORY_ID,
} from "../../addExpense.constants";
import { sortCategoriesByFrequency } from "../../addExpense.utils";

const FREQUENT_CATEGORY_SET = new Set<string>(MOCK_FREQUENT_CATEGORY_IDS);

export function ExpenseCategoryPicker({
  categories,
  selectedId,
  onSelect,
  disabled = false,
}: Readonly<{
  categories: ReturnType<typeof sortCategoriesByFrequency>;
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}>) {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {categories.map((c) => {
        const active = selectedId === c.id;
        const isFreq = FREQUENT_CATEGORY_SET.has(c.id);
        const isRecent = c.id === MOCK_RECENT_CATEGORY_ID;

        return (
          <button
            key={c.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(c.id)}
            className={cn(
              "relative flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all duration-200 ease-out enabled:active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50",
              active
                ? "scale-[1.03] border-primary bg-primary/12 shadow-md"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            {active && (
              <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-2.5" strokeWidth={3} aria-hidden />
              </span>
            )}
            {!active && isFreq && (
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
            )}
            {!active && isRecent && (
              <span className="absolute left-1.5 top-1.5 text-[8px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                •
              </span>
            )}
            <span className="text-2xl">{c.emoji}</span>
            <span
              className={cn(
                "text-center text-[11px] font-semibold leading-tight",
                active ? "text-primary" : "text-foreground",
              )}
            >
              {c.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
