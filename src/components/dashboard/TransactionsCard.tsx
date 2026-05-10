"use client";

import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { CATEGORIES, formatIDRFull } from "@/lib/finance";
import { cn } from "@/lib/utils";

import { CardShell } from "./CardShell";
import type { DashboardRecentTransaction } from "./dashboard.types";

const TRANSACTION_LABEL_STYLES: Record<string, string> = {
  Impulsif: "bg-secondary/15 text-secondary",
  Rutin: "bg-muted text-muted-foreground",
  Hemat: "bg-primary/15 text-primary",
  Penting: "bg-destructive/15 text-destructive",
};

const demoRecent: DashboardRecentTransaction[] = [
  {
    id: "r1",
    cat: "food",
    title: "Warung sarapan",
    label: "Rutin",
    time: "Hari ini · 07:45",
    amount: -32_000,
  },
  {
    id: "r2",
    cat: "transport",
    title: "Ojek ke kantor",
    label: "Rutin",
    time: "Hari ini · 08:10",
    insight: "3× minggu ini — coba paket transport",
    amount: -24_000,
  },
  {
    id: "r3",
    cat: "shopping",
    title: "Flash sale marketplace",
    label: "Impulsif",
    time: "Kemarin · 21:30",
    amount: -189_000,
  },
  {
    id: "r4",
    cat: "bills",
    title: "Listrik bulanan",
    label: "Penting",
    time: "2 hari lalu",
    amount: -425_000,
  },
];

function resolveCategory(catId: string) {
  return (
    CATEGORIES.find((c) => c.id === catId) ??
    CATEGORIES.find((c) => c.id === "other")!
  );
}

function formatListAmount(amount: number) {
  if (amount < 0) return `−${formatIDRFull(Math.abs(amount))}`;
  if (amount > 0) return `+${formatIDRFull(amount)}`;
  return formatIDRFull(0);
}

export function TransactionsCard({
  transactions = demoRecent,
  className,
  onViewAll,
}: Readonly<{
  transactions?: DashboardRecentTransaction[];
  className?: string;
  onViewAll?: () => void;
}>) {
  const router = useRouter();
  const handleViewAll = onViewAll ?? (() => router.push("/insights"));

  return (
    <CardShell className={cn("p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-bold text-foreground">
          Transaksi terbaru
        </h2>
        <button
          type="button"
          onClick={handleViewAll}
          className="shrink-0 text-xs font-semibold text-primary"
        >
          Semua
        </button>
      </div>

      <ul className="mt-2 divide-y divide-border/60">
        {transactions.map((r) => {
          const cat = resolveCategory(r.cat);
          const labelClass =
            TRANSACTION_LABEL_STYLES[r.label] ??
            "bg-muted text-muted-foreground";

          return (
            <li key={r.id} className="flex items-start gap-3 py-3">
              <div
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-2xl text-lg leading-none",
                  cat.color,
                )}
              >
                <span aria-hidden>{cat.emoji}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-nowrap items-center gap-1.5 overflow-hidden">
                  <p className="min-w-0 shrink truncate text-sm font-semibold text-foreground">
                    {r.title}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      labelClass,
                    )}
                  >
                    {r.label}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {cat.label} · {r.time}
                </p>
                {r.insight ? (
                  <p className="mt-0.5 flex items-start gap-1 text-[11px] font-medium text-secondary">
                    <AlertCircle
                      className="mt-0.5 h-2.5 w-2.5 shrink-0"
                      aria-hidden
                    />
                    <span className="min-w-0 break-words">{r.insight}</span>
                  </p>
                ) : null}
              </div>
              <p
                className={cn(
                  "min-w-[6.75rem] shrink-0 self-start pt-0.5 text-right tabular-nums text-sm font-semibold",
                  r.amount < 0 ? "text-foreground" : "text-primary",
                )}
              >
                {formatListAmount(r.amount)}
              </p>
            </li>
          );
        })}
      </ul>
    </CardShell>
  );
}
