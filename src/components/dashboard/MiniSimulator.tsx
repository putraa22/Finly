"use client";

import * as React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

import { Slider } from "@/components/ui/slider";
import { formatIDRFull } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { useDashboardUiStore } from "@/store/dashboard-store";

import { CardShell } from "./CardShell";

export type MiniSimulatorProps = Readonly<{
  className?: string;
  currentBalance?: number;
  dailyBurn?: number;
  daysLeft?: number;
  monthlyIncome?: number;
  onApply?: () => void;
}>;

export function MiniSimulator({
  className,
  currentBalance = 3_680_000,
  dailyBurn = 205_000,
  daysLeft = 18,
  monthlyIncome = 9_500_000,
  onApply,
}: MiniSimulatorProps) {
  const foodCut = useDashboardUiStore((s) => s.simulatorFoodCutPct);
  const setFoodCut = useDashboardUiStore((s) => s.setSimulatorFoodCutPct);
  const savePlus = useDashboardUiStore((s) => s.simulatorSavePlusPct);
  const setSavePlus = useDashboardUiStore((s) => s.setSimulatorSavePlusPct);
  const fillGradientId = `simFill-${React.useId().replace(/:/g, "")}`;

  const sim = React.useMemo(() => {
    const foodShare = 0.32;
    const newBurn = dailyBurn * (1 - foodShare * (foodCut / 100));
    const monthlySave = (monthlyIncome * savePlus) / 100;
    const newDays =
      newBurn > 0 ? Math.floor(currentBalance / newBurn) : 99;
    const w = 320;
    const h = 90;
    const steps = 14;
    const baseline = Array.from({ length: steps }, (_, i) => {
      const x = (i / (steps - 1)) * w;
      const remaining = Math.max(
        0,
        currentBalance - dailyBurn * (i * (daysLeft / (steps - 1))),
      );
      const y = h - (remaining / currentBalance) * (h - 10) - 5;
      return `${x},${y}`;
    });
    const projected = Array.from({ length: steps }, (_, i) => {
      const x = (i / (steps - 1)) * w;
      const remaining = Math.max(
        0,
        currentBalance - newBurn * (i * (daysLeft / (steps - 1))),
      );
      const y = h - (remaining / currentBalance) * (h - 10) - 5;
      return `${x},${y}`;
    });
    return {
      baselinePath: `M${baseline.join(" L")}`,
      projectedPath: `M${projected.join(" L")}`,
      area: `M${projected.join(" L")} L${w},${h} L0,${h} Z`,
      newDays,
      monthlySave,
      w,
      h,
    };
  }, [
    foodCut,
    savePlus,
    currentBalance,
    dailyBurn,
    daysLeft,
    monthlyIncome,
  ]);

  const extraDays = sim.newDays - daysLeft;

  return (
    <CardShell className={cn("overflow-hidden p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Simulasi cepat
          </div>
          <h2 className="mt-2 font-heading text-[15px] font-bold leading-snug text-foreground">
            Coba ubah kebiasaan,{" "}
            <span className="text-primary">lihat dampaknya</span>
          </h2>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-linear-to-br from-muted/90 to-muted/40 p-3 dark:from-white/10 dark:to-white/5">
        <svg
          viewBox={`0 0 ${sim.w} ${sim.h}`}
          className="h-24 w-full"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--primary)"
                stopOpacity={0.28}
              />
              <stop
                offset="100%"
                stopColor="var(--primary)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <path d={sim.area} fill={`url(#${fillGradientId})`} />
          <path
            d={sim.baselinePath}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
          <path
            d={sim.projectedPath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="mt-1 flex items-center justify-between text-[10px] font-medium">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <span className="h-0.5 w-3 bg-muted-foreground" /> Sekarang
          </span>
          <span className="inline-flex items-center gap-1 text-primary">
            <span className="h-0.5 w-3 bg-primary" /> Dengan rencana
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat
          label="Saldo bertahan"
          value={`${sim.newDays} hari`}
          delta={extraDays > 0 ? `+${extraDays} hari` : `${extraDays} hari`}
          positive={extraDays > 0}
        />
        <Stat
          label="Tabungan bulanan"
          value={formatIDRFull(sim.monthlySave)}
          delta={`+${savePlus}%`}
          positive
        />
      </div>

      <div className="mt-4 space-y-4">
        <SliderRow
          emoji="🍜"
          label="Kurangi makan di luar"
          value={foodCut}
          prefix="−"
          suffix="%"
          onChange={setFoodCut}
          max={50}
        />
        <SliderRow
          emoji="💰"
          label="Tambah tabungan"
          value={savePlus}
          prefix="+"
          suffix="%"
          onChange={setSavePlus}
          max={30}
        />
      </div>

      <button
        type="button"
        onClick={onApply}
        className="group mt-5 inline-flex w-full items-center justify-between gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_8px_28px_color-mix(in_oklch,var(--primary)_35%,transparent)] transition-all active:scale-[0.98]"
      >
        <span>Terapkan rencana ini</span>
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </button>
    </CardShell>
  );
}

function Stat({
  label,
  value,
  delta,
  positive,
}: Readonly<{
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}>) {
  return (
    <div className="rounded-2xl bg-muted/50 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-heading text-base font-bold tabular-nums text-foreground">
        {value}
      </p>
      <p
        className={cn(
          "text-[11px] font-semibold tabular-nums",
          positive ? "text-primary" : "text-destructive",
        )}
      >
        {delta}
      </p>
    </div>
  );
}

function SliderRow({
  emoji,
  label,
  value,
  prefix,
  suffix,
  onChange,
  max,
}: Readonly<{
  emoji: string;
  label: string;
  value: number;
  prefix: string;
  suffix: string;
  onChange: (v: number) => void;
  max: number;
}>) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          <span className="text-base leading-none">{emoji}</span>
          {label}
        </span>
        <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 font-heading text-xs font-bold tabular-nums text-primary">
          {prefix}
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0] ?? 0)}
        min={0}
        max={max}
        step={1}
      />
    </div>
  );
}
