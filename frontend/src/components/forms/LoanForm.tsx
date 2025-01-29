// LoanForm.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField} from '@mui/material';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface LoanFormProps {
  onCalculateRepayment: (data: { name: string; balance: number; interestRate: number; termLength: number }) => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ onCalculateRepayment }) => {
  const { control, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    onCalculateRepayment({
      name: data.name,
      balance: parseFloat(data.balance),
      interestRate: parseFloat(data.interestRate),
      termLength: parseInt(data.termLength, 10),
    });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
      <Label htmlFor="name">Loan Name</Label>
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
      <Label htmlFor="Balance">Loan Amount</Label>
      <Controller
        name="balance"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Input
              {...field}
              id="name"
              type="number"
              placeholder="Enter loan amount"
              required
              className="w-full"
            />
        )}
      />
      </div>
      <div>
      <Label htmlFor="interestRate">Interest Rate (APY)</Label>
      <Controller
        name="interestRate"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Input
              {...field}
              id="interestRate"
              type="number"
              placeholder="Enter interest rate"
              required
              className="w-full"
            />
        )}
      />
      </div>
      <div>
        <Label htmlFor="termLength">Term Length (months)</Label>
        <Controller
          name="termLength"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Input
              {...field}
              id="termLength"
              type="number"
              placeholder="Enter term length"
              required
              className="w-full"
            />
          )}
        />
      </div>

      <Button type="submit" className="w-full bg-green-500 text-white">
        Calculate Loan
      </Button>
    </form>
  );
};

export default LoanForm;
