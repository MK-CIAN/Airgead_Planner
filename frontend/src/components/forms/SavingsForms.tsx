// SavingsForm.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from '@mui/material';

interface SavingsFormProps {
  onAddSavingsGoal: (newGoal: { name: string; target_amount: number; current_amount: number; monthly_contribution: number; target_date?: string }) => void;
}

interface FormData {
  name: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  target_date?: string;
}

const SavingsForm: React.FC<SavingsFormProps> = ({ onAddSavingsGoal }) => {
  const { control, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    onAddSavingsGoal(data);
    reset();  // Clear form fields
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField {...field} label="Goal Name" required fullWidth margin="normal" />
        )}
      />
      <Controller
        name="target_amount"
        control={control}
        defaultValue={0}
        render={({ field }) => (
          <TextField {...field} type="number" label="Target Amount" required fullWidth margin="normal" />
        )}
      />
      <Controller
        name="current_amount"
        control={control}
        defaultValue={0}
        render={({ field }) => (
          <TextField {...field} type="number" label="Current Amount" required fullWidth margin="normal" />
        )}
      />
      <Controller
        name="monthly_contribution"
        control={control}
        defaultValue={0}
        render={({ field }) => (
          <TextField {...field} type="number" label="Monthly Contribution" required fullWidth margin="normal" />
        )}
      />
      <Controller
        name="target_date"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField {...field} type="date" label="Target Date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
        )}
      />
      <Button type="submit" variant="contained" color="primary" fullWidth>
        Add Savings Goal
      </Button>
    </form>
  );
};

export default SavingsForm;
