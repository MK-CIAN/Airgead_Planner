// LoanCalculator.tsx
import React, { useState, useEffect } from 'react';
import Axios from './Axios';
import LoanForm from './forms/LoanForm';
import LoanChart from './charts/LoanChart';
import { Button, Typography, Box, Card, CardContent, TextField } from '@mui/material';
import dayjs from 'dayjs';
import '../App.css';

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
  const [editingLoan, setEditingLoan] = useState<string | null>(null); // ID of the loan being edited
  const [customMonthlyPayment, setCustomMonthlyPayment] = useState<number | null>(null);
  const [customRepaymentSchedule, setCustomRepaymentSchedule] = useState<number[]>([]);

  const calculateRepaymentSchedule = (balance: number, monthlyPayment: number, interestRate: number, termLength: number) => {
    const monthlyRate = interestRate / 100 / 12;
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

    return { schedule, totalInterestPaid };
  };

  useEffect(() => {
    Axios.get(`data/loans/`)
      .then((response) => {
        const fetchedLoans = response.data.map((loan: any) => {
          const { schedule, totalInterestPaid } = calculateRepaymentSchedule(
            parseFloat(loan.balance),
            parseFloat(loan.monthly_payment),
            parseFloat(loan.interest_rate),
            loan.term_length
          );

          return {
            id: loan.id,
            name: loan.name,
            balance: parseFloat(loan.balance),
            interestRate: parseFloat(loan.interest_rate),
            termLength: loan.term_length,
            monthlyPayment: parseFloat(loan.monthly_payment),
            totalInterest: parseFloat(totalInterestPaid.toFixed(2)),
            repaymentSchedule: schedule,
            currentMonth: dayjs().startOf('month'),
          };
        });
        setLoans(fetchedLoans);
      })
      .catch((error) => {
        console.error("Error fetching loans:", error);
      });
  }, []);

  const handleCalculateRepayment = (data: { name: string; balance: number; interestRate: number; termLength: number }) => {
    const { name, balance, interestRate, termLength } = data;
    const monthlyPayment = (balance * (interestRate / 100 / 12) * Math.pow(1 + interestRate / 100 / 12, termLength)) / (Math.pow(1 + interestRate / 100 / 12, termLength) - 1);
    const { schedule, totalInterestPaid } = calculateRepaymentSchedule(balance, monthlyPayment, interestRate, termLength);

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
    Axios.post('data/loans/', {
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

  const handleRemoveLoan = (id: string) => {
    Axios.delete(`data/loans/${id}/`)
      .then(() => {
        setLoans((prevLoans) => prevLoans.filter((loan) => loan.id !== id));
      })
      .catch((error) => {
        console.error("Error removing loan:", error);
      });
  };

  const handleEditLoan = (loan: LoanData) => {
    setEditingLoan(loan.id);
    setCustomMonthlyPayment(loan.monthlyPayment);
  }

  const handleCustomMontlyPaymentChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, loan: LoanData) => {
    const newMonthlyPayment = parseFloat(event.target.value);
    setCustomMonthlyPayment(newMonthlyPayment);

    const { schedule } = calculateRepaymentSchedule(loan.balance, newMonthlyPayment, loan.interestRate, loan.termLength);
    setCustomRepaymentSchedule(schedule);
  }

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>Loan Repayment Calculator</Typography>

      <Button variant="contained" color="primary" onClick={toggleFormVisibility} style={{ marginBottom: '20px' }}>
        {isFormVisible ? "Hide Form" : "Add New Loan"}
      </Button>

      {isFormVisible && <LoanForm onCalculateRepayment={handleCalculateRepayment} />}
      <Box className={editingLoan ? 'loan-grid editing' : 'loan-grid'}
      style={{ position: 'relative'}}>
        {loans.map((loan) => (
          <Card
            key={loan.id}
            className={editingLoan === loan.id ? 'loan-card expanded' : 'loan-card'}
            style={{ position: 'relative' }}
          >
            <CardContent>
              <Typography variant="subtitle1" align="center">{loan.name}</Typography>
              <Typography>Initial Balance: €{loan.balance.toFixed(2)}</Typography>
              <Typography>Interest Rate: {loan.interestRate}%</Typography>
              <Typography>Monthly Payment: €{loan.monthlyPayment.toFixed(2)}</Typography>
              <Typography>Total Interest: €{loan.totalInterest.toFixed(2)}</Typography>
              <Typography>Term Length: {loan.termLength} months</Typography>

              {editingLoan === loan.id && (
                <TextField
                  label="Custom Monthly Payment"
                  type="number"
                  value={customMonthlyPayment || ''}
                  onChange={(e) => handleCustomMontlyPaymentChange(e, loan)}
                  fullWidth
                  style={{ marginBottom: '10px' }}
                />
              )}

                <LoanChart
                repaymentSchedule={loan.repaymentSchedule}
                customRepaymentSchedule={editingLoan === loan.id ? customRepaymentSchedule : []}
                totalInterest={loan.totalInterest}
                loanBalance={loan.balance}
                isEditing={editingLoan === loan.id}
              />

              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSaveLoan(loan)}
                style={{ marginTop: '10px' }}
              >
                Save
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleRemoveLoan(loan.id)}
                style={{ marginTop: '10px' }}
              >
                Remove
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleEditLoan(loan)}
                style={{ marginTop: '10px' }}
              >
                Edit
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </div>
  );
};

export default LoanCalculator;
