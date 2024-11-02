// Savings.tsx
import React, { useState, useEffect } from 'react';
import Axios from './Axios';
import SavingsChart from './charts/SavingsChart';
import SavingsForm from './forms/SavingsForms';
import { Button, List, ListItem, ListItemText, Typography } from '@mui/material';

interface SavingsGoalData {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  progress: number;
  projected_progress: number;
}

const Savings: React.FC = () => {
  const [savingsData, setSavingsData] = useState<SavingsGoalData[]>([]);

  const getSavingsData = () => {
    Axios.get(`data/savings`)
      .then((response) => {
        // Fetch and set the savings goals data
        const formattedData = response.data.map((goal: any) => ({
          ...goal,
          progress: (goal.current_amount / goal.target_amount) * 100,  // Calculate progress
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

  const handleAddSavingsGoal = (newGoal: Omit<SavingsGoalData, 'id' | 'progress' | 'projected_progress'>) => {
    Axios.post(`data/savings/`, newGoal)
      .then((response) => {
        // Add the new goal with calculated progress to the state
        const savedGoal = {
          ...response.data,
          progress: (response.data.current_amount / response.data.target_amount) * 100,
        };
        setSavingsData((prevData) => [...prevData, savedGoal]);
      })
      .catch((error) => {
        console.error("Error adding savings goal:", error);
      });
  };

  const handleRemoveSavingsGoal = (id: string) => {
    Axios.delete(`data/savings/${id}/`)
      .then(() => {
        setSavingsData((prevData) => prevData.filter((goal) => goal.id !== id));
      })
      .catch((error) => {
        console.error("Error removing savings goal:", error);
      });
  };

  return (
    <div>
      <h1>Savings Goals</h1>
      {/* Savings Form */}
      <SavingsForm onAddSavingsGoal={handleAddSavingsGoal} />

      {/* List of Savings Goals with Gauge Charts */}
      <div>
        <Typography variant="h6" style={{ marginTop: '20px' }}>Your Savings Goals</Typography>
        <List>
          {savingsData.map((goal) => (
            <ListItem key={goal.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ListItemText primary={`${goal.name} - $${goal.current_amount} / $${goal.target_amount}`} />
              <SavingsChart progress={goal.progress} />
              <Button onClick={() => handleRemoveSavingsGoal(goal.id)} variant="outlined" color="secondary" style={{ marginTop: 8 }}>
                Remove
              </Button>
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
};

export default Savings;
