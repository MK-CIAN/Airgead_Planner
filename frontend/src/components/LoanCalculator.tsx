// LoanCalculator.tsx
import React, { useState, useEffect } from 'react';
import Axios from './Axios';
import LoanForm from './forms/LoanForm';
import LoanChart from './charts/LoanChart';
import { Button, Typography, Box, Card, CardContent } from '@mui/material';
import dayjs from 'dayjs';

interface LoanData {
  id: string;
  name: string;
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

  // Fetch saved loans from the backend when the component mounts
  useEffect(() => {
    Axios.get(`data/loans/`)
      .then((response) => {
        const fetchedLoans = response.data.map((loan: any) => ({
          id: loan.id,
          name: loan.name,
          balance: parseFloat(loan.balance),
          interestRate: parseFloat(loan.interest_rate),
          termLength: loan.term_length,
          monthlyPayment: parseFloat(loan.monthly_payment),
          totalInterest: parseFloat(loan.total_interest),
          repaymentSchedule: [], // Add repayment calculation here if needed
          currentMonth: dayjs().startOf('month'),
        }));
        setLoans(fetchedLoans);
      })
      .catch((error) => {
        console.error("Error fetching loans:", error);
      });
  }, []);

  const handleCalculateRepayment = (data: { name: string; balance: number; interestRate: number; termLength: number }) => {
    const { name, balance, interestRate, termLength } = data;
    const monthlyRate = interestRate / 100 / 12;
    const n = termLength;

    const monthlyPayment = monthlyRate === 0
      ? balance / n
      : (balance * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);

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
      name,
      balance,
      interestRate,
      termLength,
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      totalInterest: parseFloat(totalInterestPaid.toFixed(2)),
      repaymentSchedule: schedule,
      currentMonth: dayjs().startOf('month'),
    };

    setLoans([...loans, newLoan]);
  };

  const handleSaveLoan = (loan: LoanData) => {
    Axios.post('/loans/', {
      name: loan.name,
      balance: loan.balance,
      interest_rate: loan.interestRate,
      term_length: loan.termLength,
      monthly_payment: loan.monthlyPayment,
      total_interest: loan.totalInterest,
    })
      .then((response) => {
        console.log("Loan saved:", response.data);
      })
      .catch((error) => {
        console.error("Error saving loan:", error);
      });
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
              <Typography variant="subtitle1" align="center">{loan.name}</Typography>
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

              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSaveLoan(loan)}
                style={{ marginTop: '10px' }}
              >
                Save Loan
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </div>
  );
};

export default LoanCalculator;
