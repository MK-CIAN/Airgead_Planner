import React from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import "../../App.css";

interface CustomBudgetFormProps {
  onAddBudgetItem: (newItem: { amount: string; category: string; transaction_type: string }) => void;
}

interface FormData {
  category: string;
  amount: string;
  transaction_type: string;
}

const CustomBudgetForm: React.FC<CustomBudgetFormProps> = ({ onAddBudgetItem }) => {
  const { control, handleSubmit, reset, watch } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    // Pass the data to the parent
    onAddBudgetItem(data);
    reset(); // Reset form after successful submission
  };

  const transactionTypeValue = watch("transaction_type");

  return (
    <div className="budget-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Amount Field */}
        <div className="budget-input">
          <Controller
            name="amount"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Amount"
                required
                fullWidth
              />
            )}
          />
        </div>

        {/* Category Field */}
        <div className="budget-input">
          <Controller
            name="category"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Category"
                required
                fullWidth
              />
            )}
          />
        </div>

        {/* Transaction Type Field */}
        <div className="budget-input">
          <Controller
            name="transaction_type"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <FormControl fullWidth required>
                <InputLabel shrink={!!transactionTypeValue}>Transaction Type</InputLabel>
                <Select
                  {...field}
                  displayEmpty
                  fullWidth
                  label="Transaction Type"
                >
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                  <MenuItem value="debt">Debt</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="budget-submit">
          <Button type="submit" variant="contained" color="primary">
            Add Budget Item
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomBudgetForm;
