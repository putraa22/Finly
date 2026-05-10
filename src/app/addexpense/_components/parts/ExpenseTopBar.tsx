import { ArrowLeft } from "lucide-react";

export function ExpenseTopBar({
  onBack,
}: Readonly<{ onBack: () => void }>) {
  return (
    <div className="flex items-center justify-between px-5 pt-4">
      <button
        type="button"
        onClick={onBack}
        className="flex size-10 items-center justify-center rounded-full bg-card shadow-sm transition active:scale-95"
        aria-label="Kembali"
      >
        <ArrowLeft className="size-4" aria-hidden />
      </button>
      <div className="text-center">
        <p className="font-heading text-base font-bold">Catat pengeluaran</p>
        <p className="text-[11px] text-muted-foreground">
          Cepat • cuma 5 detik
        </p>
      </div>
      <div className="size-10" aria-hidden />
    </div>
  );
}
