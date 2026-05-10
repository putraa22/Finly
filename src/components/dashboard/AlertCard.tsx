import { ChevronRightIcon, InfoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CardShell } from "./CardShell";

export function AlertCard({
  title = "Peringatan",
  message = "Pengeluaran kamu naik 32% minggu ini.",
  actionLabel = "Lihat insight",
  className,
  onAction,
}: Readonly<{
  title?: string;
  message?: string;
  actionLabel?: string;
  className?: string;
  onAction?: () => void;
}>) {
  return (
    <CardShell
      tone="danger"
      className={cn("flex items-start justify-between gap-3", className)}
    >
      <div className="flex min-w-0 gap-3">
        <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-2xl bg-white/40 text-rose-700 dark:bg-white/10 dark:text-rose-200">
          <InfoIcon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {message}
          </p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-2xl"
        onClick={onAction}
        aria-label={actionLabel}
      >
        <ChevronRightIcon />
      </Button>
    </CardShell>
  );
}

