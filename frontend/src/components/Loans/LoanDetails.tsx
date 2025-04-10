import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Axios from "../Services/Axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActiveLoanChart from "./ActiveLoanChart";
import { toast } from "@/hooks/use-toast";
import FeatureTooltip from "../ui/featureTooltip";

interface LoanDetailsProps {}

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
  createdAt: string;
}

interface LoanPayment {
  id: string;
  amount: number;
  payment_date: string;
}

// Function to generate a repayment schedule
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

const LoanDetails: React.FC<LoanDetailsProps> = () => {
  const { id } = useParams();
  const [loan, setLoan] = useState<ActiveLoanData | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentHistory, setPaymentHistory] = useState<LoanPayment[]>([]);

  // Fetch the loan details and its payment history
  useEffect(() => {
    Axios.get(`data/active-loan/${id}/`)
      .then((response) => {
        setLoan({
          id: response.data.id,
          name: response.data.name,
          balance: parseFloat(response.data.balance) || 0,
          originalBalance: parseFloat(response.data.original_balance) || 0,
          interestRate: parseFloat(response.data.interest_rate) || 0,
          termLength: parseInt(response.data.term_length, 10) || 0,
          monthlyPayment: parseFloat(response.data.monthly_payment) || 0,
          totalInterest: parseFloat(response.data.total_interest) || 0,
          paymentDueDate: response.data.payment_due_date,
          createdAt: response.data.created_at,
        });
      })
      .catch((error) =>
        console.error("Error fetching active loan details:", error)
      );

    Axios.get(`data/active-loan/${id}/payments/`)
      .then((response) => {
        setPaymentHistory(response.data);
      })
      .catch((error) =>
        console.error("Error fetching active loan payment history:", error)
      );
  }, [id]);

  // Handle making a payment
  const handlePayment = () => {
    if (!loan || !paymentAmount) return;

    Axios.post(`data/active-loan/${id}/make_payment/`, {
      amount: parseFloat(paymentAmount),
    })
      .then((response) => {
        toast({
          title: "Payment Successful!",
          description: paymentAmount + " Euro Contributed to Your Loan",
          variant: "successfull",
        });

        // Update state with new balance and new payment history
        setLoan((prevLoan) =>
          prevLoan
            ? { ...prevLoan, balance: response.data.remaining_balance }
            : null
        );
        setPaymentHistory([...paymentHistory, response.data.payment]);
        setPaymentAmount("");
      })
      .catch((error) => console.error("Error making payment:", error));
    toast({
      title: "Payment Unsuccessfull",
      description: "Error While Attempting to Contribute",
      variant: "destructive",
    });
  };

  const formattedPayments = loan
    ? (() => {
        let remainingBalance = loan.originalBalance; // Starting with the original balance
        const sortedPayments = [...paymentHistory].sort(
          (a, b) =>
            new Date(a.payment_date).getTime() -
            new Date(b.payment_date).getTime()
        );

        let paymentsProcessed: { date: string; balance: number }[] = [];

        // Applying actual payments first
        sortedPayments.forEach((payment) => {
          remainingBalance -= payment.amount;
          remainingBalance = Math.max(remainingBalance, 0);
          paymentsProcessed.push({
            date: payment.payment_date,
            balance: remainingBalance,
          });
        });

        // Generating repayment schedule based on the last remaining balance
        let currentBalance = remainingBalance;
        let repaymentSchedule: { date: string; balance: number }[] = [];

        for (let i = 0; i < loan.termLength; i++) {
          const dueDate = new Date(loan.createdAt);
          dueDate.setMonth(dueDate.getMonth() + i);

          if (paymentsProcessed.find((p) => p.date === dueDate.toISOString())) {
            // Skipping months where an actual payment was made
            continue;
          }

          currentBalance -= loan.monthlyPayment;
          currentBalance = Math.max(currentBalance, 0); // Ensuring it doesn't go negative

          repaymentSchedule.push({
            date: dueDate.toISOString(),
            balance: currentBalance,
          });

          if (currentBalance <= 0) break; // Stopping once fully paid
        }

        return [...paymentsProcessed, ...repaymentSchedule];
      })()
    : [];

  // Debug
  console.log("Formatted Payments:", formattedPayments);

  return loan ? (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Loan Details: {loan.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Current Balance:</strong> €
            {Number(loan.balance || 0).toFixed(2)}
          </p>
          <p>
            <strong>Original Balance:</strong> €
            {Number(loan.originalBalance || 0).toFixed(2)}
          </p>
          <p>
            <strong>Interest Rate:</strong> {loan.interestRate}%
          </p>
          <p>
            <strong>Monthly Payment:</strong> €
            {Number(loan.monthlyPayment || 0).toFixed(2)}
          </p>
          <p>
            <strong>Total Interest:</strong> €
            {Number(loan.totalInterest || 0).toFixed(2)}
          </p>
          <p>
            <strong>Payment Due Date:</strong> {loan.paymentDueDate}
          </p>

          <FeatureTooltip content="See your loan and interest visualized over time.">
            {/* Loan Chart */}
            <ActiveLoanChart
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
              actualPayments={formattedPayments}
              createdAt={loan.createdAt}
            />
          </FeatureTooltip>

          {/* Payment Input */}
          <div className="mt-6">
            <FeatureTooltip content="Make a payment to reduce your loan balance.">
              <Input
                type="number"
                placeholder="Enter payment amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="mb-4"
              />
              <Button
                onClick={handlePayment}
                className="bg-green-500 text-white"
              >
                Make Payment
              </Button>
            </FeatureTooltip>
          </div>

          {/* Payment History */}
          <h3 className="text-lg font-semibold mt-6">Payment History</h3>
          <ul className="mt-2">
            {paymentHistory.map((payment) => (
              <li key={payment.id} className="border-b py-2">
                <span>
                  €{Number(payment.amount || 0).toFixed(2)} paid on{" "}
                  {new Date(payment.payment_date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  ) : (
    <p>Loading loan details...</p>
  );
};

export default LoanDetails;
