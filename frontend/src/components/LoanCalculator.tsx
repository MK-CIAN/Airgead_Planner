import React, { useState, useEffect } from "react";
import Axios from "./Axios";
import LoanForm from "./forms/LoanForm";
import LoanChart from "./charts/LoanChart";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import dayjs from "dayjs";

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

      // Add current balance to schedule
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
          setEditingLoan(null);
          setCustomMonthlyPayment(null); 
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

  function isEditing(_isEditing: boolean) {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Loan Repayment Calculator</h1>

      {/* Conditionally render "Add New Loan" button */}
      {!editingLoan && (
        <div className="flex justify-center mb-6">
          <Button
            onClick={toggleFormVisibility}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            {isFormVisible ? "Hide Form" : "Add New Loan"}
          </Button>
        </div>
      )}

      {/* Show Loan Form */}
      {isFormVisible && !editingLoan && (
        <Card className="p-4 mt-4">
          <CardContent className="space-y-4">
          <LoanForm onCalculateRepayment={handleCalculateRepayment} />
          </CardContent>
        </Card>
      )}

      {/* Expanded Loan View */}
      {editingLoan && (
        <div className="w-full lg:w-4/5 mx-auto mb-6">
          {loans
            .filter((loan) => loan.id === editingLoan)
            .map((loan) => (
              <Card key={loan.id} className="w-full shadow-lg">
                <CardContent>
                  <h2 className="text-xl font-bold text-center mb-4">
                    {loan.name}
                  </h2>
                  <p className="mb-2">Initial Balance: €{loan.balance.toFixed(2)}</p>
                  <p className="mb-2">Interest Rate: {loan.interestRate}%</p>
                  <p className="mb-2">
                    Monthly Payment: €{loan.monthlyPayment.toFixed(2)}
                  </p>
                  <p className="mb-2">Total Interest: €{loan.totalInterest.toFixed(2)}</p>
                  <p className="mb-4">Term Length: {loan.termLength} months</p>

                  <Input
                    type="number"
                    placeholder="Custom Monthly Payment"
                    value={customMonthlyPayment || ""}
                    onChange={(e) => handleCustomMontlyPaymentChange(e, loan)}
                    className="mb-4"
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

                  {/* Centered Buttons */}
                  <div className="flex justify-center space-x-4 mt-4">
                    <Button
                      onClick={() => handleSaveCustomMonthlyPayment(loan)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Save Custom Payment
                    </Button>
                    <Button
                      onClick={() => setEditingLoan(null)}
                      className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Remaining Loans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
        {!editingLoan &&
          loans.map((loan) => (
            <Card key={loan.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent>
                <h2 className="text-xl font-bold text-center mb-4">{loan.name}</h2>
                <p className="mb-2">Initial Balance: €{loan.balance.toFixed(2)}</p>
                <p className="mb-2">Interest Rate: {loan.interestRate}%</p>
                <p className="mb-2">
                  Monthly Payment: €{loan.monthlyPayment.toFixed(2)}
                </p>
                <p className="mb-2">Total Interest: €{loan.totalInterest.toFixed(2)}</p>
                <p className="mb-4">Term Length: {loan.termLength} months</p>

                <LoanChart
                  repaymentSchedule={loan.repaymentSchedule}
                  totalInterest={loan.totalInterest}
                  loanBalance={loan.balance}
                  isEditing={false}
                />

                {/* Centered Buttons */}
                <div className="flex justify-center space-x-4 mt-4">
                  <Button
                    onClick={() => {
                      handleEditLoan(loan);
                      setIsFormVisible(false);
                      isEditing(true);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </Button>
                  {!loan.saved && (
                    <Button
                      onClick={() => handleSaveLoan(loan)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Save
                    </Button>
                  )}
                  <Button
                    onClick={() => handleRemoveLoan(loan.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );    
};

export default LoanCalculator;
