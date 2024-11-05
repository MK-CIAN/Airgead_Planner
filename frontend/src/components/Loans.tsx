// LoanCalculator.tsx
import React, { useState } from 'react';
import LoanForm from './forms/LoanForm';
import LoanChart from './charts/LoanChart';
import { Button, Typography } from '@mui/material';

interface LoanData {
  balance: number;
  interestRate: number;
  termLength: number;
  monthlyContribution?: number;
}

const LoanCalculator: React.FC = () => {
  const [loanData, setLoanData] = useState<LoanData>({
    balance: 0,
    interestRate: 0,
    termLength: 0,
  });

  const [monthlyContribution, setMonthlyContribution] = useState<number | null>(null);
  const [repaymentSchedule, setRepaymentSchedule] = useState<number[]>([]);
  const [totalInterest, setTotalInterest] = useState(0);

  const calculateMonthlyPayment = (balance: number, interestRate: number, termLength: number) => {
    const montlyRate = interestRate / 100 / 12;
    const n = termLength;

    //Checking if the interest rate is 0
    if (montlyRate === 0) {
      return balance / n;
    }

    return (balance * montlyRate * Math.pow(1 + montlyRate, n)) / (Math.pow(1 + montlyRate, n) - 1);
    };

  const handleCalculateRepayment = (data: LoanData) => {

    const { balance, interestRate, termLength } = data;
    const monthlyContribution = calculateMonthlyPayment(balance, interestRate, termLength);

    setLoanData({ ...data, monthlyContribution });
    setMonthlyContribution(monthlyContribution);

    const monthlyRate = interestRate / 100 / 12;
    const schedule = [];
    let currentBalance = balance;
    let totalInterestPaid = 0;

    for (let i = 0; i < termLength; i++) {
      const interestForMonth = currentBalance * monthlyRate;
      const principalPayment = Math.min(monthlyContribution - interestForMonth, currentBalance);
      totalInterestPaid += interestForMonth;
      currentBalance -= principalPayment;

      schedule.push(currentBalance > 0 ? currentBalance : 0);
      if (currentBalance <= 0) break;
    }

    setRepaymentSchedule(schedule);
    setTotalInterest(totalInterestPaid);
  };

  const handleSaveLoan = () => {
    // Handle saving to the database (to be implemented later)
    console.log("Loan saved:", loanData);
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>Loan Repayment Calculator</Typography>
      
      {/* Loan Form for inputs */}
      <LoanForm onCalculateRepayment={handleCalculateRepayment} />

      {/* Display calculated Repayments */}
      {monthlyContribution !== null && (
        <Typography variant="h6" gutterBottom>
            Calculated Monthly Repayments: €{monthlyContribution.toFixed(2)}
        </Typography>
    )}

      {/* Render charts with calculated data */}
      <LoanChart repaymentSchedule={repaymentSchedule} totalInterest={totalInterest} loanBalance={loanData.balance} />

      <Button variant="contained" color="primary" onClick={handleSaveLoan} style={{ marginTop: '20px' }}>
        Save Loan
      </Button>
    </div>
  );
};

export default LoanCalculator;
