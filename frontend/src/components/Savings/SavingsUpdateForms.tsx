import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Axios from "../Axios";

interface UpdateSavingsFormProps {
  savingsGoal: {
    id: number;
    current_amount: number;
  };
  onUpdate: (updatedGoal: any) => void;
}

const UpdateSavingsForm: React.FC<UpdateSavingsFormProps> = ({ savingsGoal, onUpdate }) => {
  const [contribution, setContribution] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Calculate the new amount
      const newAmount = savingsGoal.current_amount + contribution;

      const response = await Axios.patch(`data/savings/${savingsGoal.id}/`, {
        current_amount: newAmount,
      });
      onUpdate(response.data); // Pass updated data to the parent
    } catch (error) {
      console.error("Error updating savings goal:", error);
    }
  };
  

  return (
    <Card className="mt-4">
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-4">
            <div>
              <Label htmlFor="currentAmount">Current Amount</Label>
              <Input
                id="currentAmount"
                type="number"
                value={contribution}
                onChange={(e) => setContribution(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full">
              Update Goal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UpdateSavingsForm;
