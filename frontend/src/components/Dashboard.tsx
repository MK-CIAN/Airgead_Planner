import { useState, useEffect } from "react";
import Axios from "./Axios";
import SavingsChart from "./charts/TestSavingsChart";
import "../App.css";
import { Box, Grid, Paper, Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import TestBudgetChart from "./charts/TestBudgetChart";

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
  const [currentMonth] = useState<Dayjs>(dayjs().startOf("month"));
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [savingsData, setSavingsData] = useState<SavingsGoalData[]>([]);
  const [, setLoading] = useState<boolean>(true);

  //Getting budget data from user to display on the dashboard
  const fetchMonthlyBudget = async (month: Dayjs) => {
    setLoading(true);
    try {
      console.log(`Fetching budget for: ${month.format("YYYY-MM")}`);
      const response = await Axios.get("data/budget/", {
        params: { month: month.format("YYYY-MM") },
      });

      if (response.data.length > 0) {
        const budget = response.data[0]; // Assume one budget per user per month

        console.log("Budget found:", budget);

        // Ensure items are mapped correctly
        const formattedData: BudgetData[] = budget.items
          ? budget.items.map((item: any) => ({
              id: item.id,
              value: parseFloat(item.amount),
              label: item.category || "Unknown",
              type: item.transaction_type || "expense",
            }))
          : [];

        setBudgetData(formattedData);
      } else {
        console.log("No budget found for this month.");
        setBudgetData([]); // Ensure state is reset if no budget exists
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
    } finally {
      setLoading(false);
    }
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
    fetchMonthlyBudget(currentMonth);
    getSavingsData();
  }, [currentMonth]);

  // Get the first savings goal if available
  const firstSavingsGoal = savingsData.length > 0 ? savingsData[0] : null;

  return (
    <div className="container">
      <Typography variant="h4" gutterBottom>
        Your Financial Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Budget Chart Widget */}
        <Grid
          item
          xs={12}
          md={6}
          onClick={() => (window.location.href = "/budget")}
        >
          <Paper elevation={3} style={{ padding: "16px", height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Monthly Budget
            </Typography>
            <TestBudgetChart data={budgetData} />
          </Paper>
        </Grid>

        {/* Savings Goal Widget */}
        <Grid
          item
          xs={12}
          md={6}
          onClick={() => (window.location.href = "/savings")}
        >
          <Paper elevation={3} style={{ padding: "16px", height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Savings Goal
            </Typography>
            {firstSavingsGoal ? (
              <Box>
                <Typography variant="subtitle1" align="center">
                  {firstSavingsGoal.name}
                </Typography>
                <Typography variant="body2" align="center" gutterBottom>
                  €{firstSavingsGoal.current_amount.toFixed(2)} / €
                  {firstSavingsGoal.target_amount.toFixed(2)}
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
