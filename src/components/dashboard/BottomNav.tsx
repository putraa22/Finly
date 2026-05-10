"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  PlusIcon,
  Sparkles,
  TrendingUp,
  UserIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BottomNavKey = "home" | "insights" | "future" | "profile";

function NavItem({
  href,
  navKey,
  active,
  children,
}: Readonly<{
  href: string;
  navKey: BottomNavKey;
  active: BottomNavKey;
  children: ReactNode;
}>) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center gap-1 text-[10px] font-medium transition-colors",
        active === navKey
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
      aria-current={active === navKey ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

export function BottomNav({
  className,
  active: activeProp,
  onAdd,
}: Readonly<{
  className?: string;
  active?: BottomNavKey;
  onAdd?: () => void;
}>) {
  const pathname = usePathname();

  const active: BottomNavKey =
    activeProp ??
    (pathname.startsWith("/insights")
      ? "insights"
      : pathname.startsWith("/future")
        ? "future"
        : pathname.startsWith("/profile")
          ? "profile"
          : "home");

  return (
    <nav
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:px-6 md:pb-6",
        className,
      )}
      aria-label="Bottom navigation"
    >
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-md items-center justify-between gap-1 rounded-full border border-white/40 bg-white/85 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-black/50 md:max-w-lg md:gap-2 md:px-5 md:py-2.5",
        )}
      >
        <NavItem href="/dashboard" navKey="home" active={active}>
          <HomeIcon className="size-5 shrink-0" aria-hidden />
          Home
        </NavItem>

        <NavItem href="/insights" navKey="insights" active={active}>
          <Sparkles className="size-5 shrink-0" aria-hidden />
          Insights
        </NavItem>

        <Button
          type="button"
          size="icon-lg"
          className="size-12 shrink-0 rounded-full bg-primary text-primary-foreground shadow-[0_14px_36px_color-mix(in_oklch,var(--primary)_38%,transparent)] hover:bg-primary/90 md:size-14 md:rounded-full"
          onClick={() => onAdd?.()}
          aria-label="Tambah transaksi"
        >
          <PlusIcon className="size-6" aria-hidden />
        </Button>

        <NavItem href="/future" navKey="future" active={active}>
          <TrendingUp className="size-5 shrink-0" aria-hidden />
          Future
        </NavItem>

        <NavItem href="/profile" navKey="profile" active={active}>
          <UserIcon className="size-5 shrink-0" aria-hidden />
          Profile
        </NavItem>
      </div>
    </nav>
  );
}
