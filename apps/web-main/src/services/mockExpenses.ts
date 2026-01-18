import type { Expense } from "@/types/expense";

export const mockExpenses: Expense[] = [
  {
    id: "1",
    date: "2026-01-05",
    category: "Food",
    description: "Groceries",
    amount: 82.45,
  },
  {
    id: "2",
    date: "2026-01-12",
    category: "Transport",
    description: "Gas",
    amount: 65.0,
  },
  {
    id: "3",
    date: "2026-02-03",
    category: "Bills",
    description: "Internet",
    amount: 99.99,
  },
];