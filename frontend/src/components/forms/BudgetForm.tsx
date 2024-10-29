// BudgetForm.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import Axios from '../Axios';
import { Dayjs } from 'dayjs';
import '../../App.css';

interface BudgetFormProps {
  onAddBudget: (newItem: { amount: string; category: string; transaction_type: string; month: string }) => void;
  month: Dayjs;
}

interface FormData {
  category: string;
  amount: string;
  transaction_type: string;  // Add transaction type field
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onAddBudget, month }) => {
  const { control, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    const formData = { 
      ...data, 
      month: month.format('YYYY-MM-DD') 
    };

    Axios.post('data/budget/', formData)
      .then((response) => {
        onAddBudget(response.data);  // Update chart data after submission
        reset();  // Clear form fields
      })
      .catch((error) => {
        console.error("Error adding budget:", error);
      });
  };

  return (
    <div className="budget-form">
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className = "budget-input">
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

      <div className="budget-form">
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

      <div className="budget-form">
        <Controller
          name="transaction_type"
          control={control}
          defaultValue="income"  // Default value for transaction type
          render={({ field }) => (
            <FormControl fullWidth required>
              <InputLabel>Transaction Type</InputLabel>
              <Select {...field}>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
          )}
        />
      </div>

      <Button type="submit" variant="contained" color="primary">
        Add Budget Item
      </Button>
    </form>
    </div>
  );
};

export default BudgetForm;
