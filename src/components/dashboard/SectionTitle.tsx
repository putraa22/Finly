import { cn } from "@/lib/utils";

export function SectionTitle({
  title,
  subtitle,
  action,
  className,
}: Readonly<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}>) {
  return (
    <div className={cn("flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        <p className="text-lg font-semibold tracking-tight">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

