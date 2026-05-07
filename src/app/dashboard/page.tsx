"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  AddTransactionSheet,
  BalanceCard,
  BottomNav,
  BudgetsCard,
  CoachInsight,
  ScreenHeader,
  NotificationsSheet,
  SpendingOverviewCard,
  TransactionsCard,
} from "@/src/components/dashboard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DashboardPage() {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const router = useRouter();
  const [quickAction, setQuickAction] = React.useState<
    null | "challenge" | "set-limit" | "auto-save"
  >(null);

  const handleQuickAction = (action: "challenge" | "set-limit" | "auto-save") => {
    setQuickAction(action);
  };

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_0%,rgba(16,185,129,0.20),transparent_45%),radial-gradient(circle_at_85%_15%,rgba(99,102,241,0.10),transparent_45%)]" />

      <div className="mx-auto w-full max-w-md px-4 pb-28 pt-5 sm:max-w-lg md:max-w-xl lg:max-w-5xl">
        <ScreenHeader
          greeting="Halo, Andra 👋"
          title="Yuk, jaga saldomu"
          right={
            <button
              type="button"
              onClick={() => setNotifOpen(true)}
              className="relative grid size-12 place-items-center rounded-full border border-white/30 bg-white/70 shadow-[0_12px_30px_rgba(0,0,0,0.10)] backdrop-blur-md dark:bg-white/5"
              aria-label="Notifications"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5 text-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span className="absolute right-3 top-3 size-2.5 rounded-full bg-orange-400 ring-2 ring-white/80 dark:ring-black/40" />
            </button>
          }
        />

        <motion.div
          className="mt-5 space-y-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.06, delayChildren: 0.04 },
            },
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <BalanceCard />
          </motion.div>

          <motion.div
            className="space-y-3"
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
          >
            {/* Coach insights — HERO */}
            <section className="px-5 pt-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-base font-bold text-foreground">
                    Misi coach hari ini
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/insights")}
                  className="text-xs font-semibold text-primary"
                >
                  Semua
                </button>
              </div>

              <div className="space-y-3">
                <CoachInsight
                  tone="urgent"
                  priority="high"
                  problem="Pengeluaran makanan naik 32% minggu ini"
                  impact="Kalau lanjut, saldo habis 4 hari lebih cepat dari rencana."
                  action="Mulai 7-day save challenge"
                  onAction={() => handleQuickAction("challenge")}
                />
                <CoachInsight
                  tone="warning"
                  problem="Belanja impulsif terdeteksi 2x minggu ini"
                  impact="Total Rp420rb keluar di luar rencana."
                  action="Aktifkan limit belanja Rp200rb/minggu"
                  onAction={() => handleQuickAction("set-limit")}
                />
                <CoachInsight
                  tone="tip"
                  problem="Kamu bisa nabung Rp1,2jt bulan ini"
                  impact="Auto-save 13% bikin target Bali tercapai 2 bulan lebih cepat."
                  action="Aktifkan auto-save (1 menit)"
                  onAction={() => handleQuickAction("auto-save")}
                />
              </div>
            </section>
          </motion.div>

          <motion.div
            className="grid gap-4 lg:grid-cols-12"
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <div className="grid gap-4 lg:col-span-5">
              <SpendingOverviewCard />
              <BudgetsCard />
            </div>
            <TransactionsCard className="lg:col-span-7" />
          </motion.div>
        </motion.div>
      </div>

      <BottomNav active="home" onAdd={() => setSheetOpen(true)} />

      <AddTransactionSheet open={sheetOpen} onOpenChange={setSheetOpen} />

      <NotificationsSheet open={notifOpen} onOpenChange={setNotifOpen} />

      <Dialog open={quickAction !== null} onOpenChange={(o) => !o && setQuickAction(null)}>
        <DialogContent className="rounded-3xl border-white/30 bg-white/80 backdrop-blur-md dark:bg-black/40">
          <DialogHeader>
            <DialogTitle>Quick action</DialogTitle>
            <DialogDescription>
              {quickAction === "challenge"
                ? "Mulai tantangan hemat 7 hari."
                : quickAction === "set-limit"
                  ? "Aktifkan limit belanja mingguan."
                  : quickAction === "auto-save"
                    ? "Aktifkan auto-save untuk tabungan."
                    : ""}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
