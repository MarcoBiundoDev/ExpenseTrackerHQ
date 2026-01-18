export type Expense = {
  id: string;
  amount: number;
  currency: string; // "CAD"
  category: string;
  date: string; // ISO string from API ("2025-01-01T12:00:00Z")
  description?: string | null;
};