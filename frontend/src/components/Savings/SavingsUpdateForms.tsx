import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Axios from "../Axios";
import { toast } from "@/hooks/use-toast";

interface UpdateSavingsFormProps {
  savingsGoal: {
    id: number;
    current_amount: number;
    target_amount: number;
  };
  onUpdate: (updatedGoal: any, newContribution?: SavingsContribution) => void;
}

interface SavingsContribution {
  id: string;
  amount: number;
  contribution_date: string;
}

const UpdateSavingsForm: React.FC<UpdateSavingsFormProps> = ({
  savingsGoal,
  onUpdate,
}) => {
  const [contribution, setContribution] = useState<string>("");

  const remainingAmount =
    savingsGoal.target_amount - savingsGoal.current_amount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);

    if (isNaN(value)) {
      setContribution("");
      return;
    }

    // Prevent contributions from reducing balance below zero
    const maxWithdrawal = -savingsGoal.current_amount;
    if (value < maxWithdrawal) {
      value = maxWithdrawal;
    }

    // Prevent contributions exceeding remaining amount
    if (value > remainingAmount) {
      value = remainingAmount;
    }

    setContribution(value.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedContribution = parseFloat(contribution);

    if (isNaN(parsedContribution) || parsedContribution === 0) {
      toast({
        title: "Invalid Contribution",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await Axios.post(
        `data/savings/${savingsGoal.id}/add_contribution/`,
        {
          amount: parsedContribution,
        }
      );

      // Update savings goal state immediately
      onUpdate(
        {
          ...savingsGoal,
          current_amount: savingsGoal.current_amount + parsedContribution,
        },
        {
          id: response.data.contribution.id,
          amount: response.data.contribution.amount,
          contribution_date: response.data.contribution.contribution_date,
        }
      );

      toast({
        title: `€${parsedContribution.toFixed(2)} Added!`,
        description: "Your contribution has been recorded.",
        variant: "successfull",
      });

      setContribution(""); // Clear the input field
    } catch (error) {
      console.error("Error adding contribution:", error);
      toast({
        title: "Error",
        description: "Failed to add contribution.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-4">
          <div>
            <Label htmlFor="contribution">Contribution Amount</Label>
            <Input
              id="contribution"
              data-testid="contribution-amount-input"
              type="number"
              step="0.01"
              value={contribution}
              onChange={handleChange}
              placeholder={`Max: €${remainingAmount.toFixed(2)}`}
              className="mt-1"
              min={-savingsGoal.current_amount}
              max={remainingAmount}
            />
          </div>
          <Button
            type="submit"
            data-testid="add-contribution-button"
            className="w-full bg-green-500 hover:bg-green-600"
          >
            Add Contribution
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateSavingsForm;
