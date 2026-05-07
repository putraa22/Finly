import { cn } from "@/lib/utils";

export function TimeMoneyProgress({
  monthProgress,
  spendProgress,
  barClassName,
  emphasizeSpend,
  className,
}: Readonly<{
  monthProgress: number; // 0-100
  spendProgress: number; // 0-100
  barClassName: string;
  emphasizeSpend?: boolean;
  className?: string;
}>) {
  return (
    <div className={cn("mt-4", className)}>
      <div className="flex items-center justify-between text-[11px] text-white/85">
        <span>Waktu {monthProgress}%</span>
        <span className={cn(emphasizeSpend && "font-semibold text-white")}>
          Uang terpakai {spendProgress}%
        </span>
      </div>

      <div className="relative mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/15">
        <div
          className="absolute top-0 z-10 h-full w-px bg-white/90"
          style={{ left: `${monthProgress}%` }}
        />
        <div
          className={cn("h-full rounded-full transition-all duration-700", barClassName)}
          style={{ width: `${spendProgress}%` }}
        />
      </div>
    </div>
  );
}

