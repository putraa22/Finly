import type { ReactNode } from "react";
import { PiggyBank, Target, Trophy, Wand2 } from "lucide-react";

import { cn } from "@/lib/utils";

export type QuickActionId = "auto-save" | "set-limit" | "challenge" | "fix";

type QuickActionItem = {
  id: QuickActionId;
  label: string;
  icon: ReactNode;
  tone: "primary" | "warning" | "success" | "info";
};

const tones: Record<QuickActionItem["tone"], string> = {
  primary: "bg-primary/15 text-primary",
  warning: "bg-secondary/15 text-secondary",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  info: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
};

export type QuickActionsProps = Readonly<{
  className?: string;
  onAction?: (id: QuickActionId) => void;
}>;

export function QuickActions({ className, onAction }: QuickActionsProps) {
  const actions: QuickActionItem[] = [
    {
      id: "auto-save",
      label: "Aktifkan auto-save",
      icon: <PiggyBank className="h-5 w-5" aria-hidden />,
      tone: "success",
    },
    {
      id: "set-limit",
      label: "Atur limit harian",
      icon: <Target className="h-5 w-5" aria-hidden />,
      tone: "info",
    },
    {
      id: "challenge",
      label: "Mulai challenge 7 hari",
      icon: <Trophy className="h-5 w-5" aria-hidden />,
      tone: "warning",
    },
    {
      id: "fix",
      label: "Perbaiki pengeluaran",
      icon: <Wand2 className="h-5 w-5" aria-hidden />,
      tone: "primary",
    },
  ];

  return (
    <section
      className={cn("mt-6 px-3", className)}
      aria-labelledby="quick-actions-title"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id="quick-actions-title"
          className="font-heading text-base font-bold text-foreground"
        >
          Aksi cepat
        </h2>
        <span className="shrink-0 text-[11px] text-muted-foreground">
          1 tap, langsung jadi
        </span>
      </div>

      <div
        className={cn(
          "flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "max-sm:-mx-4 max-sm:px-4 sm:mx-0 sm:px-0",
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {actions.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onAction?.(a.id)}
            className="group flex w-[140px] shrink-0 snap-start flex-col items-start gap-3 rounded-3xl border border-border/60 bg-card p-4 text-left shadow-sm transition-[transform,box-shadow] duration-300 ease-out hover:shadow-[0_14px_40px_rgba(0,0,0,0.12)] active:scale-[0.97]"
          >
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full transition-transform group-hover:scale-110",
                tones[a.tone],
              )}
            >
              {a.icon}
            </span>
            <span className="text-[13px] font-semibold leading-snug text-foreground">
              {a.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
