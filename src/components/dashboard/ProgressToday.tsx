import type { ReactNode } from "react";
import { Flame, PiggyBank, Trophy } from "lucide-react";

import { formatIDRFull } from "@/lib/finance";
import { cn } from "@/lib/utils";

import { CardShell } from "./CardShell";

export type ProgressTodayProps = Readonly<{
  className?: string;
  spentToday?: number;
  dailyLimit?: number;
  weeklySaved?: number;
  weeklyGoal?: number;
  streakDays?: number;
}>;

export function ProgressToday({
  className,
  spentToday = 340_000,
  dailyLimit = 500_000,
  weeklySaved = 620_000,
  weeklyGoal = 1_200_000,
  streakDays = 5,
}: ProgressTodayProps) {
  const dailyPct = Math.min(
    100,
    Math.round((spentToday / Math.max(1, dailyLimit)) * 100),
  );
  const remaining = Math.max(0, dailyLimit - spentToday);
  const weeklyPct = Math.min(
    100,
    Math.round((weeklySaved / Math.max(1, weeklyGoal)) * 100),
  );
  const onTrack = dailyPct <= 80;

  return (
    <CardShell
      className={cn(
        "animate-in fade-in-0 p-5 duration-300 fill-mode-both",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-heading text-base font-bold text-foreground">
            Progress kamu hari ini
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Setiap kebiasaan kecil itu penting
          </p>
        </div>
        <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-1 text-[11px] font-bold text-secondary">
          <Flame className="h-3 w-3" aria-hidden />
          {streakDays} hari streak
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 rounded-2xl bg-linear-to-br from-muted/90 to-muted/40 p-4 dark:from-white/10 dark:to-white/5">
        <DailyRing pct={dailyPct} onTrack={onTrack} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Limit harian
          </p>
          <p className="font-heading tabular-nums text-base font-bold text-foreground">
            {formatIDRFull(spentToday)}{" "}
            <span className="text-xs font-medium text-muted-foreground">
              / {formatIDRFull(dailyLimit)}
            </span>
          </p>
          <p
            className={cn(
              "mt-0.5 text-xs font-medium",
              onTrack ? "text-primary" : "text-secondary",
            )}
          >
            {onTrack
              ? `Sisa ${formatIDRFull(remaining)} buat hari ini ✨`
              : `Tinggal ${formatIDRFull(remaining)} — pelan-pelan ya`}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-primary/15 bg-primary/10 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <PiggyBank className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">
                Tabungan minggu ini
              </p>
              <p className="tabular-nums text-sm font-bold text-primary">
                {weeklyPct}%
              </p>
            </div>
            <p className="tabular-nums text-xs text-muted-foreground">
              {formatIDRFull(weeklySaved)} dari {formatIDRFull(weeklyGoal)}
            </p>
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted/80 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-linear-to-r from-primary to-emerald-400 transition-all duration-700 ease-out"
            style={{ width: `${weeklyPct}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <RewardChip icon="🎉" text="Hemat Rp80rb hari ini" />
        <RewardChip icon="🔥" text="3 hari pengeluaran terkontrol" />
        <RewardChip
          icon={<Trophy className="h-3.5 w-3.5" aria-hidden />}
          text="Lvl 4 Saver"
        />
      </div>
    </CardShell>
  );
}

function DailyRing({
  pct,
  onTrack,
}: Readonly<{ pct: number; onTrack: boolean }>) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const stroke = onTrack ? "var(--primary)" : "var(--secondary)";
  return (
    <div className="relative grid h-[68px] w-[68px] shrink-0 place-items-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64" aria-hidden>
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth="6"
        />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute font-heading text-sm font-bold tabular-nums text-foreground">
        {pct}%
      </span>
    </div>
  );
}

function RewardChip({
  icon,
  text,
}: Readonly<{ icon: ReactNode; text: string }>) {
  return (
    <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[11px] font-semibold text-foreground">
      <span className="grid place-items-center">{icon}</span>
      {text}
    </div>
  );
}
