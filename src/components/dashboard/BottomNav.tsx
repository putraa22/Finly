import { BarChart3Icon, HomeIcon, PlusIcon, WalletIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BottomNav({
  className,
  active = "home",
  onAdd,
}: Readonly<{
  className?: string;
  active?: "home" | "wallet" | "chart";
  onAdd?: () => void;
}>) {
  const item = (key: "home" | "wallet" | "chart") =>
    cn(
      "flex flex-col items-center gap-1 text-[10px] font-medium",
      active === key ? "text-foreground" : "text-muted-foreground"
    );

  return (
    <nav
      className={cn(
        "fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-md items-center justify-between rounded-3xl border border-white/30 bg-white/65 px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.10)] backdrop-blur-md dark:bg-white/5 sm:hidden",
        className
      )}
      aria-label="Bottom navigation"
    >
      <button className={item("home")} aria-current={active === "home"}>
        <HomeIcon className="size-5" />
        Home
      </button>

      <button
        className={item("wallet")}
        aria-current={active === "wallet"}
      >
        <WalletIcon className="size-5" />
        Wallet
      </button>

      <Button
        size="icon-lg"
        className="size-12 rounded-3xl bg-emerald-600 text-white shadow-[0_16px_34px_rgba(16,185,129,0.35)] hover:bg-emerald-600/90"
        onClick={onAdd}
        aria-label="Add transaction"
      >
        <PlusIcon />
      </Button>

      <button className={item("chart")} aria-current={active === "chart"}>
        <BarChart3Icon className="size-5" />
        Chart
      </button>

      <span className="w-10" />
    </nav>
  );
}

