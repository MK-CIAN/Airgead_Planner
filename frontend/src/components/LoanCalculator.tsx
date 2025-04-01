import React, { useState, useEffect } from "react";
import Axios from "./Axios";
import LoanForm from "./forms/LoanForm";
import LoanChart from "./charts/LoanChart";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import dayjs from "dayjs";
import ActiveLoanForm from "./forms/ActiveLoanForm";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import LoanPlaceholder from "./Placeholders/LoanPlaceholder";
import FeatureTooltip from "./ui/featureTooltip";

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

interface ActiveLoanData {
  id: string;
  name: string;
  balance: number;
  originalBalance: number;
  interestRate: number;
  termLength: number;
  monthlyPayment: number;
  totalInterest: number;
  paymentDueDate: string;
  remainingMonths: number;
}

const generateRepaymentSchedule = (
  balance: number,
  _rate: number,
  term: number
) => {
  const schedule = [];
  let currentBalance = balance;

  for (let i = 0; i < term; i++) {
    currentBalance -= balance / term;

    schedule.push(currentBalance > 0 ? currentBalance : 0);
    if (currentBalance <= 0) break;
  }

  return schedule;
};

const LoanCalculator: React.FC = () => {
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [activeLoans, setActiveLoans] = useState<ActiveLoanData[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showActiveLoanForm, setShowActiveLoanForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<string | null>(null);
  const [customMonthlyPayment, setCustomMonthlyPayment] = useState<
    number | null
  >(null);
  const [customRepaymentSchedule, setCustomRepaymentSchedule] = useState<
    number[]
  >([]);
  const navigate = useNavigate();

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

    // Calculating repayment schedule
    for (let i = 0; i < termLength; i++) {
      const interestForMonth = currentBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestForMonth;
      totalInterestPaid += interestForMonth;
      currentBalance -= principalPayment;

      // Adding current balance to schedule
      schedule.push(currentBalance > 0 ? currentBalance : 0);
      if (currentBalance <= 0) break;
    }

    // Returning the repayment schedule and total interest paid
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

      Axios.get(`data/active-loan/`)
      .then((response) => {
        const fetchedActiveLoans = response.data.map((loan: any) => {
          const firstPaymentDate = dayjs(loan.payment_due_date);
          const today = dayjs();

          const monthsElapsed = today.diff(firstPaymentDate, "month");
  
          const remainingMonths = Math.max(loan.term_length - monthsElapsed, 0);
  
          return {
            id: loan.id,
            name: loan.name,
            balance: parseFloat(loan.balance) || 0,
            originalBalance: parseFloat(loan.original_balance) || 0,
            interestRate: parseFloat(loan.interest_rate) || 0,
            termLength: parseInt(loan.term_length, 10) || 0,
            monthlyPayment: parseFloat(loan.monthly_payment) || 0,
            totalInterest: parseFloat(loan.total_interest) || 0,
            paymentDueDate: loan.payment_due_date,
            remainingMonths, // New property
          };
        });
  
        setActiveLoans(fetchedActiveLoans);
      })
      .catch((error) => {
        console.error("Error fetching active loans:", error);
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

  const handleSaveActiveLoan = (data: {
    name: string;
    balance: number | string;
    interestRate: number;
    termLength: number;
    paymentDueDate: string;
  }) => {
    if (!data.paymentDueDate || data.paymentDueDate.trim() === "") {
      toast({
        title: "Missing Payment Due Date",
        description: "Please enter the first payment date before saving.",
        variant: "destructive",
      });
      return;
    }
  
    // Ensure balance is parsed correctly
    const parsedBalance = parseFloat(data.balance as string) || 0;
    const monthlyRate = data.interestRate / 100 / 12;
    const monthlyPayment =
      (parsedBalance * monthlyRate * Math.pow(1 + monthlyRate, data.termLength)) /
      (Math.pow(1 + monthlyRate, data.termLength) - 1);
  
    const totalInterest = monthlyPayment * data.termLength - parsedBalance;
  
    // Format data for API (convert all relevant fields to numbers)
    const formattedLoan = {
      name: data.name,
      balance: parsedBalance, // Ensure balance is stored as a number
      interest_rate: data.interestRate,
      term_length: data.termLength,
      monthly_payment: parseFloat(monthlyPayment.toFixed(2)),
      total_interest: parseFloat(totalInterest.toFixed(2)),
      payment_due_date: data.paymentDueDate,
    };
  
    // Send request to backend
    Axios.post("data/active-loan/", formattedLoan)
      .then((response) => {
        // Ensure the response data is properly formatted before updating state
        const newLoan = {
          id: response.data.id,
          name: response.data.name,
          balance: parseFloat(response.data.balance) || 0,  // Ensure number type
          originalBalance: parseFloat(response.data.original_balance) || 0,
          interestRate: parseFloat(response.data.interest_rate) || 0,
          termLength: parseInt(response.data.term_length, 10) || 0,
          monthlyPayment: parseFloat(response.data.monthly_payment) || 0,
          totalInterest: parseFloat(response.data.total_interest) || 0,
          paymentDueDate: response.data.payment_due_date,
          remainingMonths: Math.max(
            parseInt(response.data.term_length, 10) -
              dayjs().diff(dayjs(response.data.payment_due_date), "month"),
            0
          ),
        };
  
        // Update state with properly parsed loan data
        setActiveLoans((prevLoans) => [...prevLoans, newLoan]);
        setShowActiveLoanForm(false); // Hide the form only after success
  
        toast({
          title: "Active Loan Added",
          description: "Your loan has been successfully added.",
          variant: "successfull",
        });
      })
      .catch((error) => {
        console.error("Error saving loan:", error);
        toast({
          title: "Error",
          description: "Failed to save the loan. Please try again.",
          variant: "destructive",
        });
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

  const handleRemoveActiveLoan = (id: string) => {
    Axios.delete(`data/active-loan/${id}/delete_loan/`)
      .then(() => {
        setActiveLoans((prevLoans) =>
          prevLoans.filter((loan) => loan.id !== id)
        );
        console.log("Active loan and payments deleted successfully.");
      })
      .catch((error) => {
        console.error("Error removing active loan:", error);
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
    setShowActiveLoanForm(false); // Hide active loan form when this is opened
  };

  const toggleActiveLoanFormVisibility = () => {
    setShowActiveLoanForm(!showActiveLoanForm);
    setIsFormVisible(false); // Hide new loan form when this is opened
  };

  function isEditing(_isEditing: boolean) {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        Loan Repayment Calculator
      </h1>

      {/* Conditionally render "Add New Loan" buttons */}
      {!editingLoan && (
        <div className="flex justify-center space-x-4 mt-4">
          <Button
            onClick={toggleFormVisibility}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            {isFormVisible ? "Hide Form" : "Calculate New Loan"}
          </Button>
          <Button
            onClick={toggleActiveLoanFormVisibility}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            {showActiveLoanForm ? "Hide Form" : "Add a Loan"}
          </Button>
        </div>
      )}

      {/* Show Loan Form */}
      {isFormVisible && !editingLoan && !showActiveLoanForm && (
        <Card className="p-4 mt-4">
          <CardContent className="space-y-4">
            <LoanForm onCalculateRepayment={handleCalculateRepayment} />
          </CardContent>
        </Card>
      )}

      {showActiveLoanForm && !editingLoan && (
        <Card className="p-4 mt-4">
          <CardContent className="space-y-4">
            <ActiveLoanForm onSaveLoan={handleSaveActiveLoan} />
          </CardContent>
        </Card>
      )}

      {/* Expanded Loan View - Fullscreen when Editing */}
      {editingLoan ? (
        <div className="w-full lg:w-4/5 mx-auto mb-6">
          {loans
            .filter((loan) => loan.id === editingLoan)
            .map((loan) => (
              <Card key={loan.id} className="w-full shadow-lg">
                <CardContent>
                  <h2 className="text-xl font-bold text-center mb-4">
                    {loan.name}
                  </h2>
                  <p className="mb-2">
                    Initial Balance: €{!isNaN(loan.balance) ? loan.balance.toFixed(2) : "N/A"}
                  </p>
                  <p className="mb-2">Interest Rate: {loan.interestRate}%</p>
                  <p className="mb-2">
                    Monthly Payment: €{loan.monthlyPayment.toFixed(2)}
                  </p>
                  <p className="mb-2">
                    Total Interest: €{loan.totalInterest.toFixed(2)}
                  </p>
                  <p className="mb-4">Term Length: {loan.termLength} months</p>

                  <FeatureTooltip content="Edit the monthly payment to see how it affects your repayment schedule.">
                  <Input
                    type="number"
                    placeholder="Custom Monthly Payment"
                    value={customMonthlyPayment || ""}
                    onChange={(e) => handleCustomMontlyPaymentChange(e, loan)}
                    className="mb-4"
                  />
                  </FeatureTooltip>

                  <LoanChart
                    repaymentSchedule={loan.repaymentSchedule}
                    customRepaymentSchedule={
                      editingLoan === loan.id ? customRepaymentSchedule : []
                    }
                    totalInterest={loan.totalInterest}
                    loanBalance={loan.balance}
                    termLength={loan.termLength}
                    interestRate={loan.interestRate}
                    isEditing={editingLoan === loan.id}
                    isActiveLoan={false}
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
      ) : (
        /* Loan Carousels - Render only when NOT editing */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Left Card - Calculated Loans */}
          {loans.length > 0 ? (
            <FeatureTooltip content="View your calculated loans and save them for future reference.">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-center">
                  Calculated Loans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Carousel>
                  <CarouselContent>
                    {loans.map((loan) => (
                      <CarouselItem key={loan.id}>
                        <Card className="shadow-lg">
                          <CardContent>
                            <h2 className="text-xl font-bold text-center mb-4">
                              {loan.name}
                            </h2>
                            <p>Initial Balance: €{!isNaN(loan.balance) ? loan.balance.toFixed(2) : "N/A"}</p>
                            <p>Interest Rate: {loan.interestRate}%</p>
                            <p>
                              Monthly Payment: €{loan.monthlyPayment.toFixed(2)}
                            </p>
                            <p>
                              Total Interest: €{loan.totalInterest.toFixed(2)}
                            </p>
                            <p>Term Length: {loan.termLength} months</p>

                            <LoanChart
                              repaymentSchedule={loan.repaymentSchedule}
                              totalInterest={loan.totalInterest}
                              loanBalance={loan.balance}
                              termLength={loan.termLength}
                              interestRate={loan.interestRate}
                              isEditing={editingLoan === loan.id}
                              isActiveLoan={false}
                            />

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
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {loans.length > 1 && (
                    <>
                      <CarouselPrevious />
                      <CarouselNext />
                    </>
                  )}
                </Carousel>
              </CardContent>
            </Card>
            </FeatureTooltip>
          ) : (
            <LoanPlaceholder type="calculated-loan" />
          )}

          {/* Right Card - Active Loans */}
          {activeLoans.length > 0 ? (
            <FeatureTooltip content="View your active loans and manage them.">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-center">
                  Active Loans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Carousel>
                  <CarouselContent>
                    {activeLoans.map((loan) => (
                      <CarouselItem key={loan.id}>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent>
                            <h2 className="text-xl font-bold text-center mb-4">
                              {loan.name}
                            </h2>
                            <p>Balance: €{!isNaN(loan.balance) ? loan.balance.toFixed(2) : "N/A"}</p>
                            <p>Interest Rate: {loan.interestRate}%</p>
                            <p>
                              Monthly Payment: €{loan.monthlyPayment.toFixed(2)}
                            </p>
                            <p>Payment Due Date: {loan.paymentDueDate}</p>
                            <p>Remaining Months: {loan.remainingMonths} months</p>

                            <LoanChart
                              repaymentSchedule={generateRepaymentSchedule(
                                loan.originalBalance,
                                loan.interestRate,
                                loan.termLength
                              )}
                              loanBalance={loan.balance}
                              originalBalance={loan.originalBalance}
                              interestRate={loan.interestRate}
                              termLength={loan.termLength}
                              totalInterest={loan.totalInterest}
                              isEditing={false}
                              isActiveLoan={true}
                            />

                            <div className="flex justify-center space-x-4 mt-4">
                              <Button
                                onClick={() => {
                                  navigate(`loan-details/${loan.id}`);
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                              >
                                Expand
                              </Button>
                              <Button
                                onClick={() => handleRemoveActiveLoan(loan.id)}
                                className="bg-red-600 text-white px-4 py-2 rounded"
                              >
                                Remove
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {activeLoans.length > 1 && (
                    <>
                      <CarouselPrevious />
                      <CarouselNext />
                    </>
                  )}
                </Carousel>
              </CardContent>
            </Card>
            </FeatureTooltip>
          ) : (
            <LoanPlaceholder type="active-loan" />
          )}
        </div>
      )}
    </div>
  );
};

export default LoanCalculator;
