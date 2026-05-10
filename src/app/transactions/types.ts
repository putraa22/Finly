export type SerializedTransaction = Readonly<{
  id: string;
  amount: number;
  category: string;
  note: string | null;
  /** ISO string */
  createdAt: string;
}>;
