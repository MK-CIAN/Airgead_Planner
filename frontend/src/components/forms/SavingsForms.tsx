import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";


interface SavingsFormProps {
  onAddSavingsGoal: (newGoal: {
    name: string;
    target_amount: number;
    current_amount: number;
    monthly_contribution: number;
    target_date?: string | null;
    start_date?: string | null;
  }) => void;
}

interface FormData {
  name: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  target_date?: string | null;
  start_date?: string | null;
}

const SavingsForm: React.FC<SavingsFormProps> = ({ onAddSavingsGoal }) => {
  const { control, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    const formData = {
      ...data,
      target_date: data.target_date || null,
      start_date: data.start_date || null,
    };

    onAddSavingsGoal(formData);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Goal Name</Label>
        <Controller
          name="name"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Input
              {...field}
              id="name"
              placeholder="Enter goal name"
              required
              className="w-full"
            />
          )}
        />
      </div>

      <div>
        <Label htmlFor="target_amount">Target Amount</Label>
        <Controller
          name="target_amount"
          control={control}
          defaultValue={0}
          render={({ field }) => (
            <Input
              {...field}
              id="target_amount"
              type="number"
              placeholder="Enter target amount"
              required
              className="w-full"
            />
          )}
        />
      </div>

      <div>
        <Label htmlFor="current_amount">Current Amount</Label>
        <Controller
          name="current_amount"
          control={control}
          defaultValue={0}
          render={({ field }) => (
            <Input
              {...field}
              id="current_amount"
              type="number"
              placeholder="Enter current amount"
              required
              className="w-full"
            />
          )}
        />
      </div>

      <Button type="submit" className="w-full bg-green-500 text-white">
        Add Savings Goal
      </Button>
    </form>
  );
};

export default SavingsForm;
