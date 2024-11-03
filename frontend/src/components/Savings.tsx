// Savings.tsx
import React, { useState, useEffect } from 'react';
import Axios from './Axios';
import SavingsChart from './charts/SavingsChart';
import SavingsForm from './forms/SavingsForms';
import { Button, Typography, IconButton } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import dayjs, { Dayjs } from 'dayjs';
import '../App.css';

interface SavingsGoalData {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  progress: number;
  projected_progress: number;
  displayed_amount: number;
  currentMonth: Dayjs;
}

const Savings: React.FC = () => {
  const [savingsData, setSavingsData] = useState<SavingsGoalData[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const getSavingsData = () => {
    Axios.get(`data/savings`)
      .then((response) => {
        const formattedData = response.data.map((goal: any) => ({
          ...goal,
          target_amount: Number(goal.target_amount),
          current_amount: Number(goal.current_amount),
          monthly_contribution: Number(goal.monthly_contribution),
          progress: (goal.current_amount / goal.target_amount) * 100,
          displayed_amount: Number(goal.current_amount), // Initialize as the current amount
          currentMonth: dayjs().startOf('month'),
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

  const handleAddSavingsGoal = (newGoal: Omit<SavingsGoalData, 'id' | 'progress' | 'projected_progress' | 'displayed_amount' | 'currentMonth'>) => {
    Axios.post(`data/savings/`, newGoal)
      .then((response) => {
        const savedGoal = {
          ...response.data,
          progress: (response.data.current_amount / response.data.target_amount) * 100,
          displayed_amount: response.data.current_amount,
          currentMonth: dayjs().startOf('month'),
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

  // Function to handle next month navigation for a specific goal
  const handleNextMonth = (id: string) => {
    setSavingsData(prevData =>
      prevData.map(goal => {
        if (goal.id === id) {
          const newMonth = goal.currentMonth.add(1, 'month');
          // Increment by monthly contribution up to target amount
          const incrementedAmount = goal.displayed_amount + goal.monthly_contribution;

          // Cap displayed_amount at target_amount to prevent overflows
          const newDisplayedAmount = Math.min(incrementedAmount, goal.target_amount);

          console.log(`Next Month for Goal ${id}: Incremented Amount = ${incrementedAmount}, New Displayed Amount = ${newDisplayedAmount}`);

          return {
            ...goal,
            currentMonth: newMonth,
            displayed_amount: newDisplayedAmount,
          };
        }
        return goal;
      })
    );
  };

  // Function to handle previous month navigation for a specific goal
  const handlePreviousMonth = (id: string) => {
    setSavingsData(prevData =>
      prevData.map(goal => {
        if (goal.id === id) {
          const newMonth = goal.currentMonth.subtract(1, 'month');
          const decrementedAmount = goal.displayed_amount - goal.monthly_contribution;
          const newDisplayedAmount = Math.max(decrementedAmount, goal.current_amount);

          console.log(`Previous Month for Goal ${id}: Decremented Amount = ${decrementedAmount}, New Displayed Amount = ${newDisplayedAmount}`);

          return {
            ...goal,
            currentMonth: newMonth,
            displayed_amount: newDisplayedAmount,
          };
        }
        return goal;
      })
    );
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
              {goal.name} - €{Number(goal.displayed_amount).toFixed(2)} / €{Number(goal.target_amount).toFixed(2)}
            </Typography>

            {/* Month Navigation Arrows */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '8px' }}>
              <IconButton onClick={() => handlePreviousMonth(goal.id)}>
                <ArrowBackIosIcon />
              </IconButton>
              <Typography variant="body2">{goal.currentMonth.format('MMMM YYYY')}</Typography>
              <IconButton onClick={() => handleNextMonth(goal.id)}>
                <ArrowForwardIosIcon />
              </IconButton>
            </div>

            {/* Savings Chart */}
            <SavingsChart progress={(goal.displayed_amount / goal.target_amount) * 100} />

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
