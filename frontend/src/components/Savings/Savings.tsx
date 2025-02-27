import React, { useState, useEffect } from "react";
import Axios from "../Axios";
import SavingsChart from "../charts/TestSavingsChart";
import SavingsForm from "../forms/SavingsForms";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "../ui/card";

interface SavingsGoalData {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  progress: number;
  displayed_amount: number;
}

const Savings: React.FC = () => {
  const [savingsData, setSavingsData] = useState<SavingsGoalData[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const navigate = useNavigate();

  const getSavingsData = () => {
    Axios.get(`data/savings`)
      .then((response) => {
        const formattedData = response.data.map((goal: any) => ({
          ...goal,
          target_amount: Number(goal.target_amount),
          current_amount: Number(goal.current_amount),
          monthly_contribution: Number(goal.monthly_contribution),
          progress: (goal.current_amount / goal.target_amount) * 100,
          displayed_amount: Number(goal.current_amount),
        }));
        setSavingsData(formattedData);
      })
      .catch((error) => {
        console.error("Error fetching savings goals:", error);
      });
  };

  useEffect(() => {
    getSavingsData();
  }, []);

  const handleAddSavingsGoal = (newGoal: Omit<SavingsGoalData, "id" | "progress" | "displayed_amount">) => {
    Axios.post(`data/savings/`, newGoal)
      .then(() => {
        setIsFormVisible(false); // Hide form after successful addition
        getSavingsData(); // Force refresh to fetch updated data
      })
      .catch((error) => {
        console.error("Error adding savings goal:", error);
      });
  };

  const handleRemoveSavingsGoal = (id: string) => {
    Axios.delete(`data/savings/${id}/`)
      .then(() => {
        getSavingsData(); // Refresh after removing a goal
      })
      .catch((error) => {
        console.error("Error removing savings goal:", error);
      });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-center mb-6">Savings Goals</h1>

      {/* Toggle Form Button */}
      <div className="flex justify-center mb-6">
        <Button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          {isFormVisible ? "Hide Form" : "Add Savings Goal"}
        </Button>
      </div>

      {/* Savings Form */}
      {isFormVisible && 
      <Card className="p-4 mt-4">
        <CardContent className="space-y-4">
        <SavingsForm onAddSavingsGoal={handleAddSavingsGoal} />
        </CardContent>
      </Card>
      }

      {/* Savings Goals Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-5">
        {savingsData.map((goal) => (
          <div
            key={goal.id}
            data-testid="savings-goal-card"
            className="p-6 border rounded-lg shadow-sm bg-white flex flex-col space-y-4 cursor-pointer hover:shadow-md transition-shadow"
          >
            {/* Goal Name */}
            <h2 className="text-xl font-bold text-center">{goal.name}</h2>

            {/* Progress */}
            <p className="text-center text-gray-500">
              €{goal.displayed_amount.toFixed(2)} / €{goal.target_amount.toFixed(2)}
            </p>

            {/* Chart */}
            <SavingsChart progress={goal.progress} />

            {/* Action Buttons */}
            <div className="flex justify-between space-x-4 ">
              <Button
                className="bg-green-500 hover:bg-green-600 text-white flex-1"
                data-testid="savings-goal-card-expand"
                onClick={() => navigate(`/savings/${goal.id}`)}
              >
                View Goal
              </Button>
              <Button
                className="bg-red-500 text-white flex-1"
                onClick={() => handleRemoveSavingsGoal(goal.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Savings;
