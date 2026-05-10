"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Clock,
  Delete,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { CATEGORIES, formatIDRFull } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/src/lib/hooks/useCountUp";
import { toast } from "@/src/lib/hooks/use-toast";

import {
  AI_SUGGEST_CATEGORY_ID,
  AMOUNT_ANIM_MS,
  COACH_BY_CATEGORY,
  CTA_LABEL_BY_CATEGORY,
  MOCK_DAILY_LIMIT,
  MOCK_FREQUENT_CATEGORY_IDS,
  MOCK_RECENT_CATEGORY_ID,
  MOCK_SPENT_TODAY,
  NUMPAD_KEYS,
  QUICK_AMOUNTS,
  SUBMIT_REDIRECT_MS,
  type NumpadKey,
} from "../addExpense.constants";
import { useExpenseAmountString } from "../addExpense.hooks";
import {
  formatIdrDigits,
  getDailySpendSummary,
  sortCategoriesByFrequency,
  quickChipLabel,
  type SpendStatus,
} from "../addExpense.utils";

const STATUS_PRESENTATION: Record<
  SpendStatus,
  { ring: string; chip: string; Icon: LucideIcon; msg: string }
> = {
  safe: {
    ring: "ring-emerald-500/35",
    chip: "bg-white/15 text-white",
    Icon: Shield,
    msg: "Masih aman, lanjut santai 👍",
  },
  warn: {
    ring: "ring-secondary/45",
    chip: "bg-secondary/90 text-secondary-foreground",
    Icon: AlertTriangle,
    msg: "Mendekati batas harian ⚠️",
  },
  over: {
    ring: "ring-destructive/50",
    chip: "bg-destructive/90 text-destructive-foreground",
    Icon: AlertTriangle,
    msg: "Akan melewati batas harianmu",
  },
};

const FREQUENT_CATEGORY_SET = new Set<string>(MOCK_FREQUENT_CATEGORY_IDS);

function SheetHandle() {
  return (
    <div className="flex flex-col items-center pt-3">
      <div className="h-1.5 w-12 rounded-full bg-border" />
    </div>
  );
}

function TopBar({ onBack }: Readonly<{ onBack: () => void }>) {
  return (
    <div className="flex items-center justify-between px-5 pt-4">
      <button
        type="button"
        onClick={onBack}
        className="flex size-10 items-center justify-center rounded-full bg-card shadow-sm transition active:scale-95"
        aria-label="Kembali"
      >
        <ArrowLeft className="size-4" aria-hidden />
      </button>
      <div className="text-center">
        <p className="font-heading text-base font-bold">Catat pengeluaran</p>
        <p className="text-[11px] text-muted-foreground">
          Cepat • cuma 5 detik
        </p>
      </div>
      <div className="size-10" aria-hidden />
    </div>
  );
}

