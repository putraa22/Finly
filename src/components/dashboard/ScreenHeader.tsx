import type { ReactNode } from "react";

export type ScreenHeaderProps = Readonly<{
  greeting?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}>;

export function ScreenHeader({ greeting, title, subtitle, right }: ScreenHeaderProps) {
  return (
    <header className="flex items-start justify-between px-5 pt-8 pb-4">
      <div className="min-w-0">
        {greeting ? (
          <p className="text-sm font-medium text-muted-foreground">{greeting}</p>
        ) : null}
        <h1 className="truncate text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </header>
  );
}

