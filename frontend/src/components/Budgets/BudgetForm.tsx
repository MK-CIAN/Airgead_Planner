import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";

interface BudgetFormProps {
  onAddBudget: (newItem: {
    amount: string;
    category: string;
    transaction_type: string;
  }) => void;
}

interface FormData {
  category: string;
  amount: string;
  transaction_type: string;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onAddBudget }) => {
  const { control, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    const formData = {
      amount: data.amount,
      category: data.category,
      transaction_type: data.transaction_type,
    };

    onAddBudget(formData);
    reset({ transaction_type: "" }); 
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Controller
            name="amount"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Input
                {...field}
                data-testid="budget-amount-input"
                id="amount"
                type="number"
                placeholder="Enter amount €"
                required
              />
            )}
          />
        </div>

        <div>
          <Label htmlFor="category">Item Label</Label>
          <Controller
            name="category"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Input
                {...field}
                data-testid="budget-category-input"
                id="category"
                placeholder="Enter Label For Item"
                required
              />
            )}
          />
        </div>

        <div>
          <Label htmlFor="transaction_type">Transaction Type</Label>
          <Controller
            name="transaction_type"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Select
                value={field.value} // This binds the current value properly
                onValueChange={(value) => field.onChange(value)} // Ensure updates happen correctly
              >
                <SelectTrigger data-testid="budget-type-select" id="transaction_type" className={!field.value ? "text-muted-foreground" : ""}>
                  {field.value || "Select transaction type"}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem data-testid="select-item-income" value="income">Income</SelectItem>
                  <SelectItem data-testid="select-item-expense" value="expense">Expense</SelectItem>
                  <SelectItem data-testid="select-item-savings" value="savings">Savings</SelectItem>
                  <SelectItem data-testid="select-item-debt" value="debt">Debt</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <Button type="submit" data-testid="add-budget-button" className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white">
          Add Budget Item
        </Button>
      </form>
    </div>
  );
};

export default BudgetForm;