function AmountHeroCard({
  animatedDigits,
  summary,
}: Readonly<{
  animatedDigits: string;
  summary: ReturnType<typeof getDailySpendSummary>;
}>) {
  const ui = STATUS_PRESENTATION[summary.status];
  const StatusIcon = ui.Icon;
  const fillPct = Math.min(100, summary.ratio * 100);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-emerald-600 p-6 text-primary-foreground shadow-[0_16px_48px_rgba(0,0,0,0.18)] ring-1 ring-white/15 transition-all dark:shadow-[0_16px_48px_rgba(0,0,0,0.45)]",
        ui.ring,
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 size-32 rounded-full bg-primary/25 blur-2xl" />

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">
          Jumlah pengeluaran
        </p>
        <span
          className={cn(
            "inline-flex max-w-[58%] items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-tight",
            ui.chip,
          )}
        >
          <StatusIcon className="size-3.5 shrink-0" aria-hidden />
          <span className="wrap-break-word">{ui.msg}</span>
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-primary-foreground/80">
          Rp
        </span>
        <span className="font-heading text-[44px] font-bold leading-none tracking-tight tabular-nums">
          {animatedDigits}
        </span>
      </div>

      <div className="mt-5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              summary.status === "over"
                ? "bg-destructive"
                : summary.status === "warn"
                  ? "bg-secondary"
                  : "bg-white",
            )}
            style={{ width: `${fillPct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-primary-foreground/85">
          <span className="inline-flex min-w-0 items-center gap-1">
            <Clock className="size-3 shrink-0" aria-hidden />
            <span className="truncate">
              Hari ini terpakai {formatIDRFull(MOCK_SPENT_TODAY)}
            </span>
          </span>
          <span className="shrink-0 font-semibold text-white">
            Sisa aman {formatIDRFull(summary.remaining)}
          </span>
        </div>
      </div>
    </div>
  );
}

function QuickAmountRow({
  onPick,
  onReset,
}: Readonly<{
  onPick: (n: number) => void;
  onReset: () => void;
}>) {
  return (
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {QUICK_AMOUNTS.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onPick(q)}
          className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:border-primary/40 hover:bg-primary/12 hover:text-primary active:scale-95"
        >
          + Rp{quickChipLabel(q)}
        </button>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="shrink-0 rounded-full px-3 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
      >
        Reset
      </button>
    </div>
  );
}

function CategoryPicker({
  categories,
  selectedId,
  onSelect,
}: Readonly<{
  categories: ReturnType<typeof sortCategoriesByFrequency>;
  selectedId: string;
  onSelect: (id: string) => void;
}>) {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {categories.map((c) => {
        const active = selectedId === c.id;
        const isFreq = FREQUENT_CATEGORY_SET.has(c.id);
        const isRecent = c.id === MOCK_RECENT_CATEGORY_ID;

        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={cn(
              "relative flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all duration-200 ease-out active:scale-[0.96]",
              active
                ? "scale-[1.03] border-primary bg-primary/12 shadow-md"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            {active && (
              <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-2.5" strokeWidth={3} aria-hidden />
              </span>
            )}
            {!active && isFreq && (
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
            )}
            {!active && isRecent && (
              <span className="absolute left-1.5 top-1.5 text-[8px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                •
              </span>
            )}
            <span className="text-2xl">{c.emoji}</span>
            <span
              className={cn(
                "text-center text-[11px] font-semibold leading-tight",
                active ? "text-primary" : "text-foreground",
              )}
            >
              {c.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CoachPanel({ categoryId }: Readonly<{ categoryId: string }>) {
  const coach = COACH_BY_CATEGORY[categoryId] ?? COACH_BY_CATEGORY.other;

  return (
    <div
      className={cn(
        "mt-4 flex animate-in fade-in-0 duration-300 items-start gap-3 rounded-2xl border p-3.5 fill-mode-both",
        coach.tone === "warn" &&
          "border-secondary/30 bg-secondary/12 dark:bg-secondary/15",
        coach.tone === "good" &&
          "border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15",
        coach.tone === "tip" && "border-border bg-muted",
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-xl",
          coach.tone === "warn" && "bg-secondary text-secondary-foreground",
          coach.tone === "good" &&
            "bg-emerald-600 text-white dark:bg-emerald-500",
          coach.tone === "tip" &&
            "bg-card text-foreground shadow-sm dark:bg-card",
        )}
      >
        <Sparkles className="size-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Asisten Finly
        </p>
        <p className="mt-0.5 text-sm font-medium leading-snug text-foreground wrap-break-word">
          {coach.text}
        </p>
      </div>
    </div>
  );
}

function NumpadGrid({ onKey }: Readonly<{ onKey: (k: NumpadKey) => void }>) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {NUMPAD_KEYS.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onKey(k)}
          className="h-12 rounded-2xl bg-card text-lg font-semibold text-foreground shadow-sm transition-all duration-150 ease-out active:scale-95 active:bg-secondary/25"
        >
          {k === "back" ? <Delete className="mx-auto size-4" aria-hidden /> : k}
        </button>
      ))}
    </div>
  );
}

export function AddExpenseScreen() {
  const router = useRouter();
  const { numeric, appendKey, bumpBy, clear } = useExpenseAmountString();
  const [category, setCategory] = React.useState("food");
  const [note, setNote] = React.useState("");

  const animated = useCountUp(numeric, AMOUNT_ANIM_MS);
  const animatedDigits = formatIdrDigits(animated);

  const summary = React.useMemo(
    () => getDailySpendSummary(MOCK_SPENT_TODAY, numeric, MOCK_DAILY_LIMIT),
    [numeric],
  );

  const sortedCategories = React.useMemo(
    () => sortCategoriesByFrequency(CATEGORIES, MOCK_FREQUENT_CATEGORY_IDS),
    [],
  );

  const selectedCategory = CATEGORIES.find((c) => c.id === category)!;
  const aiSuggestionLabel =
    CATEGORIES.find((c) => c.id === AI_SUGGEST_CATEGORY_ID)?.label ?? "";

  const submit = () => {
    if (numeric <= 0) {
      toast({
        title: "Masukkan jumlah dulu ya",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: `Tercatat: ${formatIDRFull(numeric)} • ${selectedCategory.label}`,
    });
    window.setTimeout(() => router.push("/dashboard"), SUBMIT_REDIRECT_MS);
  };

  const ctaLabel =
    CTA_LABEL_BY_CATEGORY[category] ?? CTA_LABEL_BY_CATEGORY.other;

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300 fill-mode-both">
      <SheetHandle />
      <TopBar onBack={() => router.back()} />

      <div className="px-5 pt-4">
        <AmountHeroCard animatedDigits={animatedDigits} summary={summary} />
        <QuickAmountRow onPick={(n) => bumpBy(n)} onReset={clear} />
      </div>

      <section className="mt-6 px-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Kategori
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <Sparkles className="size-3" aria-hidden />
            Saran AI: {aiSuggestionLabel}
          </span>
        </div>

        <CategoryPicker
          categories={sortedCategories}
          selectedId={category}
          onSelect={setCategory}
        />
        <CoachPanel key={category} categoryId={category} />

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tambah catatan singkat (opsional)"
          className="mt-3 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </section>

      <section className="mt-5 px-5 pb-6">
        <NumpadGrid onKey={appendKey} />

        <button
          type="button"
          onClick={submit}
          disabled={numeric <= 0}
          className={cn(
            "mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold transition-all duration-200 ease-out",
            numeric > 0
              ? "bg-linear-to-br from-primary to-emerald-700 text-primary-foreground shadow-[0_14px_36px_color-mix(in_oklch,var(--primary)_38%,transparent)] active:scale-[0.98]"
              : "bg-muted text-muted-foreground",
          )}
        >
          {numeric > 0 ? (
            <>
              <Check className="size-5" aria-hidden />
              {ctaLabel}
            </>
          ) : (
            <>
              <TrendingUp className="size-5" aria-hidden />
              Masukkan jumlah dulu
            </>
          )}
        </button>

        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
          Kebiasaan kecil membentuk kontrol finansial yang lebih baik ✨
        </p>
      </section>
    </div>
  );
}
