import React, { useState } from "react";
import Axios from "./Axios";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom"; // ✅ Using React Router
import { toast } from "@/hooks/use-toast";

interface SuggestedActionProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: any; // FinancialSuggestion object
}

const SuggestedAction: React.FC<SuggestedActionProps> = ({ isOpen, onClose, suggestion }) => {
  const [amount, setAmount] = useState<number>(suggestion?.suggested_amount || 0);
  const navigate = useNavigate(); // ✅ Using useNavigate for redirection

  const handleConfirm = () => {
    console.log("Confirming Action for:", suggestion);

    if (suggestion.savings_goal) {
      Axios.post(`/data/savings-goals/${suggestion.savings_goal}/add-contribution/`, { amount })
        .then(() => {
          toast({ title: "Contribution successful!", description: `€${amount} added to your savings goal.` });
          onClose();
          navigate(`/savings-goals/${suggestion.savings_goal}`);
        })
        .catch((err) => {
          console.error("Error adding contribution:", err);
          toast({ title: "Error", description: "Failed to contribute to savings goal.", variant: "destructive" });
        });
    }

    if (suggestion.loan_id) {
      Axios.post(`/data/loans/${suggestion.loan_id}/make-payment/`, { amount }) // Example loan endpoint
        .then(() => {
          toast({ title: "Loan payment successful!", description: `€${amount} paid towards your loan.` });
          onClose();
          navigate(`/loans/${suggestion.loan_id}`);
        })
        .catch((err) => {
          console.error("Error making loan payment:", err);
          toast({ title: "Error", description: "Failed to make loan payment.", variant: "destructive" });
        });
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
