import React, { useState, useEffect } from 'react';
import Axios from './Axios';
import BudgetChart from './charts/BudgetChart';
import SavingsChart from './charts/SavingsChart';
import "../App.css";
import { Box, Grid, LinearProgress, Paper, Typography } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';

interface BudgetData {
  id: number;
  value: number;
  label: string;
  type: string;
}

interface SavingsGoalData {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  progress: number;
}

const Dashboard = () => {
  const [currentMonth] = useState<Dayjs>(dayjs().startOf('month'));
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [savingsData, setSavingsData] = useState<SavingsGoalData[]>([]);

  const getBudgetData = (month: Dayjs) => {
    Axios.get(`data/budget/`, { params: { month: month.format('YYYY-MM') } })
      .then((response) => {
        console.log("Fetched budget data:", response.data); // Log the fetched data
        const formattedData: BudgetData[] = response.data.map((item: { id: number; amount: string; category: string; transaction_type: string }) => ({
          id: item.id,  // Ensure you extract the ID from the response
          value: parseFloat(item.amount),
          label: item.category,
          type: item.transaction_type,
        }));
        setBudgetData(formattedData);
      })
      .catch((error) => {
        console.error("Error fetching budget data:", error);
      });
  };
  

  const getSavingsData = () => {
    Axios.get(`data/savings`)
      .then((response) => {
        const formattedData = response.data.map((goal: any) => ({
          id: goal.id,
          name: goal.name,
          target_amount: Number(goal.target_amount),
          current_amount: Number(goal.current_amount),
          progress: (goal.current_amount / goal.target_amount) * 100,
        }));
        setSavingsData(formattedData);
      })
      .catch((error) => {
        console.error("Error fetching savings goals:", error);
      });
  };

  useEffect(() => {
    getBudgetData(currentMonth);
    getSavingsData();
  }, [currentMonth]);

  // Get the first savings goal if available
  const firstSavingsGoal = savingsData.length > 0 ? savingsData[0] : null;

  return (
    <div className="container">
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Budget Chart Widget */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '16px', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Monthly Budget
            </Typography>
            <BudgetChart data={budgetData} />
          </Paper>
        </Grid>

        {/* Savings Goal Widget */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '16px', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Savings Goal
            </Typography>
            {firstSavingsGoal ? (
              <Box>
                <Typography variant="subtitle1" align="center">
                  {firstSavingsGoal.name}
                </Typography>
                <Typography variant="body2" align="center" gutterBottom>
                  €{firstSavingsGoal.current_amount.toFixed(2)} / €{firstSavingsGoal.target_amount.toFixed(2)}
                </Typography>
                <SavingsChart progress={firstSavingsGoal.progress} />
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No savings goals available.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
