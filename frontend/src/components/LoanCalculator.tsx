// LoanCalculator.tsx
import React, { useState } from 'react';
import LoanForm from './forms/LoanForm';
import LoanChart from './charts/LoanChart';
import { Button, Typography, Box, Card, CardContent} from '@mui/material';
import dayjs from 'dayjs';

interface LoanData {
  id: string;
  loanName: string;
  balance: number;
  interestRate: number;
  termLength: number;
  monthlyPayment: number;
  totalInterest: number;
  repaymentSchedule: number[];
  currentMonth: dayjs.Dayjs;
}

const LoanCalculator: React.FC = () => {
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleCalculateRepayment = (data: { loanName: string; balance: number; interestRate: number; termLength: number }) => {
    const { loanName, balance, interestRate, termLength } = data;
    const monthlyRate = interestRate / 100 / 12;
    const n = termLength;

    // Calculate the monthly payment
    const monthlyPayment = monthlyRate === 0
      ? balance / n  // If no interest, divide balance by term length
      : (balance * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);

    // Generate the repayment schedule
    const schedule = [];
    let currentBalance = balance;
    let totalInterestPaid = 0;

    for (let i = 0; i < termLength; i++) {
      const interestForMonth = currentBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestForMonth;
      totalInterestPaid += interestForMonth;
      currentBalance -= principalPayment;

      schedule.push(currentBalance > 0 ? currentBalance : 0);
      if (currentBalance <= 0) break;
    }

    const newLoan: LoanData = {
      id: `${loans.length + 1}`,
      loanName,
      balance,
      interestRate,
      termLength,
      monthlyPayment,
      totalInterest: totalInterestPaid,
      repaymentSchedule: schedule,
      currentMonth: dayjs().startOf('month'),
    };

    setLoans([...loans, newLoan]);
  };

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>Loan Repayment Calculator</Typography>

      {/* Toggle Form Button */}
      <Button variant="contained" color="primary" onClick={toggleFormVisibility} style={{ marginBottom: '20px' }}>
        {isFormVisible ? "Hide Form" : "Add New Loan"}
      </Button>

      {/* Loan Form */}
      {isFormVisible && <LoanForm onCalculateRepayment={handleCalculateRepayment} />}

      {/* Loan Grid */}
      <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={3}>
        {loans.map((loan) => (
          <Card key={loan.id} style={{ position: 'relative' }}>
            <CardContent>
              <Typography variant="subtitle1" align="center">{loan.loanName}</Typography>
              <Typography>Initial Balance: €{loan.balance.toFixed(2)}</Typography>
              <Typography>Interest Rate: {loan.interestRate}%</Typography>
              <Typography>Monthly Payment: €{loan.monthlyPayment.toFixed(2)}</Typography>
              <Typography>Total Interest: €{loan.totalInterest.toFixed(2)}</Typography>
              <Typography>Term Length: {loan.termLength} months</Typography>

              {/* Loan Repayment Chart */}
              <LoanChart
                repaymentSchedule={loan.repaymentSchedule}
                totalInterest={loan.totalInterest}
                loanBalance={loan.balance}
              />
            </CardContent>
          </Card>
        ))}
      </Box>
    </div>
  );
};

export default LoanCalculator;
