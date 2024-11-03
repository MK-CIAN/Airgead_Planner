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
  start_date: Dayjs | null;
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
          displayed_amount: Number(goal.current_amount),
          currentMonth: dayjs().startOf('month'),
          start_date: goal.start_date ? dayjs(goal.start_date) : null, // Convert start_date to Dayjs
          target_date: goal.target_date ? dayjs(goal.target_date) : null, // Convert target_date to Dayjs if applicable
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

  const handleAddSavingsGoal = (newGoal: { name: string; target_amount: number; current_amount: number; monthly_contribution: number; target_date?: string | null; start_date?: string | null }) => {
    Axios.post(`data/savings/`, newGoal)
      .then((response) => {
        const savedGoal: SavingsGoalData = {
          ...response.data,
          progress: (response.data.current_amount / response.data.target_amount) * 100,
          displayed_amount: response.data.current_amount,
          currentMonth: dayjs().startOf('month'),
          start_date: response.data.start_date ? dayjs(response.data.start_date) : null,  // Convert to Dayjs
          target_date: response.data.target_date ? dayjs(response.data.target_date) : null,  // Convert to Dayjs if applicable
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

          if (goal.displayed_amount >= goal.target_amount) {
            console.log("Target amount reached; cannot go forward further.");
            return goal;
          }
          
          const newMonth = goal.currentMonth.add(1, 'month');
          const incrementedAmount = goal.displayed_amount + goal.monthly_contribution;

          // Ensure incrementedAmount does not exceed target_amount
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
          // Check if start_date exists and prevent going back before it
          if (goal.start_date && goal.currentMonth.isSame(goal.start_date, 'month')) {
            console.log("Reached the start date; cannot go back further.");
            return goal;
          }

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

            <div className='savings_goals_button'>
              <Button
                onClick={() => handleRemoveSavingsGoal(goal.id)}
                variant="outlined"
                color="secondary"
                style={{ marginTop: 8 }}
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
