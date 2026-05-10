"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Home, LineChart, Plus, Sparkles, User } from "lucide-react";

import { cn } from "@/lib/utils";

type BottomNavItem = Readonly<{
  href: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
}>;

const items: BottomNavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/insights", label: "Insights", icon: Sparkles },
  { href: "/addexpense", label: "Add", icon: Plus, primary: true },
  { href: "/future", label: "Future", icon: LineChart },
  { href: "/profile", label: "Profile", icon: User },
];

function navItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav({
  className,
}: Readonly<{
  className?: string;
}>) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 sm:max-w-lg md:max-w-xl lg:max-w-5xl",
        className,
      )}
      aria-label="Primary"
    >
      <div className="relative flex items-end justify-between rounded-3xl border border-border/60 bg-card/90 px-2 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
        {items.map((item) => {
          const Icon = item.icon;
          const active = navItemActive(pathname, item.href);

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mt-7 grid size-14 place-items-center rounded-full bg-linear-to-br from-primary to-primary/85 text-primary-foreground shadow-[0_14px_36px_color-mix(in_oklch,var(--primary)_38%,transparent)] transition-all duration-300 ease-out active:scale-95",
                  active && "scale-105",
                )}
              >
                <Icon className="size-6" strokeWidth={2.5} aria-hidden />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors duration-300 ease-out",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0 transition-transform duration-300",
                  active && "scale-110",
                )}
                strokeWidth={2.25}
                aria-hidden
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
