// SavingsForm.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from '@mui/material';
import '../../App.css';

// Utility function to get today's date as YYYY-MM-DD
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Formats as 'YYYY-MM-DD'
};

interface SavingsFormProps {
  onAddSavingsGoal: (newGoal: { name: string; target_amount: number; current_amount: number; monthly_contribution: number; target_date?: string | null; start_date?: string | null }) => void;
}

interface FormData {
  name: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  target_date?: string | null;
  start_date?: string | null;  // New start date field
}

const SavingsForm: React.FC<SavingsFormProps> = ({ onAddSavingsGoal }) => {
  const { control, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    // Set target_date and start_date to null if they are empty strings
    const formData = { 
      ...data, 
      target_date: data.target_date || null,
      start_date: data.start_date || null,
    };

    onAddSavingsGoal(formData);  // Pass the processed form data
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
        name="start_date"
        control={control}
        defaultValue={getTodayDate()} 
        render={({ field }) => (
          <TextField {...field} type="date" label="Start Date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
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
      <div className='savings-submit'>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Add Savings Goal
        </Button>
      </div>
    </form>
  );
};

export default SavingsForm;
