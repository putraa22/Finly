import { cn } from "@/lib/utils";
import { CardShell } from "./CardShell";
import { SectionTitle } from "./SectionTitle";
import { clamp01, formatIDR } from "./dashboard.utils";

function Ring({
  value,
  className,
}: Readonly<{ value: number; className?: string }>) {
  const v = clamp01(value);
  const pct = Math.round(v * 100);
  return (
    <div
      className={cn(
        "grid size-16 place-items-center rounded-full bg-white/60 text-xs font-semibold text-foreground shadow-sm ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10",
        className
      )}
      style={{
        background:
          `conic-gradient(rgba(16,185,129,0.85) ${pct}%, rgba(0,0,0,0.06) 0)`,
      }}
      aria-label={`Progress ${pct}%`}
    >
      <div className="grid size-12 place-items-center rounded-full bg-background/90 backdrop-blur-md dark:bg-black/40">
        {pct}%
      </div>
    </div>
  );
}

export function SpendingOverviewCard({
  className,
  spent = 1240000,
  limit = 2200000,
}: Readonly<{
  className?: string;
  spent?: number;
  limit?: number;
}>) {
  const pct = spent / Math.max(1, limit);

  return (
    <CardShell className={cn(className)}>
      <SectionTitle
        title="Pengeluaran minggu ini"
        subtitle="Pantau biar tetap aman"
        action={
          <span className="text-[11px] font-semibold text-muted-foreground">
            {formatIDR(spent)}
          </span>
        }
      />

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Sisa budget</p>
          <p className="mt-1 text-sm font-semibold">
            {formatIDR(Math.max(0, limit - spent))}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Limit {formatIDR(limit)}
          </p>
        </div>

        <Ring value={pct} />
      </div>
    </CardShell>
  );
}

