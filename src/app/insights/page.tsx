"use client";

import { cn } from "@/lib/utils";
import { useInsightUiStore, type InsightListFilter } from "@/store/insight-store";

const FILTERS: ReadonlyArray<{ id: InsightListFilter; label: string }> = [
  { id: "all", label: "Semua" },
  { id: "warnings_only", label: "Peringatan saja" },
];

export default function InsightsPage() {
  const listFilter = useInsightUiStore((s) => s.listFilter);
  const setListFilter = useInsightUiStore((s) => s.setListFilter);

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-28 pt-8 sm:max-w-lg md:max-w-xl lg:max-w-5xl">
      <h1 className="font-heading text-lg font-bold text-foreground">
        Insights
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Ringkasan pola pengeluaran — halaman ini bisa kamu lengkapi nanti.
      </p>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Filter insight">
        {FILTERS.map(({ id, label }) => {
          const active = listFilter === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setListFilter(id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Filter ini dipakai saat daftar insight siap — preferensi tetap di sesi ini.
      </p>
    </div>
  );
}
