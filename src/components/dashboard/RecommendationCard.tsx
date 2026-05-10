import { ChevronRightIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CardShell } from "./CardShell";

export function RecommendationCard({
  title = "Rekomendasi",
  message = "Kurangi makan di luar 2x minggu ini untuk hemat sekitar Rp120.000.",
  tag = "Tips",
  className,
  onAction,
}: Readonly<{
  title?: string;
  message?: string;
  tag?: string;
  className?: string;
  onAction?: () => void;
}>) {
  return (
    <CardShell
      tone="warning"
      className={cn("flex items-start justify-between gap-3", className)}
    >
      <div className="flex min-w-0 gap-3">
        <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-2xl bg-white/50 text-amber-700 dark:bg-white/10 dark:text-amber-200">
          <SparklesIcon className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">{title}</p>
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-foreground/70 dark:bg-white/10 dark:text-white/70">
              {tag}
            </span>
          </div>
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
        aria-label="Open recommendation"
      >
        <ChevronRightIcon />
      </Button>
    </CardShell>
  );
}

