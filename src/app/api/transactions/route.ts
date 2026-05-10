import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Body must be a JSON object" }, { status: 400 });
  }

  const { amount, category, note } = body as Record<string, unknown>;

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { message: "amount must be a finite number greater than 0" },
      { status: 400 },
    );
  }

  if (typeof category !== "string") {
    return NextResponse.json({ message: "category must be a non-empty string" }, { status: 400 });
  }

  const trimmedCategory = category.trim();
  if (!trimmedCategory) {
    return NextResponse.json({ message: "category must be a non-empty string" }, { status: 400 });
  }

  let noteValue: string | undefined;
  if (note !== undefined && note !== null) {
    if (typeof note !== "string") {
      return NextResponse.json({ message: "note must be a string when provided" }, { status: 400 });
    }
    const trimmed = note.trim();
    if (trimmed) noteValue = trimmed;
  }

  try {
    const created = await prisma.transaction.create({
      data: {
        amount,
        category: trimmedCategory,
        ...(noteValue !== undefined ? { note: noteValue } : {}),
      },
    });
    revalidatePath("/dashboard");
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to create transaction" }, { status: 500 });
  }
}
