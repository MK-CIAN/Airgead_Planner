// LoanForm.tsx
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button } from "@mui/material";

interface LoanFormProps {
  onCalculateRepayment: (data: {
    loanName: string;
    balance: number;
    interestRate: number;
    termLength: number;
  }) => void;
  monthlyContribution?: number;
}

const LoanForm: React.FC<LoanFormProps> = ({ onCalculateRepayment }) => {
  const { control, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    onCalculateRepayment({
      loanName: data.loanName,
      balance: parseFloat(data.balance),
      interestRate: parseFloat(data.interestRate),
      termLength: parseInt(data.termLength, 10),
    });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: "20px" }}>
      <Controller
        name="loanName"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            label="Loan Name"
            required
            fullWidth
            margin="normal"
          />
        )}
      />
      <Controller
        name="balance"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            label="Loan Balance"
            type="number"
            required
            fullWidth
            margin="normal"
          />
        )}
      />
      <Controller
        name="interestRate"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            label="Interest Rate (APY)"
            type="number"
            required
            fullWidth
            margin="normal"
          />
        )}
      />
      <Controller
        name="termLength"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            label="Term Length (months)"
            type="number"
            required
            fullWidth
            margin="normal"
          />
        )}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        style={{ marginTop: "20px" }}
      >
        Calculate Repayment
      </Button>
    </form>
  );
};

export default LoanForm;
