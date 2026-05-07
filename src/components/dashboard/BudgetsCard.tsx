import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CardShell } from "./CardShell";
import type { DashboardBudget } from "./dashboard.types";
import { clamp01, formatIDR } from "./dashboard.utils";
import { SectionTitle } from "./SectionTitle";

const defaultBudgets: DashboardBudget[] = [
  { id: "b1", title: "Makan & minum", spent: 420000, limit: 800000 },
  { id: "b2", title: "Transport", spent: 210000, limit: 450000 },
  { id: "b3", title: "Belanja", spent: 170000, limit: 350000 },
];

export function BudgetsCard({
  budgets = defaultBudgets,
  className,
  onOpen,
}: Readonly<{
  budgets?: DashboardBudget[];
  className?: string;
  onOpen?: () => void;
}>) {
  return (
    <CardShell className={cn(className)}>
      <SectionTitle
        title="Budget"
        subtitle="Ringkas bulan ini"
        action={
          <button
            onClick={onOpen}
            className="text-xs font-medium text-foreground/80 underline underline-offset-4 hover:text-foreground"
          >
            Detail
          </button>
        }
      />

      <div className="mt-4 space-y-3">
        {budgets.map((b) => {
          const pct = clamp01(b.spent / Math.max(1, b.limit));
          const pct100 = Math.round(pct * 100);

          return (
            <div key={b.id} className="rounded-2xl bg-white/50 p-3 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{b.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatIDR(b.spent)} / {formatIDR(b.limit)}
                </p>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <Progress
                  value={pct100}
                  className={cn(
                    "h-2.5 flex-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/10",
                    pct > 0.9 && "bg-rose-500/15"
                  )}
                />
                <span className="w-10 text-right text-xs text-muted-foreground">
                  {pct100}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

