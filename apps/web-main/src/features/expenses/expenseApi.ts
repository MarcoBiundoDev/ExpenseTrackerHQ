import { apiClient } from "@/lib/apiClient";
import type { Expense } from "@/types/expense";

export type CreateExpenseRequest = {
  amount: number;
  currency: string; // "CAD"
  category: string;
  date: string; // ISO string
  description?: string;
};

export type UpdateExpenseRequest = {
  id: string;
  amount: number;
  currency: string;
  category: string;
  date: string; // ISO string
  description?: string;
};

function userPath(userId?: string) {
  if (!userId) {
    throw new Error("userId is required for expense API calls");
  }
  return `/users/${userId}/expenses`;
}

export async function getExpenses(userId?: string): Promise<Expense[]> {
  const res = await apiClient.get<Expense[]>(userPath(userId));
  return res.data;
}

export async function getExpenseById(
  expenseId: string,
  userId?: string
): Promise<Expense> {
  const res = await apiClient.get<Expense>(`${userPath(userId)}/${expenseId}`);
  return res.data;
}

export async function createExpense(
  payload: CreateExpenseRequest,
  userId?: string
): Promise<Expense> {
  const res = await apiClient.post<Expense>(userPath(userId), payload);
  return res.data;
}

export async function updateExpense(
  payload: UpdateExpenseRequest,
  userId?: string
): Promise<Expense> {
  // PUT /users/{userId}/expenses/{expenseId}
  const { id, ...body } = payload;

  const res = await apiClient.put<Partial<Expense> | undefined>(
    `${userPath(userId)}/${id}`,
    body
  );

  const echoed = (res.data ?? {}) as Partial<Expense>;

  return {
    amount: payload.amount,
    currency: payload.currency,
    category: payload.category,
    date: payload.date,
    description: payload.description ?? "",
    ...echoed,
    id: echoed.id ?? id,
  } as Expense;
}

export async function deleteExpense(
  expenseId: string,
  userId?: string
): Promise<void> {
  await apiClient.delete(`${userPath(userId)}/${expenseId}`);
}