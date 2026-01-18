import { useState } from "react";
import type { Expense } from "@/types/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type InlineEditExpenseRowProps = {
  expense: Expense;
  onCancel: () => void;
  onSave: (updated: Expense) => void;
};

export function InlineEditExpenseRow({
  expense,
  onCancel,
  onSave,
}: InlineEditExpenseRowProps) {
  const [date, setDate] = useState<Date | undefined>(
    expense.date ? new Date(expense.date) : undefined
  );
  const [category, setCategory] = useState(expense.category);
  const [description, setDescription] = useState(expense.description ?? "");
  const [amount, setAmount] = useState(() => Number(expense.amount).toFixed(2));
  const [errors, setErrors] = useState<{
    date?: string;
    category?: string;
    amount?: string;
  }>({});

  function handleSave() {
    const nextErrors: { date?: string; category?: string; amount?: string } = {};

    const trimmedCategory = category.trim();
    if (!date) {
      nextErrors.date = "Date is required";
    }

    if (!trimmedCategory) {
      nextErrors.category = "Category is required";
    }

    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      nextErrors.amount = "Amount must be greater than 0";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!date) return;

    onSave({
      ...expense,
      date: date.toISOString().slice(0, 10),
      category: trimmedCategory,
      description: description.trim(),
      amount: Number(parsed.toFixed(2)),
    });
  }

  return (
    <div className="grid gap-3 rounded-lg border border-border bg-card p-3 text-foreground shadow-sm sm:p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d);
                  if (errors.date)
                    setErrors((prev) => ({ ...prev, date: undefined }));
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <div className="min-h-[1rem]">
            {errors.date ? (
              <p className="text-sm leading-none text-destructive">{errors.date}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-1">
          <Label htmlFor={`edit-category-${expense.id}`}>Category</Label>
          <Input
            id={`edit-category-${expense.id}`}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              if (errors.category)
                setErrors((prev) => ({ ...prev, category: undefined }));
            }}
            className="bg-background text-foreground"
          />

          <div className="min-h-[1rem]">
            {errors.category ? (
              <p className="text-sm leading-none text-destructive">
                {errors.category}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-1">
          <Label htmlFor={`edit-amount-${expense.id}`}>Amount</Label>
          <Input
            id={`edit-amount-${expense.id}`}
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount)
                setErrors((prev) => ({ ...prev, amount: undefined }));
            }}
            onBlur={() => {
              const n = Number(amount);
              if (Number.isFinite(n)) {
                setAmount(n.toFixed(2));
              }
            }}
            className="bg-background text-foreground"
          />

          <div className="min-h-[1rem]">
            {errors.amount ? (
              <p className="text-sm leading-none text-destructive">{errors.amount}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-1">
          <Label htmlFor={`edit-description-${expense.id}`}>Description</Label>
          <Input
            id={`edit-description-${expense.id}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-background text-foreground"
          />
          <div className="min-h-[1rem]" />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button className="w-full sm:w-auto" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="w-full sm:w-auto" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}