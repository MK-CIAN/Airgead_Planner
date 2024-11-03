// Savings.tsx
import React, { useState, useEffect } from 'react';
import Axios from './Axios';
import SavingsChart from './charts/SavingsChart';
import SavingsForm from './forms/SavingsForms';
import { Button, List, ListItem, ListItemText, Typography } from '@mui/material';
import '../App.css';

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
  const [isFormVisible, setIsFormVisible] = useState(false);  // Track form visibility

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
        setIsFormVisible(false); 
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

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  return (
    <div>
      {/* Toggle Button for Savings Form */}
      <div className='savings-submit'>
        <Button variant="contained" color="primary" onClick={toggleFormVisibility}>
          {isFormVisible ? "Hide Form" : "Add Savings Goal"}
        </Button>
      </div>

      {/* Conditionally Render Savings Form */}
      {isFormVisible && (
        <div style={{ marginTop: '16px' }}>
          <SavingsForm onAddSavingsGoal={handleAddSavingsGoal} />
        </div>
      )}

      {/* Title for Savings Goals */}
      <Typography variant="h6" className="savings-title">
        Your Savings Goals
      </Typography>

      {/* List of Savings Goals with Gauge Charts */}
      <div className="savings-grid">
        {savingsData.map((goal) => (
          <div key={goal.id} className="savings-item">
            <Typography variant="subtitle1" align="center">
              {goal.name} - €{goal.current_amount} / €{goal.target_amount}
            </Typography>
            <SavingsChart progress={goal.progress} />
            <Button
              onClick={() => handleRemoveSavingsGoal(goal.id)}
              variant="outlined"
              color="secondary"
              style={{ marginTop: 8 }}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Savings;
