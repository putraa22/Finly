"use client";

import * as React from "react";
import { ArrowDownLeftIcon, ArrowUpRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function AddTransactionSheet({
  open,
  onOpenChange,
  className,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}>) {
  const [type, setType] = React.useState<"income" | "expense">("expense");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          "rounded-t-3xl border-white/30 bg-white/80 backdrop-blur-md dark:bg-black/40",
          className
        )}
      >
        <SheetHeader className="pb-0">
          <SheetTitle>Tambah transaksi</SheetTitle>
          <SheetDescription>Catat pemasukan atau pengeluaran.</SheetDescription>
        </SheetHeader>

        <div className="grid gap-3 px-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setType("expense")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold backdrop-blur-md",
                type === "expense"
                  ? "border-white/30 bg-rose-500/10 text-rose-700 dark:text-rose-200"
                  : "border-white/30 bg-white/50 text-muted-foreground dark:bg-white/5"
              )}
            >
              <ArrowUpRightIcon className="size-4" />
              Keluar
            </button>
            <button
              onClick={() => setType("income")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold backdrop-blur-md",
                type === "income"
                  ? "border-white/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                  : "border-white/30 bg-white/50 text-muted-foreground dark:bg-white/5"
              )}
            >
              <ArrowDownLeftIcon className="size-4" />
              Masuk
            </button>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="transaction-amount"
              className="text-xs font-medium text-muted-foreground"
            >
              Amount (IDR)
            </label>
            <Input
              id="transaction-amount"
              name="amount"
              inputMode="numeric"
              placeholder="contoh: 25000"
              className="rounded-2xl bg-white/60 backdrop-blur-md dark:bg-white/5"
            />
          </div>
          <div className="grid gap-2">
            <label
              htmlFor="transaction-note"
              className="text-xs font-medium text-muted-foreground"
            >
              Catatan
            </label>
            <Input
              id="transaction-note"
              name="note"
              placeholder="opsional"
              className="rounded-2xl bg-white/60 backdrop-blur-md dark:bg-white/5"
            />
          </div>
        </div>

        <SheetFooter>
          <Button
            className="h-11 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-600/90"
            onClick={() => onOpenChange(false)}
          >
            Simpan
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

