import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type Params = Readonly<{ params: Promise<{ id: string }> }>;

function parseTransactionBody(body: Record<string, unknown>): NextResponse | PayloadOk {
  const { amount, category, note } = body;

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { message: "amount must be a finite number greater than 0" },
      { status: 400 },
    );
  }

  if (typeof category !== "string") {
    return NextResponse.json(
      { message: "category must be a non-empty string" },
      { status: 400 },
    );
  }

  const trimmedCategory = category.trim();
  if (!trimmedCategory) {
    return NextResponse.json(
      { message: "category must be a non-empty string" },
      { status: 400 },
    );
  }

  let noteValue: string | undefined;
  if (note !== undefined && note !== null) {
    if (typeof note !== "string") {
      return NextResponse.json(
        { message: "note must be a string when provided" },
        { status: 400 },
      );
    }
    const trimmed = note.trim();
    if (trimmed) noteValue = trimmed;
  }

  return {
    amount,
    category: trimmedCategory,
    noteValue,
  };
}

type PayloadOk = Readonly<{
  amount: number;
  category: string;
  noteValue: string | undefined;
}>;

function isNextResponse(x: NextResponse | PayloadOk): x is NextResponse {
  return x instanceof NextResponse;
}

export async function PATCH(request: Request, ctx: Params) {
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Body must be a JSON object" }, { status: 400 });
  }

  const parsed = parseTransactionBody(body as Record<string, unknown>);
  if (isNextResponse(parsed)) return parsed;

  try {
    const exists = await prisma.transaction.findUnique({ where: { id } });
    if (!exists) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        amount: parsed.amount,
        category: parsed.category,
        ...(parsed.noteValue !== undefined ? { note: parsed.noteValue } : { note: null }),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: Params) {
  const { id } = await ctx.params;

  try {
    const deleted = await prisma.transaction.deleteMany({ where: { id } });
    if (deleted.count === 0) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ message: "Failed to delete transaction" }, { status: 500 });
  }
}
