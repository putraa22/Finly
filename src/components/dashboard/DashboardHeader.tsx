import { BellIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardHeader({
  name = "Andra",
  className,
  onOpenNotifications,
}: Readonly<{
  name?: string;
  className?: string;
  onOpenNotifications?: () => void;
}>) {
  return (
    <header className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">
          Halo, {name} <span aria-hidden>👋</span>
        </p>
        <h1 className="mt-0.5 truncate text-3xl font-bold leading-none tracking-tight">
          Yuk, jaga saldomu
        </h1>
      </div>

      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          className="size-12 rounded-full border-white/30 bg-white/70 shadow-[0_12px_30px_rgba(0,0,0,0.10)] backdrop-blur-md dark:bg-white/5"
          aria-label="Notifications"
          onClick={onOpenNotifications}
        >
          <BellIcon />
        </Button>
        <span className="absolute right-3 top-3 size-2.5 rounded-full bg-orange-400 ring-2 ring-white/80 dark:ring-black/40" />
      </div>
    </header>
  );
}

