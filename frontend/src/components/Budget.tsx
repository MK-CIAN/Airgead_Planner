// Budget.tsx
import React, { useState, useEffect } from 'react';
import Axios from './Axios';
import BudgetChart from "./charts/BudgetChart";
import BudgetForm from './forms/BudgetForm';
import { Button, IconButton, List, ListItem, ListItemText, Typography, useMediaQuery } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import dayjs, { Dayjs } from 'dayjs';
import { useTheme } from "@mui/material/styles";
import '../App.css';

interface BudgetData {
  id: number;
  value: number;
  label: string;
  type: string;
}

const Budget: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Mobile detection

  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs().startOf('month'));
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);

  // Function to get budget data
  const getBudgetData = (month: Dayjs) => {
    Axios.get(`data/budget/`, { params: { month: month.format('YYYY-MM') } })
      .then((response) => {
        console.log("Fetched budget data:", response.data); // Log the fetched data
        const formattedData: BudgetData[] = response.data.map((item: { id: number; amount: string; category: string; transaction_type: string }) => ({
          id: item.id, 
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
  
  // Fetch budget data when the component loads
  useEffect(() => {
    getBudgetData(currentMonth);
  }, [currentMonth]);
 
  // Montly navigation functions
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => prev.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => prev.add(1, 'month'));
  };

  //Function to add an item
  const handleAddBudget = (newItem: { amount: string; category: string; transaction_type: string }) => {
    const budgetItem = {
      amount: newItem.amount,
      category: newItem.category,
      transaction_type: newItem.transaction_type,
    };
  
    // Send POST request to backend to save the item
    Axios.post('data/budget/', budgetItem)
      .then((response) => {
        const savedItem = response.data;
  
        setBudgetData((prevData) => [
          ...prevData,
          {
            id: savedItem.id,
            value: parseFloat(savedItem.amount),
            label: savedItem.category,
            type: savedItem.transaction_type,
          },
        ]);
      })
      .catch((error) => {
        console.error("Error adding budget item:", error);
      });
  };
  
  // New function to remove an item
  const handleRemoveBudget = (id: number) => {
    Axios.delete(`data/budget/${id}/`)
      .then(() => {
        // Remove item from the frontend state only after successful deletion on the backend
        setBudgetData((prevData) => prevData.filter((item) => item.id !== id));
      })
      .catch((error) => {
        console.error("Error removing budget item:", error);
      });
  };

  return (
    <div style={{ padding: "0 16px" }}>
    <Typography variant="h4" align="center" style={{ marginBottom: 16, fontSize: isMobile ? "1.5rem" : "2rem" }}>
      Monthly Budget
    </Typography>

    {/* Month Navigation */}
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <IconButton onClick={() => setCurrentMonth((prev) => prev.subtract(1, "month"))}>
        <ArrowBackIosIcon />
      </IconButton>
      <Typography variant="h6">{currentMonth.format("MMMM YYYY")}</Typography>
      <IconButton onClick={() => setCurrentMonth((prev) => prev.add(1, "month"))}>
        <ArrowForwardIosIcon />
      </IconButton>
    </div>

    {/* Responsive Layout */}
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: "16px",
        marginTop: "20px",
      }}
    >
      {/* Budget Form */}
      <div style={{ flex: "1", background: "#f5f5f5", padding: "16px", borderRadius: "8px" }}>
        <BudgetForm onAddBudget={handleAddBudget} month={currentMonth} />
      </div>

      {/* Budget List */}
      <div style={{ flex: "1", overflowY: "auto", maxHeight: "300px", border: "1px solid #ddd", borderRadius: "8px", padding: "8px" }}>
        <Typography variant="h6" style={{ marginBottom: "8px" }}>
          Budget Items
        </Typography>
        <List>
          {budgetData.map((item) => (
            <ListItem key={item.id} style={{ display: "flex", justifyContent: "space-between" }}>
              <ListItemText primary={`${item.label} - €${item.value.toFixed(2)} (${item.type})`} />
              <Button variant="outlined" color="secondary" size="small" onClick={() => handleRemoveBudget(item.id)}>
                Remove
              </Button>
            </ListItem>
          ))}
        </List>
      </div>
    </div>

    {/* Responsive Budget Chart */}
    <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
      <BudgetChart data={budgetData} />
    </div>
  </div>
  );
};

export default Budget;
