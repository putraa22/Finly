import {
  AlertCircle,
  Eye,
  EyeOff,
  Flame,
  Shield,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { formatIDR, formatIDRFull } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/lib/hooks/useCountUp";
import { CardShell } from "./CardShell";
import { MetricMiniCard } from "./MetricMiniCard";
import { TimeMoneyProgress } from "./TimeMoneyProgress";
import { clampPct, getBalanceStatus } from "./balanceCard.utils";

type BalanceCardProps = Readonly<{
  className?: string;
  name?: string;
  balance?: number;
  income?: number;
  spent?: number;
  totalSpendingAllTime?: number;
  daysLeft?: number;
  daysInMonth?: number;
  dayOfMonth?: number;
  habitDeltaPct?: number;
}>;

export function BalanceCard({
  className,
  name = "Andra",
  balance = 3_680_000,
  income = 9_500_000,
  spent = 5_800_000,
  totalSpendingAllTime,
  daysLeft = 18,
  daysInMonth = 30,
  dayOfMonth = 12,
  habitDeltaPct = 25,
}: BalanceCardProps) {
  const [hidden, setHidden] = useState(false);
  const safeDaily = daysLeft > 0 ? Math.floor(balance / daysLeft) : 0;
  const monthProgress = clampPct((dayOfMonth / Math.max(1, daysInMonth)) * 100);
  const spendProgress = clampPct((spent / Math.max(1, income)) * 100);
  const status = getBalanceStatus({ monthProgress, spendProgress });

  const statusMeta = {
    safe: {
      label: "Aman",
      icon: Shield,
      chip: "bg-emerald-500/20 text-white",
      bar: "bg-white/95",
    },
    warning: {
      label: "Hati-hati",
      icon: AlertCircle,
      chip: "bg-orange-500/30 text-white",
      bar: "bg-orange-400",
    },
    critical: {
      label: "Kritis",
      icon: Flame,
      chip: "bg-rose-500/40 text-white",
      bar: "bg-rose-500",
    },
  }[status];
  const StatusIcon = statusMeta.icon;

  const animated = useCountUp(balance);

  return (
    <CardShell
      className={cn(
        "relative overflow-hidden border-white/30 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.22),transparent_58%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.12),transparent_55%),linear-gradient(135deg,rgba(16,185,129,0.95),rgba(5,150,105,0.92))] text-white shadow-[0_22px_60px_rgba(16,185,129,0.28)] ring-1 ring-white/10 backdrop-blur-sm p-6",
        className,
      )}
    >
      <div className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 size-44 rounded-full bg-white/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-white/85">
              Halo {name},
            </p>
            <p className="text-xs text-white/70">kondisi keuanganmu hari ini</p>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm",
              statusMeta.chip,
            )}
          >
            <StatusIcon className="size-3" />
            {statusMeta.label}
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/75">
              Sisa saldo
            </p>
            <p className="mt-1 truncate text-[40px] font-bold leading-tight">
              {hidden ? "••••••••" : formatIDRFull(animated)}
            </p>
          </div>
          <button
            onClick={() => setHidden((v) => !v)}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-white/90 transition-colors hover:bg-white/25"
            aria-label={hidden ? "Show balance" : "Hide balance"}
            type="button"
          >
            {hidden ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white/12 px-3 py-2 backdrop-blur-sm">
          <Sparkles className="size-3.5 shrink-0" />
          <p className="text-[12px] leading-snug">
            {habitDeltaPct > 0 ? (
              <>
                Pengeluaranmu{" "}
                <span className="font-bold">{habitDeltaPct}% lebih tinggi</span>{" "}
                dari kebiasaan harian
              </>
            ) : (
              <>
                Kamu hemat{" "}
                <span className="font-bold">{Math.abs(habitDeltaPct)}%</span>{" "}
                dari biasanya — keren!
              </>
            )}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <MetricMiniCard
            label="Prediksi habis"
            value={`${daysLeft} hari`}
            caption="dengan pola ini"
          />
          <MetricMiniCard
            label="Aman/hari"
            value={hidden ? "••••" : formatIDR(safeDaily)}
            caption="biar nyampe akhir bulan"
          />
        </div>

        <TimeMoneyProgress
          monthProgress={monthProgress}
          spendProgress={spendProgress}
          barClassName={statusMeta.bar}
          emphasizeSpend={status !== "safe"}
        />

        <div className="mt-2 flex justify-between text-[11px] text-white/75">
          <span>Masuk {hidden ? "••" : formatIDR(income)}</span>
          <span>Keluar bulan ini {hidden ? "••" : formatIDR(spent)}</span>
        </div>
        {totalSpendingAllTime !== undefined ? (
          <p className="mt-1.5 text-[11px] text-white/75">
            Total keluar (semua waktu):{" "}
            {hidden ? "••••••" : formatIDRFull(totalSpendingAllTime)}
          </p>
        ) : null}
      </div>
    </CardShell>
  );
}
