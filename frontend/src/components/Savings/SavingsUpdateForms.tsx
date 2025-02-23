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
  const [contribution, setContribution] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate new amount, ensuring it doesn't exceed the target
    const newAmount = Math.min(
      savingsGoal.current_amount + contribution,
      savingsGoal.target_amount
    );

    try {
      const response = await Axios.patch(`data/savings/${savingsGoal.id}/`, {
        current_amount: newAmount,
      });
      onUpdate(response.data); // Pass updated data to the parent
      toast({title: "€" + contribution + " Added Towards Your Saving Goal!", variant: "successfull"})
    } catch (error) {
      console.error("Error updating savings goal:", error);
      toast({title: "Error While Trying to Contribute to Your Goal", variant: "destructive"})
    }
  };

  const remainingAmount =
    savingsGoal.target_amount - savingsGoal.current_amount;

  return (
    <div className="mt-4">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-4">
            <div>
              <Label htmlFor="contribution">Contribution Amount</Label>
              <Input
                id="contribution"
                type="number"
                value={contribution === 0 ? "" : contribution}
                onChange={(e) => setContribution(Number(e.target.value))}
                placeholder={`Max: €${remainingAmount.toFixed(2)}`}
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
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
