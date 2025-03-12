import React, { useState } from "react";
import Axios from "./Axios";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import dayjs from "dayjs";

interface SuggestedActionProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: any;
}

const SuggestedAction: React.FC<SuggestedActionProps> = ({
  isOpen,
  onClose,
  suggestion,
}) => {
  const [amount, setAmount] = useState<number>(suggestion?.suggested_amount || 0);
  const navigate = useNavigate();

  // Get the current month's budget ID
  const fetchCurrentBudget = async () => {
    const formattedMonth = dayjs().startOf("month").format("YYYY-MM-DD");

    try {
      const response = await Axios.get("data/budget/", { params: { month: formattedMonth } });

      if (response.data.length > 0) {
        return response.data[0].id;
      } else {
        // If no budget found, create a new one
        const budgetResponse = await Axios.post("data/budget/", { month: formattedMonth });
        return budgetResponse.data.id;
      }
    } catch (error) {
      console.error("Error fetching budget:", error);
      return null;
    }
  };

  // Add an item to the budget
  const handleAddBudgetItem = async () => {
    const budgetId = await fetchCurrentBudget();
    if (!budgetId) {
      console.error("No budget available.");
      return;
    }

    try {
      await Axios.post(`data/budget/${budgetId}/items/`, {
        amount: amount.toString(),
        category: suggestion.savings_goal ? "Savings" : "Debt Payment",
        transaction_type: "expense",
      });

      toast({
        title: "Expense recorded!",
        description: `€${amount} added to your monthly budget.`,
      });
    } catch (error) {
      console.error("Error adding budget item:", error);
    }
  };

  // Fetch the savings goal details
  const fetchSavingsGoal = async (goalId: number) => {
    try {
      const response = await Axios.get(`data/savings/${goalId}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching savings goal:", error);
      return null;
    }
  };

  // Fetch the loan details
  const fetchLoan = async (loanId: number) => {
    try {
      const response = await Axios.get(`data/active-loan/${loanId}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching loan details:", error);
      return null;
    }
  };

  const handleConfirm = async () => {
    console.log("Confirming Action for:", suggestion);
  
    try {
      let categoryLabel = suggestion.savings_goal
        ? "Savings Contribution"
        : "Loan Payment";
  
      if (suggestion.savings_goal) {
        const savingsGoal = await fetchSavingsGoal(suggestion.savings_goal);
        if (savingsGoal) {
          await Axios.post(`data/savings/${savingsGoal.id}/add_contribution/`, { amount });
  
          categoryLabel = `${savingsGoal.name} Contribution`;
          toast({
            title: `€${amount} Added!`,
            description: "Contribution recorded.",
            variant: "successfull",
          });
          navigate(`/savings/${suggestion.savings_goal}`);
        }
      }
  
      if (suggestion.loan_id) {
        const loan = await fetchLoan(suggestion.loan_id);
        if (loan) {
          await Axios.post(`data/active-loan/${loan.id}/make_payment/`, { amount });
  
          categoryLabel = `${loan.name} Payment`;
          toast({
            title: "Loan payment successful!",
            description: `€${amount} paid towards your loan.`,
          });
          navigate(`/loans/loan-details/${suggestion.loan_id}`);
        }
      }
  
      // Add the contributed amount as an expense in the user's budget with a better category label
      const budgetId = await fetchCurrentBudget();
      if (budgetId) {
        await Axios.post(`data/budget/${budgetId}/items/`, {
          amount: amount.toString(),
          category: categoryLabel,
          transaction_type: "expense",
        });
  
        toast({
          title: "Expense recorded!",
          description: `€${amount} added to your monthly budget under '${categoryLabel}'.`,
        });
      }
  
      onClose();
    } catch (err) {
      console.error("Error processing action:", err);
      toast({ title: "Error", description: "Failed to complete action.", variant: "destructive" });
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="p-6">
        <DrawerHeader>
          <DrawerTitle>Confirm Action</DrawerTitle>
          <p>Would you like to proceed with this action?</p>
        </DrawerHeader>
        <div className="p-4">
          <p className="text-lg font-semibold">{suggestion?.suggestion_text}</p>
          <p className="text-gray-600 mt-2">Suggested amount: <strong>€{amount}</strong></p>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            placeholder="Enter amount"
            className="mt-2"
          />
        </div>
        <DrawerFooter>
          <Button variant="destructive" onClick={onClose}>Cancel</Button>
          <Button variant="default" onClick={handleConfirm}>Confirm & Proceed</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default SuggestedAction;
