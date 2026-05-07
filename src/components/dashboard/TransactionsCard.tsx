import { ChevronRightIcon } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CardShell } from "./CardShell";
import { SectionTitle } from "./SectionTitle";
import type { DashboardTransaction } from "./dashboard.types";
import { formatIDR } from "./dashboard.utils";

const demoTx: DashboardTransaction[] = [
  {
    id: "t1",
    title: "Gaji",
    category: "Income",
    amount: 8200000,
    createdAt: new Date().toISOString(),
    note: "Transfer dari kantor",
  },
  {
    id: "t2",
    title: "Makan siang",
    category: "Food",
    amount: -42000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    note: "Ayam bakar",
  },
  {
    id: "t3",
    title: "Transport",
    category: "Transport",
    amount: -18000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    note: "Ojol",
  },
];

function badgeClasses(amount: number) {
  return amount < 0
    ? "bg-rose-500/10 text-rose-700 dark:text-rose-200"
    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200";
}

export function TransactionsCard({
  transactions = demoTx,
  className,
}: Readonly<{
  transactions?: DashboardTransaction[];
  className?: string;
}>) {
  return (
    <CardShell className={cn(className)}>
      <SectionTitle
        title="Transaksi"
        subtitle="Terbaru"
        action={
          <span className="text-xs text-muted-foreground">
            {transactions.length} item
          </span>
        }
      />

      <div className="mt-4 divide-y divide-black/5 overflow-hidden rounded-2xl bg-white/50 dark:divide-white/10 dark:bg-white/5">
        {transactions.map((tx) => (
          <Dialog key={tx.id}>
            <DialogTrigger asChild>
              <button className="flex w-full items-center justify-between gap-3 p-3 text-left hover:bg-black/3 dark:hover:bg-white/5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{tx.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {tx.category}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-xs font-semibold",
                      badgeClasses(tx.amount)
                    )}
                  >
                    {formatIDR(tx.amount)}
                  </span>
                  <ChevronRightIcon className="size-4 text-muted-foreground" />
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl border-white/30 bg-white/80 backdrop-blur-md dark:bg-black/40">
              <DialogHeader>
                <DialogTitle>{tx.title}</DialogTitle>
                <DialogDescription>
                  {tx.category} • {new Date(tx.createdAt).toLocaleString("id-ID")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">{formatIDR(tx.amount)}</span>
                </div>
                {tx.note ? (
                  <div className="rounded-2xl bg-white/60 p-3 text-xs text-muted-foreground dark:bg-white/5">
                    {tx.note}
                  </div>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </CardShell>
  );
}

