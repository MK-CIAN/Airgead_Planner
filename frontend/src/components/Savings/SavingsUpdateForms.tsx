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
  onUpdate: (updatedGoal: any) => void;
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

    // Ensure the value is a number and handle edge cases
    if (isNaN(value)) {
      setContribution("");
      return;
    }

    // Enforce constraints: max contribution = remainingAmount, min = -current_amount
    if (value > remainingAmount) {
      value = remainingAmount;
    }
    if (value < -savingsGoal.current_amount) {
      value = -savingsGoal.current_amount;
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

    // Calculate new amount, ensuring it doesn't exceed the target and doesn't drop below zero
    const newAmount = Math.max(
      Math.min(savingsGoal.current_amount + parsedContribution, savingsGoal.target_amount),
      0
    );

    try {
      const response = await Axios.patch(`data/savings/${savingsGoal.id}/`, {
        current_amount: newAmount,
      });

      onUpdate(response.data);
      toast({
        title: `€${parsedContribution.toFixed(2)} Updated!`,
        description: "Your savings goal has been updated.",
        variant: "successfull",
      });

      setContribution(""); // Clear the input after submission
    } catch (error) {
      console.error("Error updating savings goal:", error);
      toast({
        title: "Error",
        description: "Failed to update savings goal.",
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
