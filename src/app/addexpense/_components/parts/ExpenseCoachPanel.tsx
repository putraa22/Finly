import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

import { COACH_BY_CATEGORY } from "../../addExpense.constants";

export function ExpenseCoachPanel({
  categoryId,
}: Readonly<{ categoryId: string }>) {
  const coach = COACH_BY_CATEGORY[categoryId] ?? COACH_BY_CATEGORY.other;

  return (
    <div
      className={cn(
        "mt-4 flex animate-in fade-in-0 duration-300 items-start gap-3 rounded-2xl border p-3.5 fill-mode-both",
        coach.tone === "warn" &&
          "border-secondary/30 bg-secondary/12 dark:bg-secondary/15",
        coach.tone === "good" &&
          "border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15",
        coach.tone === "tip" && "border-border bg-muted",
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-xl",
          coach.tone === "warn" && "bg-secondary text-secondary-foreground",
          coach.tone === "good" &&
            "bg-emerald-600 text-white dark:bg-emerald-500",
          coach.tone === "tip" &&
            "bg-card text-foreground shadow-sm dark:bg-card",
        )}
      >
        <Sparkles className="size-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Asisten Finly
        </p>
        <p className="mt-0.5 text-sm font-medium leading-snug text-foreground wrap-break-word">
          {coach.text}
        </p>
      </div>
    </div>
  );
}
