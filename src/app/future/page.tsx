"use client";

import { BottomNav } from "@/src/components/dashboard";
import { toast } from "@/src/lib/hooks/use-toast";

export default function FuturePage() {
  return (
    <>
      <div className="mx-auto max-w-md px-4 pb-28 pt-8 md:max-w-lg md:max-w-xl lg:max-w-5xl">
        <h1 className="font-heading text-lg font-bold text-foreground">
          Future
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Proyeksi dan skenario finansial — konten menyusul.
        </p>
      </div>
      <BottomNav
        onAdd={() =>
          toast({
            title: "Tambah transaksi",
            description: "Gunakan tombol tambah di dashboard utama.",
          })
        }
      />
    </>
  );
}
