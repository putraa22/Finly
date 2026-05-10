import * as React from "react";

import { cn } from "@/lib/utils";

type CardShellProps = React.ComponentProps<"section"> & {
  tone?: "default" | "success" | "warning" | "danger";
};

const toneStyles: Record<NonNullable<CardShellProps["tone"]>, string> = {
  default:
    "bg-white/70 dark:bg-white/5 text-foreground border-white/30 ring-black/5",
  success:
    "bg-emerald-500/10 dark:bg-emerald-500/10 text-foreground border-white/30 ring-emerald-950/10",
  warning:
    "bg-amber-500/10 dark:bg-amber-500/10 text-foreground border-white/30 ring-amber-950/10",
  danger:
    "bg-rose-500/10 dark:bg-rose-500/10 text-foreground border-white/30 ring-rose-950/10",
};

export function CardShell({
  className,
  tone = "default",
  ...props
}: CardShellProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border bg-clip-padding p-4 shadow-[0_14px_40px_rgba(0,0,0,0.10)] backdrop-blur-sm ring-1",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}

