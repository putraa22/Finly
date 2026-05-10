import { prisma } from "@/lib/prisma";

import { TransactionsHistoryClient } from "./TransactionsHistoryClient";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const rows = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const serialized = rows.map((r) => ({
    id: r.id,
    amount: r.amount,
    category: r.category,
    note: r.note,
    createdAt: r.createdAt.toISOString(),
  }));

  return <TransactionsHistoryClient transactions={serialized} />;
}
