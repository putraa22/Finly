"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  BalanceCard,
  CoachInsight,
  MiniSimulator,
  NotificationsSheet,
  ProgressToday,
  QuickActions,
  ScreenHeader,
  SpendingBreakdown,
  TransactionsCard,
  type QuickActionId,
} from "@/components/dashboard";
import type { DashboardSummary } from "@/lib/dashboard/summary";
import type { DashboardInsight } from "@/lib/insights/types";
import { toast } from "@/lib/hooks/use-toast";
import { useDashboardUiStore } from "@/store/dashboard-store";

import { QUICK_ACTION_FEEDBACK_COPY } from "./quickAction.copy";

const FALLBACK_INSIGHTS: DashboardInsight[] = [
  {
    id: "fallback-empty",
    kind: "spending_awareness",
    tone: "tip",
    problem: "Belum ada cukup data untuk insight personal.",
    impact: "Catat beberapa pengeluaran dulu — pola akan terlihat di sini.",
    action: "Tambah pengeluaran",
    quickAction: "fix",
  },
];

export function DashboardClient({
  summary,
}: Readonly<{ summary: DashboardSummary }>) {
  const notifOpen = useDashboardUiStore((s) => s.notifOpen);
  const setNotifOpen = useDashboardUiStore((s) => s.setNotifOpen);
  const router = useRouter();

  const insightsToShow =
    summary.insights.length > 0 ? summary.insights : FALLBACK_INSIGHTS;

  const dailyBurnEstimate = Math.max(
    1,
    Math.round(summary.spentThisMonth / Math.max(1, summary.dayOfMonth)),
  );

  const handleQuickAction = (action: QuickActionId) => {
    const copy = QUICK_ACTION_FEEDBACK_COPY[action];
    toast({
      title: copy.title,
      description: copy.description,
    });
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
            <BalanceCard
              balance={summary.balance}
              income={summary.monthlyIncome}
              spent={summary.spentThisMonth}
              totalSpendingAllTime={summary.totalSpending}
              daysLeft={summary.daysLeftInMonth}
              daysInMonth={summary.daysInMonth}
              dayOfMonth={summary.dayOfMonth}
            />
          </motion.div>

          <motion.div
            className="space-y-3"
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
          >
            {/* Coach insights — HERO */}
            <section className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-base font-bold text-foreground">
                    Insight untuk kamu
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
                {insightsToShow.map((insight, index) => {
                  const showKindLabel =
                    index === 0 ||
                    insight.kind !== insightsToShow[index - 1]!.kind;

                  const kindLabel =
                    insight.kind === "warning"
                      ? "Peringatan"
                      : insight.kind === "encouragement"
                        ? "Semangat"
                        : insight.kind === "spending_awareness"
                          ? "Kesadaran pengeluaran"
                          : "Feedback perilaku";

                  return (
                    <div key={insight.id} className="space-y-2">
                      {showKindLabel ? (
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {kindLabel}
                        </p>
                      ) : null}
                      <CoachInsight
                        tone={insight.tone}
                        priority={insight.priority}
                        problem={insight.problem}
                        impact={insight.impact}
                        action={insight.action}
                        onAction={
                          insight.quickAction
                            ? () =>
                                handleQuickAction(
                                  insight.quickAction as QuickActionId,
                                )
                            : undefined
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <ProgressToday
              spentToday={summary.spentToday}
              dailyLimit={summary.dailyLimit}
            />
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <QuickActions onAction={handleQuickAction} />
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <MiniSimulator
              currentBalance={summary.balance}
              dailyBurn={dailyBurnEstimate}
              daysLeft={summary.daysLeftInMonth}
              monthlyIncome={summary.monthlyIncome}
              onApply={() =>
                toast({
                  title: "Rencana disimpan",
                  description: "Nanti bisa kamu hubungkan ke data nyata.",
                })
              }
            />
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <SpendingBreakdown
              items={summary.spendingBreakdownItems}
              total={summary.spentThisMonth}
              onDetail={() => router.push("/insights")}
            />
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <TransactionsCard
              transactions={summary.latestTransactions}
              onViewAll={() => router.push("/transactions")}
            />
          </motion.div>
        </motion.div>
      </div>

      <NotificationsSheet open={notifOpen} onOpenChange={setNotifOpen} />
    </div>
  );
}
