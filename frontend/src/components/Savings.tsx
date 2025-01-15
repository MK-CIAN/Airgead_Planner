// Savings.tsx
import React, { useState, useEffect } from "react";
import Axios from "./Axios";
import SavingsChart from "./charts/SavingsChart";
import SavingsForm from "./forms/SavingsForms";
import { Button, Typography, IconButton, useMediaQuery } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import dayjs, { Dayjs } from "dayjs";
import "../App.css";
import "../styles/Savings.css";
import { useNavigate } from "react-router-dom";

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

  const isMobile = useMediaQuery("(max-width: 480px)"); // Check if the screen size is less than 480px
  const isTablet = useMediaQuery("(max-width: 768px)"); // Check if the screen size is less than 768px
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
          currentMonth: dayjs().startOf("month"),
          start_date: goal.start_date ? dayjs(goal.start_date) : null, 
          target_date: goal.target_date ? dayjs(goal.target_date) : null,
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

  const handleAddSavingsGoal = (newGoal: {
    name: string;
    target_amount: number;
    current_amount: number;
    monthly_contribution: number;
    target_date?: string | null;
    start_date?: string | null;
  }) => {
    Axios.post(`data/savings/`, newGoal)
      .then((response) => {
        const savedGoal: SavingsGoalData = {
          ...response.data,
          progress:
            (response.data.current_amount / response.data.target_amount) * 100,
          displayed_amount: response.data.current_amount,
          currentMonth: dayjs().startOf("month"),
          start_date: response.data.start_date
            ? dayjs(response.data.start_date)
            : null,
          target_date: response.data.target_date
            ? dayjs(response.data.target_date)
            : null,
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

  // Updated handleNextMonth function
  const handleNextMonth = (id: string) => {
    setSavingsData((prevData) =>
      prevData.map((goal) => {
        if (goal.id === id) {
          const today = dayjs().startOf("month"); 
          const newMonth = goal.currentMonth.add(1, "month");

          // Stop forward navigation if displayed_amount has reached or is more then target_amount
          if (goal.displayed_amount >= goal.target_amount) {
            console.log("Target amount reached; forward navigation stopped.");
            return goal;
          }


          // Allow navigation but prevent incrementing displayed_amount if the month is in the past
          if (newMonth.isBefore(today, "month")) {
            console.log(
              "Navigating to a past month; amount will not be incremented."
            );
            return {
              ...goal,
              currentMonth: newMonth,
            };
          }

          // If month is current or future, increment displayed_amount
          const incrementedAmount =
            goal.displayed_amount + goal.monthly_contribution;
          const newDisplayedAmount = Math.min(
            incrementedAmount,
            goal.target_amount
          );

          console.log(
            `Next Month for Goal ${id}: Incremented Amount = ${incrementedAmount}, New Displayed Amount = ${newDisplayedAmount}`
          );

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
    setSavingsData((prevData) =>
      prevData.map((goal) => {
        if (goal.id === id) {
          // Check if start_date exists
          if (
            goal.start_date &&
            goal.currentMonth.isSame(goal.start_date, "month")
          ) {
            console.log("Reached the start date; cannot go back further.");
            return goal;
          }

          const newMonth = goal.currentMonth.subtract(1, "month");
          const decrementedAmount =
            goal.displayed_amount - goal.monthly_contribution;
          const newDisplayedAmount = Math.max(
            decrementedAmount,
            goal.current_amount
          );

          console.log(
            `Previous Month for Goal ${id}: Decremented Amount = ${decrementedAmount}, New Displayed Amount = ${newDisplayedAmount}`
          );

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
      <h1 style={{ fontSize: isMobile ? "1.5rem" : isTablet ? "1.8rem" : "2rem" }}>Savings</h1>

      {/* Toggle Button for Savings Form */}
      <div className="savings-submit">
        <Button
          variant="contained"
          color="primary"
          onClick={toggleFormVisibility}
          style={{
            fontSize: isMobile ? "0.8rem" : "1rem", // Adjust button font size
            padding: isMobile ? "8px 12px" : "10px 20px",
          }}
        >
          {isFormVisible ? "Hide Form" : "Add Savings Goal"}
        </Button>
      </div>

      {/* Conditionally Rendering Savings Form */}
      {isFormVisible && (
        <div style={{ marginTop: "16px" }}>
          <SavingsForm onAddSavingsGoal={handleAddSavingsGoal} />
        </div>
      )}

      <Typography
        variant="h6"
        className="savings-title"
        style={{ fontSize: isMobile ? "1rem" : isTablet ? "1.2rem" : "1.5rem" }}
      >
        Your Savings Goals
      </Typography>

      {/* List of Savings Goals */}
      <div className="savings-grid">
        {savingsData.map((goal) => (
          <div
            key={goal.id}
            className="savings-item"
            onClick={() => navigate(`/savings/${goal.id}`)}
            style={{
              padding: isMobile ? "12px" : "16px", // Adjust padding based on screen size
            }}
          >
            <Typography
              variant={isMobile ? "body2" : "subtitle1"}
              align="center"
              style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
            >
              {goal.name} - €{Number(goal.displayed_amount).toFixed(2)} / €
              {Number(goal.target_amount).toFixed(2)}
            </Typography>

            {/* Month Navigation Arrows */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: isMobile ? "4px" : "8px",
              }}
            >
              <IconButton
                onClick={() => handlePreviousMonth(goal.id)}
                size={isMobile ? "small" : "medium"} // Adjust icon size
              >
                <ArrowBackIosIcon />
              </IconButton>
              <Typography variant="body2" style={{ fontSize: isMobile ? "0.8rem" : "1rem" }}>
                {goal.currentMonth.format("MMMM YYYY")}
              </Typography>
              <IconButton
                onClick={() => handleNextMonth(goal.id)}
                size={isMobile ? "small" : "medium"} // Adjust icon size
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </div>

            {/* Savings Chart */}
            <SavingsChart
              progress={(goal.displayed_amount / goal.target_amount) * 100}
            />

            <div className="savings_goals_button">
              <Button
                onClick={() => handleRemoveSavingsGoal(goal.id)}
                variant="outlined"
                color="secondary"
                style={{
                  fontSize: isMobile ? "0.7rem" : "0.9rem", // Adjust button font size
                  marginTop: isMobile ? "4px" : "8px",
                }}
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
