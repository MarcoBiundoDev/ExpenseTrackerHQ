import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type AddExpenseModalProps = {
  onAdd?: (expense: {
    date: string;
    category: string;
    description: string;
    amount: number;
  }) => void;
};

export function AddExpenseModal({ onAdd }: AddExpenseModalProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<{
    date?: string;
    category?: string;
    amount?: string;
  }>({});

  function handleSubmit() {
    const nextErrors: { date?: string; category?: string; amount?: string } = {};

    const trimmedCategory = category.trim();
    if (!date) {
      nextErrors.date = "Date is required";
    }

    if (!trimmedCategory) {
      nextErrors.category = "Category is required";
    }

    if (amount.trim() === "") {
      nextErrors.amount = "Amount is required";
    }

    const parsedAmount = Number(amount);
    if (amount.trim() !== "" && (!Number.isFinite(parsedAmount) || parsedAmount < 0)) {
      nextErrors.amount = "Amount must be a valid number";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!date) {
      return;
    }

    onAdd?.({
      date: date.toISOString().slice(0, 10),
      category: trimmedCategory,
      description: description.trim(),
      amount: parsedAmount,
    });

    setOpen(false);
    setDate(new Date());
    setCategory("");
    setDescription("");
    setAmount("");
    setErrors({});
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">Add Expense</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add expense</DialogTitle>
          <DialogDescription>
            Create a new expense entry for the selected month.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-1">
          <div className="grid gap-1.5">
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
                <p className="text-sm leading-none text-red-600">{errors.date}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g. Food"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
              }}
            />
            <div className="min-h-[1rem]">
              {errors.category ? (
                <p className="text-sm leading-none text-red-600">
                  {errors.category}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;

                // Allow empty string (so user can clear input)
                if (value === "") {
                  setAmount("");
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                  return;
                }

                // Only allow valid numeric values
                const numeric = Number(value);
                if (!Number.isNaN(numeric)) {
                  setAmount(value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                }
              }}
            />
            <div className="min-h-[1rem]">
              {errors.amount ? (
                <p className="text-sm leading-none text-red-600">{errors.amount}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}