// Budget.tsx
import React, { useState, useEffect } from 'react';
import Axios from './Axios';
import BudgetChart from "./charts/BudgetChart";
import BudgetForm from './forms/BudgetForm';
import { Button, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import dayjs, { Dayjs } from 'dayjs';

interface BudgetData {
  id: number;
  value: number;
  label: string;
  type: string;
}

const Budget: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs().startOf('month'));
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);

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
  

  useEffect(() => {
    getBudgetData(currentMonth);
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => prev.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => prev.add(1, 'month'));
  };

  const handleAddBudget = (newItem: { amount: string; category: string; transaction_type: string }) => {
    const newBudgetData: BudgetData = {
      id: Math.floor(Math.random() * 1000000), // Generate a unique numeric ID for simplicity
      value: parseFloat(newItem.amount),
      label: newItem.category,
      type: newItem.transaction_type,
    };
    setBudgetData(prevData => [...prevData, newBudgetData]);
  };
  
  // New function to remove an item
  const handleRemoveBudget = (id: number) => {
    console.log("Attempting to remove budget item with ID:", id);
    if (id !== undefined) {
      Axios.delete(`data/budget/${id}/`)  // Ensure this URL is correct
        .then(() => {
          setBudgetData(prevData => prevData.filter(item => item.id !== id));
        })
        .catch((error) => {
          console.error("Error removing budget item:", error);
        });
    } else {
      console.error("Cannot remove budget item: ID is undefined.");
    }
  };
  return (
    <div>
      <h1>Monthly Budget</h1>

      {/* Month Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <IconButton onClick={handlePreviousMonth}>
          <ArrowBackIosIcon />
        </IconButton>
        <Typography variant="h6">
          {currentMonth.format('MMMM YYYY')}
        </Typography>
        <IconButton onClick={handleNextMonth}>
          <ArrowForwardIosIcon />
        </IconButton>
      </div>

      {/* Budget Form */}
      <BudgetForm onAddBudget={handleAddBudget} month={currentMonth} />

      {/* Budget Chart */}
      <BudgetChart data={budgetData} />

      {/* List of Budget Items */}
      {budgetData.length > 0 ? (
        <>
          <Typography variant="h6" style={{ marginTop: '20px' }}>Budget Items</Typography>
          <List>
            {budgetData.map(item => (
              <ListItem key={item.id}>
                <ListItemText primary={`${item.label} - $${item.value.toFixed(2)} (${item.type})`} />
                <Button variant="outlined" color="secondary" onClick={() => handleRemoveBudget(item.id)}>
                  Remove
                </Button>
              </ListItem>
            ))}
          </List>
        </>
      ) : null}
    </div>
  );
};

export default Budget;
