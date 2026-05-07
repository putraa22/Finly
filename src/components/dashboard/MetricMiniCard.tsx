import { cn } from "@/lib/utils";

export function MetricMiniCard({
  label,
  value,
  caption,
  className,
}: Readonly<{
  label: string;
  value: React.ReactNode;
  caption: string;
  className?: string;
}>) {
  return (
    <div className={cn("rounded-2xl bg-white/12 p-3 backdrop-blur-sm", className)}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-white/75">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold">{value}</p>
      <p className="text-[10px] text-white/70">{caption}</p>
    </div>
  );
}

