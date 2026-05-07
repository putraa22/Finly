import type { ReactNode } from "react";
import { ArrowRight, AlertTriangle, Sparkles, TrendingUp, Flame } from "lucide-react";

import { cn } from "@/lib/utils";
import { CardShell } from "./CardShell";

export type CoachTone = "warning" | "tip" | "win" | "urgent";

export type CoachInsightProps = Readonly<{
  tone?: CoachTone;
  problem: string;
  impact: string;
  action: string;
  onAction?: () => void;
  priority?: "high" | "normal";
  className?: string;
}>;

const toneStyles: Record<
  CoachTone,
  {
    wrap: string;
    chip: string;
    icon: ReactNode;
    label: string;
    btn: string;
    accent: string;
  }
> = {
  warning: {
    wrap: "bg-orange-500/10",
    chip: "bg-orange-500/20 text-orange-700 dark:text-orange-200",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    label: "Perhatian",
    btn: "bg-orange-500/20 text-orange-900 hover:bg-orange-500/25 dark:text-orange-100",
    accent: "text-orange-600 dark:text-orange-300",
  },
  urgent: {
    wrap: "bg-rose-500/10",
    chip: "bg-rose-500/20 text-rose-700 dark:text-rose-200",
    icon: <Flame className="h-3.5 w-3.5" />,
    label: "Penting",
    btn: "bg-rose-500/20 text-rose-900 hover:bg-rose-500/25 dark:text-rose-100",
    accent: "text-rose-600 dark:text-rose-300",
  },
  tip: {
    wrap: "bg-emerald-500/10",
    chip: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-200",
    icon: <Sparkles className="h-3.5 w-3.5" />,
    label: "Saran",
    btn: "bg-emerald-500/20 text-emerald-900 hover:bg-emerald-500/25 dark:text-emerald-100",
    accent: "text-emerald-600 dark:text-emerald-300",
  },
  win: {
    wrap: "bg-emerald-500/10",
    chip: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-200",
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    label: "Kemajuan",
    btn: "bg-emerald-500/20 text-emerald-900 hover:bg-emerald-500/25 dark:text-emerald-100",
    accent: "text-emerald-600 dark:text-emerald-300",
  },
};

export function CoachInsight({
  tone = "tip",
  problem,
  impact,
  action,
  onAction,
  priority = "normal",
  className,
}: CoachInsightProps) {
  const t = toneStyles[tone];

  return (
    <CardShell
      className={cn(
        "p-5 transition-shadow duration-200",
        t.wrap,
        priority === "high" && "ring-1 ring-foreground/10",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            t.chip
          )}
        >
          {t.icon}
          {t.label}
        </span>
        {priority === "high" ? (
          <span className={cn("text-[10px] font-bold uppercase tracking-wider", t.accent)}>
            Prioritas
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 text-[15px] font-bold leading-snug text-foreground">
        {problem}
      </h3>

      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground/80">Dampak: </span>
        {impact}
      </p>

      <button
        type="button"
        onClick={onAction}
        className={cn(
          "group mt-4 inline-flex w-full items-center justify-between gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-[0.98]",
          t.btn
        )}
      >
        <span>{action}</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>
    </CardShell>
  );
}

