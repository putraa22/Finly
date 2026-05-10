"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles, TrendingUp } from "lucide-react";

import { CATEGORIES, formatIDRFull } from "@/lib/finance";
import { useCountUp } from "@/lib/hooks/useCountUp";
import { toast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useExpenseDraftStore } from "@/store/expense-store";

import {
  AI_SUGGEST_CATEGORY_ID,
  AMOUNT_ANIM_MS,
  CTA_LABEL_BY_CATEGORY,
  MOCK_DAILY_LIMIT,
  MOCK_FREQUENT_CATEGORY_IDS,
  MOCK_SPENT_TODAY,
  SUCCESS_REDIRECT_MS,
} from "../addExpense.constants";
import {
  formatIdrDigits,
  getDailySpendSummary,
  sortCategoriesByFrequency,
} from "../addExpense.utils";

import { ExpenseAmountHeroCard } from "./parts/ExpenseAmountHeroCard";
import { ExpenseCategoryPicker } from "./parts/ExpenseCategoryPicker";
import { ExpenseCoachPanel } from "./parts/ExpenseCoachPanel";
import { ExpenseNumpadGrid } from "./parts/ExpenseNumpadGrid";
import { ExpenseQuickAmountRow } from "./parts/ExpenseQuickAmountRow";
import { ExpenseSheetHandle } from "./parts/ExpenseSheetHandle";
import { ExpenseTopBar } from "./parts/ExpenseTopBar";

const SUCCESS_TOAST_CLASS =
  "border-emerald-500/35 bg-emerald-500/[0.12] shadow-[0_14px_40px_color-mix(in_oklch,var(--primary)_12%,transparent)]";

export function AddExpenseScreen() {
  const router = useRouter();
  const numeric = useExpenseDraftStore(
    (s) => Number(s.amount) || 0,
  );
  const appendKey = useExpenseDraftStore((s) => s.appendKey);
  const bumpBy = useExpenseDraftStore((s) => s.bumpBy);
  const clearAmount = useExpenseDraftStore((s) => s.clearAmount);
  const category = useExpenseDraftStore((s) => s.categoryId);
  const setCategoryId = useExpenseDraftStore((s) => s.setCategoryId);
  const note = useExpenseDraftStore((s) => s.note);
  const setNote = useExpenseDraftStore((s) => s.setNote);
  const resetDraft = useExpenseDraftStore((s) => s.resetDraft);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  const submit = async () => {
    if (numeric <= 0) {
      toast({
        title: "Masukkan jumlah dulu ya",
        variant: "destructive",
      });
      return;
    }

    const submittedAmount = numeric;
    const submittedCategoryLabel = selectedCategory.label;

    setIsSubmitting(true);
    let succeeded = false;

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numeric,
          category,
          note: note.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };

      if (!res.ok) {
        toast({
          title: data.message ?? "Gagal menyimpan transaksi",
          variant: "destructive",
        });
        return;
      }

      succeeded = true;

      resetDraft();

      toast({
        title: `Tercatat: ${formatIDRFull(submittedAmount)} • ${submittedCategoryLabel}`,
        description: "Transaksi tersimpan. Mengarahkan ke dashboard…",
        className: SUCCESS_TOAST_CLASS,
      });

      window.setTimeout(() => {
        setIsSubmitting(false);
        router.push("/dashboard");
      }, SUCCESS_REDIRECT_MS);
    } catch {
      toast({
        title: "Tidak terhubung",
        description: "Periksa koneksi lalu coba lagi.",
        variant: "destructive",
      });
    } finally {
      if (!succeeded) {
        setIsSubmitting(false);
      }
    }
  };

  const ctaLabel =
    CTA_LABEL_BY_CATEGORY[category] ?? CTA_LABEL_BY_CATEGORY.other;

  const controlsLocked = isSubmitting;

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300 fill-mode-both">
      <ExpenseSheetHandle />
      <ExpenseTopBar onBack={() => router.back()} />

      <div className="px-5 pt-4">
        <ExpenseAmountHeroCard animatedDigits={animatedDigits} summary={summary} />
        <ExpenseQuickAmountRow
          onPick={(n) => bumpBy(n)}
          onReset={clearAmount}
          disabled={controlsLocked}
        />
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

        <ExpenseCategoryPicker
          categories={sortedCategories}
          selectedId={category}
          onSelect={setCategoryId}
          disabled={controlsLocked}
        />
        <ExpenseCoachPanel key={category} categoryId={category} />

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tambah catatan singkat (opsional)"
          disabled={controlsLocked}
          className="mt-3 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </section>

      <section className="mt-5 px-5 pb-6">
        <ExpenseNumpadGrid onKey={appendKey} disabled={controlsLocked} />

        <button
          type="button"
          onClick={submit}
          aria-busy={isSubmitting}
          disabled={numeric <= 0 || isSubmitting}
          className={cn(
            "mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold transition-all duration-200 ease-out",
            numeric > 0 && !isSubmitting
              ? "bg-linear-to-br from-primary to-emerald-700 text-primary-foreground shadow-[0_14px_36px_color-mix(in_oklch,var(--primary)_38%,transparent)] active:scale-[0.98]"
              : "bg-muted text-muted-foreground",
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden />
              Menyimpan…
            </>
          ) : numeric <= 0 ? (
            <>
              <TrendingUp className="size-5" aria-hidden />
              Masukkan jumlah dulu
            </>
          ) : (
            <>
              <Check className="size-5" aria-hidden />
              {ctaLabel}
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
