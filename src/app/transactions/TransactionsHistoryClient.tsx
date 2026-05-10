"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { MOCK_FREQUENT_CATEGORY_IDS } from "@/app/addexpense/addExpense.constants";
import { ExpenseCategoryPicker } from "@/app/addexpense/_components/parts/ExpenseCategoryPicker";
import { sortCategoriesByFrequency } from "@/app/addexpense/addExpense.utils";
import { CardShell } from "@/components/dashboard/CardShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CATEGORIES, formatIDRFull } from "@/lib/finance";
import { toast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";

import type { SerializedTransaction } from "./types";

function resolveCategory(catId: string) {
  return (
    CATEGORIES.find((c) => c.id === catId) ??
    CATEGORIES.find((c) => c.id === "other")!
  );
}

function formatHistoryWhen(iso: string): string {
  const createdAt = new Date(iso);
  const timeStr = createdAt.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const now = new Date();
  const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const t1 = new Date(
    createdAt.getFullYear(),
    createdAt.getMonth(),
    createdAt.getDate(),
  ).getTime();
  const diffDays = Math.round((t0 - t1) / 86_400_000);

  if (diffDays === 0) return `Hari ini · ${timeStr}`;
  if (diffDays === 1) return `Kemarin · ${timeStr}`;
  if (diffDays >= 2 && diffDays < 7) return `${diffDays} hari lalu · ${timeStr}`;
  return `${createdAt.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} · ${timeStr}`;
}

export function TransactionsHistoryClient({
  transactions,
}: Readonly<{ transactions: SerializedTransaction[] }>) {
  const router = useRouter();
  const sortedCategories = React.useMemo(
    () => sortCategoriesByFrequency(CATEGORIES, MOCK_FREQUENT_CATEGORY_IDS),
    [],
  );

  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SerializedTransaction | null>(null);
  const [amountInput, setAmountInput] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("food");
  const [noteInput, setNoteInput] = React.useState("");
  const [savePending, setSavePending] = React.useState(false);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<SerializedTransaction | null>(null);
  const [deletePending, setDeletePending] = React.useState(false);

  const openEdit = (row: SerializedTransaction) => {
    setEditing(row);
    setAmountInput(String(Math.round(row.amount)));
    setCategoryId(row.category);
    setNoteInput(row.note ?? "");
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditing(null);
    setSavePending(false);
  };

  const submitEdit = async () => {
    if (!editing) return;
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({
        title: "Jumlah tidak valid",
        variant: "destructive",
      });
      return;
    }

    setSavePending(true);
    try {
      const res = await fetch(`/api/transactions/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          category: categoryId,
          note: noteInput.trim() || "",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };

      if (!res.ok) {
        toast({
          title: data.message ?? "Gagal menyimpan",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Perubahan disimpan" });
      closeEdit();
      router.refresh();
    } finally {
      setSavePending(false);
    }
  };

  const submitDelete = async () => {
    if (!deleting) return;
    setDeletePending(true);
    try {
      const res = await fetch(`/api/transactions/${deleting.id}`, {
        method: "DELETE",
      });

      if (res.status === 404) {
        toast({
          title: "Transaksi tidak ditemukan",
          variant: "destructive",
        });
        return;
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        toast({
          title: data.message ?? "Gagal menghapus",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Transaksi dihapus" });
      setDeleteOpen(false);
      setDeleting(null);
      router.refresh();
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-5 sm:max-w-lg md:max-w-xl lg:max-w-5xl">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-foreground">
              Riwayat transaksi
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {transactions.length} entri
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0 rounded-xl">
            <Link href="/addexpense">Tambah</Link>
          </Button>
        </header>

        {transactions.length === 0 ? (
          <CardShell className="p-8 text-center">
            <p className="text-sm font-medium text-foreground">
              Belum ada transaksi tercatat.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Mulai dari satu pengeluaran — nanti semua muncul di sini.
            </p>
            <Button asChild className="mt-6 rounded-xl">
              <Link href="/addexpense">Catat pengeluaran</Link>
            </Button>
          </CardShell>
        ) : (
          <ul className="space-y-3 pb-4">
            {transactions.map((row) => {
              const cat = resolveCategory(row.category);
              const title = row.note?.trim() || cat.label;
              return (
                <li key={row.id}>
                  <CardShell className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <div
                        className={cn(
                          "grid size-11 shrink-0 place-items-center rounded-2xl text-lg leading-none",
                          cat.color,
                        )}
                      >
                        <span aria-hidden>{cat.emoji}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">{title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {cat.label} · {formatHistoryWhen(row.createdAt)}
                        </p>
                      </div>
                      <p className="shrink-0 tabular-nums text-sm font-semibold text-foreground">
                        −{formatIDRFull(Math.abs(row.amount))}
                      </p>
                    </div>
                    <div className="flex shrink-0 justify-end gap-2 border-t border-border/60 pt-3 sm:border-t-0 sm:pt-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="rounded-xl"
                        aria-label="Edit transaksi"
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Hapus transaksi"
                        onClick={() => {
                          setDeleting(row);
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardShell>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={(o) => !o && closeEdit()}>
        <DialogContent className="sm:max-w-md" showCloseButton={!savePending}>
          <DialogHeader>
            <DialogTitle>Edit transaksi</DialogTitle>
            <DialogDescription>
              Ubah jumlah, kategori, atau catatan lalu simpan.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <label htmlFor="edit-amount" className="text-xs font-medium text-muted-foreground">
                Jumlah (IDR)
              </label>
              <Input
                id="edit-amount"
                inputMode="numeric"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value.replace(/\D/g, ""))}
                disabled={savePending}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <span className="text-xs font-medium text-muted-foreground">Kategori</span>
              <ExpenseCategoryPicker
                categories={sortedCategories}
                selectedId={categoryId}
                onSelect={setCategoryId}
                disabled={savePending}
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="edit-note" className="text-xs font-medium text-muted-foreground">
                Catatan
              </label>
              <Input
                id="edit-note"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                disabled={savePending}
                placeholder="Opsional"
                className="rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={savePending}
              onClick={closeEdit}
            >
              Batal
            </Button>
            <Button
              type="button"
              className="rounded-xl"
              disabled={savePending}
              onClick={submitEdit}
            >
              {savePending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(o) => {
          setDeleteOpen(o);
          if (!o) setDeleting(null);
        }}
      >
        <DialogContent className="sm:max-w-sm" showCloseButton={!deletePending}>
          <DialogHeader>
            <DialogTitle>Hapus transaksi?</DialogTitle>
            <DialogDescription>
              {deleting
                ? `Entri ${formatIDRFull(deleting.amount)} akan dihapus permanen dari riwayat.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={deletePending}
              onClick={() => {
                setDeleteOpen(false);
                setDeleting(null);
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl"
              disabled={deletePending}
              onClick={submitDelete}
            >
              {deletePending ? "Menghapus…" : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
