"use client";

import { BellIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { FinlyNotification } from "@/lib/notifications/types";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<FinlyNotification["kind"], string> = {
  critical: "Kritis",
  warning: "Peringatan",
  suggestion: "Saran",
  achievement: "Pencapaian",
};

const PRIORITY_LABEL: Record<FinlyNotification["priority"], string> = {
  high: "Utama",
  medium: "Sedang",
  low: "Info",
};

const KIND_CHIP_CLASS: Record<FinlyNotification["kind"], string> = {
  critical:
    "bg-destructive/15 text-destructive dark:text-rose-300",
  warning: "bg-orange-500/15 text-orange-800 dark:text-orange-200",
  suggestion: "bg-primary/15 text-primary",
  achievement: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
};

export function NotificationsSheet({
  open,
  onOpenChange,
  notifications,
  className,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: FinlyNotification[];
  className?: string;
}>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "w-[86vw] max-w-sm rounded-l-3xl border-white/30 bg-white/80 backdrop-blur-md dark:bg-black/40",
          className,
        )}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BellIcon className="size-4" aria-hidden />
            Notifikasi
          </SheetTitle>
          <SheetDescription>
            Diperbarui dari insight dan pola pengeluaranmu.
          </SheetDescription>
        </SheetHeader>

        <div className="grid max-h-[min(70vh,520px)] gap-2 overflow-y-auto px-4 pb-2">
          {notifications.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              Belum ada notifikasi.
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="rounded-2xl border border-white/30 bg-white/60 p-3 backdrop-blur-md dark:bg-white/5"
              >
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      KIND_CHIP_CLASS[n.kind],
                    )}
                  >
                    {KIND_LABEL[n.kind]}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {PRIORITY_LABEL[n.priority]}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground">{n.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {n.body}
                </p>
              </div>
            ))
          )}
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            className="h-11 rounded-2xl bg-white/60 backdrop-blur-md dark:bg-white/5"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
