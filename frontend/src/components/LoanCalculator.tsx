// LoanCalculator.tsx
import React, { useState, useEffect } from "react";
import Axios from "./Axios";
import LoanForm from "./forms/LoanForm";
import LoanChart from "./charts/LoanChart";
import {
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import "../App.css";

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
  saved: boolean;
}

const LoanCalculator: React.FC = () => {
  // State variables
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingLoan, setEditingLoan] = useState<string | null>(null);
  const [customMonthlyPayment, setCustomMonthlyPayment] = useState<
    number | null
  >(null);
  const [customRepaymentSchedule, setCustomRepaymentSchedule] = useState<
    number[]
  >([]);

  // Function to calculate repayment schedule
  const calculateRepaymentSchedule = (
    balance: number,
    monthlyPayment: number,
    interestRate: number,
    termLength: number
  ) => {
    // Calculate monthly interest rate
    const monthlyRate = interestRate / 100 / 12;
    const schedule = [];
    let currentBalance = balance;
    let totalInterestPaid = 0;

    // Calculate repayment schedule
    for (let i = 0; i < termLength; i++) {
      const interestForMonth = currentBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestForMonth;
      totalInterestPaid += interestForMonth;
      currentBalance -= principalPayment;

      // Add the remaining balance to the schedule
      schedule.push(currentBalance > 0 ? currentBalance : 0);
      if (currentBalance <= 0) break;
    }

    // Return the repayment schedule and total interest paid
    return { schedule, totalInterestPaid };
  };

  // Fetch loans from the backend when the component loads
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
            currentMonth: dayjs().startOf("month"),
            saved: true,
          };
        });
        setLoans(fetchedLoans);
      })
      .catch((error) => {
        console.error("Error fetching loans:", error);
      });
  }, []);

  // Function to calculate repayment
  const handleCalculateRepayment = (data: {
    name: string;
    balance: number;
    interestRate: number;
    termLength: number;
  }) => {
    const { name, balance, interestRate, termLength } = data;
    const monthlyPayment =
      (balance *
        (interestRate / 100 / 12) *
        Math.pow(1 + interestRate / 100 / 12, termLength)) /
      (Math.pow(1 + interestRate / 100 / 12, termLength) - 1);
    const { schedule, totalInterestPaid } = calculateRepaymentSchedule(
      balance,
      monthlyPayment,
      interestRate,
      termLength
    );

    const newLoan: LoanData = {
      id: `${loans.length + 1}`,
      name,
      balance,
      interestRate,
      termLength,
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      totalInterest: parseFloat(totalInterestPaid.toFixed(2)),
      repaymentSchedule: schedule,
      currentMonth: dayjs().startOf("month"),
      saved: false,
    };

    setLoans([...loans, newLoan]);
  };

  // Function to save loan to the backend
  const handleSaveLoan = (loan: LoanData) => {
    Axios.post("data/loans/", {
      name: loan.name,
      balance: loan.balance,
      interest_rate: loan.interestRate,
      term_length: loan.termLength,
      monthly_payment: loan.monthlyPayment,
      total_interest: loan.totalInterest,
    })
      .then((response) => {
        console.log("Loan saved:", response.data);
        setLoans((prevLoans) =>
          prevLoans.map((l) => (l.id === loan.id ? { ...l, saved: true } : l))
        );
      })
      .catch((error) => {
        console.error("Error saving loan:", error);
      });
  };

  // Function to remove loan
  const handleRemoveLoan = (id: string) => {
    Axios.delete(`data/loans/${id}/`)
      .then(() => {
        setLoans((prevLoans) => prevLoans.filter((loan) => loan.id !== id));
      })
      .catch((error) => {
        console.error("Error removing loan:", error);
      });
  };

  // Function to edit loan
  const handleEditLoan = (loan: LoanData) => {
    setEditingLoan(loan.id);
    setCustomMonthlyPayment(loan.monthlyPayment);
  };

  // Function to handle custom monthly payment change
  const handleCustomMontlyPaymentChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    loan: LoanData
  ) => {
    const newMonthlyPayment = parseFloat(event.target.value);
    setCustomMonthlyPayment(newMonthlyPayment);

    const { schedule } = calculateRepaymentSchedule(
      loan.balance,
      newMonthlyPayment,
      loan.interestRate,
      loan.termLength
    );
    setCustomRepaymentSchedule(schedule);
  };

  // Function to save custom monthly payment
  const handleSaveCustomMonthlyPayment = (loan: LoanData) => {
    // Update the loan with new custom monthly payment
    if (customMonthlyPayment != null) {
      Axios.patch(`data/loans/${loan.id}/`, {
        monthly_payment: customMonthlyPayment,
      })
        .then(() => {
          // Update state to reflect new monthly payment
          setLoans((prevLoans) =>
            prevLoans.map((l) =>
              l.id === loan.id
                ? {
                    ...l,
                    monthlyPayment: customMonthlyPayment,
                    repaymentSchedule: customRepaymentSchedule,
                  }
                : l
            )
          );
          setEditingLoan(null); // Close the edit mode
          setCustomMonthlyPayment(null); // Reset custom monthly payment
          console.log("Loan updated with custom monthly payment.");
        })
        .catch((error) => {
          console.error("Error updating loan:", error);
        });
    }
  };

  // Function to toggle form visibility
  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  return (
    <div>
      <h1>Loan Repayment Calculator</h1>
      <Button
        className="loan-button"
        variant="contained"
        color="primary"
        onClick={toggleFormVisibility}
        style={{ marginBottom: "20px" }}
      >
        {isFormVisible ? "Hide Form" : "Add New Loan"}
      </Button>
    
      {isFormVisible && (
        <LoanForm onCalculateRepayment={handleCalculateRepayment} />
      )}

      {/* Expanded Loan View */}
      {editingLoan && (
        <Box
          className="expanded-loan-container"
          style={{ width: "80%", marginBottom: "20px"}}
        >
          {loans
            .filter((loan) => loan.id === editingLoan)
            .map((loan) => (
              <Card key={loan.id} style={{ width: "100%" }}>
                <CardContent>
                  
                  <Typography variant="subtitle1" align="center">
                    {loan.name}
                  </Typography>
                  <Typography className="loan-detail">
                    Initial Balance: €{loan.balance.toFixed(2)}
                  </Typography>
                  <Typography>Interest Rate: {loan.interestRate}%</Typography>
                  <Typography>
                    Monthly Payment: €{loan.monthlyPayment.toFixed(2)}
                  </Typography>
                  <Typography>
                    Total Interest: €{loan.totalInterest.toFixed(2)}
                  </Typography>
                  <Typography>Term Length: {loan.termLength} months</Typography>

                  <TextField
                    className="custom-payment-input"
                    label="Custom Monthly Payment"
                    type="number"
                    value={customMonthlyPayment || ""}
                    onChange={(e) => handleCustomMontlyPaymentChange(e, loan)}
                    fullWidth
                    style={{ marginBottom: "10px" }}
                  />

                  <LoanChart
                    repaymentSchedule={loan.repaymentSchedule}
                    customRepaymentSchedule={
                      editingLoan === loan.id ? customRepaymentSchedule : []
                    }
                    totalInterest={loan.totalInterest}
                    loanBalance={loan.balance}
                    isEditing={editingLoan === loan.id}
                  />

                  <div className="loan-buttons">
                    <Button
                      className="loan-button"
                      variant="contained"
                      color="primary"
                      onClick={() => handleSaveCustomMonthlyPayment(loan)}
                      style={{ marginTop: "10px" }}
                    >
                      Save Custom Payment
                    </Button>
                    <Button
                      className="remove-loan-button"
                      variant="contained"
                      color="primary"
                      onClick={() => setEditingLoan(null)}
                      style={{ marginTop: "10px" }}
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </Box>
      )}

      {/* Remaining Loans in a Row */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
        gap={3}
      >
        {!editingLoan &&
          loans.map((loan) => (
            <Card key={loan.id} style={{ position: "relative" }}>
              <CardContent>
                <Typography variant="subtitle1" align="center">
                  {loan.name}
                </Typography>
                <Typography>
                  Initial Balance: €{loan.balance.toFixed(2)}
                </Typography>
                <Typography>Interest Rate: {loan.interestRate}%</Typography>
                <Typography>
                  Monthly Payment: €{loan.monthlyPayment.toFixed(2)}
                </Typography>
                <Typography>
                  Total Interest: €{loan.totalInterest.toFixed(2)}
                </Typography>
                <Typography>Term Length: {loan.termLength} months</Typography>

                <LoanChart
                  repaymentSchedule={loan.repaymentSchedule}
                  totalInterest={loan.totalInterest}
                  loanBalance={loan.balance}
                  isEditing={false}
                />

                <div className="loan-buttons">
                  <Button
                    className="loan-button"
                    variant="contained"
                    color="primary"
                    onClick={() => { handleEditLoan(loan); setIsFormVisible(false); }}
                    style={{ marginTop: "10px" }}
                  >
                    Edit
                  </Button>
                  {!loan.saved && (
                    <Button
                      className="loan-button"
                      variant="contained"
                      color="primary"
                      onClick={() => handleSaveLoan(loan)}
                      style={{ marginTop: "10px" }}
                    >
                      Save
                    </Button>
                  )}
                  <Button
                    className="remove-loan-button"
                    variant="contained"
                    color="primary"
                    onClick={() => handleRemoveLoan(loan.id)}
                    style={{ marginTop: "10px" }}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </Box>
    </div>
  );
};

export default LoanCalculator;
