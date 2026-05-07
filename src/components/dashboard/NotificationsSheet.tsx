"use client";

import * as React from "react";
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
import { cn } from "@/lib/utils";

export function NotificationsSheet({
  open,
  onOpenChange,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "w-[86vw] max-w-sm rounded-l-3xl border-white/30 bg-white/80 backdrop-blur-md dark:bg-black/40",
          className
        )}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BellIcon className="size-4" />
            Notifications
          </SheetTitle>
          <SheetDescription>Ringkasan update terakhir.</SheetDescription>
        </SheetHeader>

        <div className="grid gap-2 px-4">
          {[
            "Pengeluaran minggu ini naik 32%.",
            "Budget makan tinggal 48%.",
            "Ada 3 transaksi belum kamu kategorikan.",
          ].map((msg) => (
            <div
              key={msg}
              className="rounded-2xl border border-white/30 bg-white/60 p-3 text-xs text-muted-foreground backdrop-blur-md dark:bg-white/5"
            >
              {msg}
            </div>
          ))}
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

