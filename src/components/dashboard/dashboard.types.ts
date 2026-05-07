export type DashboardTransaction = {
  id: string;
  title: string;
  category: string;
  note?: string;
  amount: number; // negative = expense, positive = income
  createdAt: string; // ISO string (for now)
};

export type DashboardBudget = {
  id: string;
  title: string;
  spent: number;
  limit: number;
  icon?: string;
};

