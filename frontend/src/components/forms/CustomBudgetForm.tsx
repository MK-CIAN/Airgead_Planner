import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectContent } from "@/components/ui/select";

interface CustomBudgetFormProps {
  onAddBudgetItem: (newItem: {
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

const CustomBudgetForm: React.FC<CustomBudgetFormProps> = ({ onAddBudgetItem }) => {
  const { control, handleSubmit, reset, watch } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    onAddBudgetItem(data);
    reset();
  };

  const transactionTypeValue = watch("transaction_type");

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Amount Field */}
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Controller
            name="amount"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Input
                {...field}
                id="amount"
                type="number"
                placeholder="Enter amount €"
                required
              />
            )}
          />
        </div>

        {/* Category Field */}
        <div>
          <Label htmlFor="category">Item Label</Label>
          <Controller
            name="category"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Input
                {...field}
                id="category"
                placeholder="Enter label"
                required
              />
            )}
          />
        </div>

        {/* Transaction Type Field */}
        <div>
          <Label htmlFor="transaction_type">Transaction Type</Label>
          <Controller
            name="transaction_type"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || ""}
              >
                <SelectTrigger id="transaction_type">
                  {transactionTypeValue || "Select transaction type"}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="debt">Debt</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" className="mt-4 w-full bg-green-500 text-white">Add Budget Item</Button>
      </form>
    </div>
  );
};

export default CustomBudgetForm;
