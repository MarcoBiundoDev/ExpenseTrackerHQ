import { Fragment, useEffect, useMemo, useState } from "react";
import { useMsal } from "@azure/msal-react";
import {
  InteractionStatus,
  type AuthenticationResult,
} from "@azure/msal-browser";

import { AppHeader } from "@/components/layout/AppHeader";
import { MonthTabs } from "@/components/expenses/MonthTabs";
import { AddExpenseModal } from "@/components/expenses/AddExpenseModal";
import { InlineEditExpenseRow } from "@/components/expenses/InlineEditExpenseRow";
import { DeleteExpenseDialog } from "@/components/expenses/DeleteExpenseDialog";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "@/features/expenses/expenseApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, monthKeyFromIsoDate } from "@/lib/date";
import type { Expense } from "@/types/expense";

function isGuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      value
    )
  );
}

export function ExpensesPage() {
  const [month, setMonth] = useState("Jan");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);

  const { instance, accounts, inProgress } = useMsal();
  const msalReady = inProgress === InteractionStatus.None;

  // Resolve userId reliably (refresh-safe)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!msalReady) return;

      const activeAccount = instance.getActiveAccount() ?? accounts[0];
      if (!activeAccount) {
        if (!cancelled) setUserId(null);
        return;
      }

      // 1) Fast path: oid/sub from cached idTokenClaims
      const claims = activeAccount.idTokenClaims as Record<string, unknown> | undefined;
      const oid =
        typeof claims?.["oid"] === "string" ? (claims["oid"] as string) : undefined;
      const sub =
        typeof claims?.["sub"] === "string" ? (claims["sub"] as string) : undefined;

      if (isGuid(oid)) {
        if (!cancelled) setUserId(oid);
        return;
      }

      // sub is not usually a GUID, but keep as a last resort ONLY if it looks like one
      if (isGuid(sub)) {
        if (!cancelled) setUserId(sub);
        return;
      }

      // 2) Fallback: localAccountId is often the objectId GUID for Entra accounts
      const localId = (activeAccount as { localAccountId?: unknown }).localAccountId;
      if (isGuid(localId)) {
        if (!cancelled) setUserId(localId);
        return;
      }

      // 3) Force hydration via silent token call, then re-check claims
      try {
        const result = (await instance.acquireTokenSilent({
          scopes: ["openid", "profile", "email"],
          account: activeAccount,
        })) as AuthenticationResult;

        const freshClaims = result.idTokenClaims as Record<string, unknown> | undefined;
        const freshOid =
          typeof freshClaims?.["oid"] === "string"
            ? (freshClaims["oid"] as string)
            : undefined;

        if (isGuid(freshOid)) {
          if (!cancelled) setUserId(freshOid);
          return;
        }

        const fromAccountLocalId = (result.account as { localAccountId?: unknown } | null)
          ?.localAccountId;

        if (!cancelled) setUserId(isGuid(fromAccountLocalId) ? fromAccountLocalId : null);
      } catch {
        if (!cancelled) setUserId(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [msalReady, instance, accounts]);

  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const filtered = useMemo(() => {
    return safeExpenses
      .filter((e) => monthKeyFromIsoDate(e.date) === month)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [safeExpenses, month]);

  const total = useMemo(() => {
    return filtered.reduce((sum, e) => sum + e.amount, 0);
  }, [filtered]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!msalReady) return;

        setLoading(true);
        setError(null);

        if (!userId) {
          throw new Error("Missing user identity.");
        }

        const data = await getExpenses(userId);
        if (!cancelled) setExpenses(data);
      } catch {
        if (!cancelled) setError("Missing user identity. Please sign in again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, msalReady]);

  function toIsoUtc(dateYYYYMMDD: string) {
    // Use noon UTC to avoid timezone shifting to the previous day
    return new Date(`${dateYYYYMMDD}T12:00:00Z`).toISOString();
  }

  function toApiDate(date: string) {
    // If already ISO, keep it; if YYYY-MM-DD, convert.
    return date.includes("T") ? date : toIsoUtc(date);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <MonthTabs value={month} onChange={setMonth} />

            <div className="w-full sm:flex sm:w-auto sm:justify-end">
              <AddExpenseModal
                onAdd={async (e) => {
                  try {
                    setError(null);
                    if (!userId) throw new Error("Missing user identity.");
                    const created = await createExpense(
                      {
                        amount: e.amount,
                        currency: "CAD",
                        category: e.category,
                        date: toIsoUtc(e.date),
                        description: e.description,
                      },
                      userId
                    );
                    setExpenses((prev) => [created, ...prev]);
                  } catch {
                    setError("Failed to add expense.");
                  }
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between">
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Total for {month}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">${total.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">
                  {filtered.length} expenses
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Expenses</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="-mx-2 overflow-x-auto px-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Description
                      </TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-sm text-muted-foreground"
                        >
                          Loading expenses...
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-sm text-destructive"
                        >
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-sm text-muted-foreground"
                        >
                          No expenses yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((e) => (
                        <Fragment key={e.id}>
                          <TableRow>
                            <TableCell>{formatDate(e.date)}</TableCell>
                            <TableCell>{e.category}</TableCell>
                            <TableCell className="hidden max-w-[300px] truncate sm:table-cell">
                              {e.description ?? ""}
                            </TableCell>
                            <TableCell className="text-right">
                              ${e.amount.toFixed(2)}
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  className="h-8 px-2"
                                  onClick={() =>
                                    setEditingId((prev) =>
                                      prev === e.id ? null : e.id
                                    )
                                  }
                                >
                                  {editingId === e.id ? "Close" : "Edit"}
                                </Button>

                                <DeleteExpenseDialog
                                  onConfirm={async () => {
                                    try {
                                      setError(null);
                                      if (!userId)
                                        throw new Error("Missing user identity.");
                                      await deleteExpense(e.id, userId);
                                      setExpenses((prev) =>
                                        prev.filter((x) => x.id !== e.id)
                                      );
                                      setEditingId((prev) =>
                                        prev === e.id ? null : prev
                                      );
                                    } catch {
                                      setError("Failed to delete expense.");
                                    }
                                  }}
                                />
                              </div>
                            </TableCell>
                          </TableRow>

                          {editingId === e.id && (
                            <TableRow>
                              <TableCell colSpan={5}>
                                <InlineEditExpenseRow
                                  expense={e}
                                  onCancel={() => setEditingId(null)}
                                  onSave={async (updated) => {
                                    try {
                                      setError(null);
                                      if (!userId)
                                        throw new Error("Missing user identity.");
                                      const saved = await updateExpense(
                                        {
                                          id: updated.id,
                                          amount: updated.amount,
                                          currency: updated.currency ?? "CAD",
                                          category: updated.category,
                                          date: toApiDate(updated.date),
                                          description: updated.description ?? "",
                                        },
                                        userId
                                      );

                                      setExpenses((prev) =>
                                        prev.map((x) =>
                                          x.id === saved.id ? saved : x
                                        )
                                      );
                                      setEditingId(null);
                                    } catch {
                                      setError("Failed to update expense.");
                                    }
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}