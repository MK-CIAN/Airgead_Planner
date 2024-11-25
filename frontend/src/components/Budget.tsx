// Budget.tsx
import React, { useState, useEffect } from 'react';
import Axios from './Axios';
import BudgetChart from "./charts/BudgetChart";
import BudgetForm from './forms/BudgetForm';
import { Button, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import dayjs, { Dayjs } from 'dayjs';
import '../App.css';

interface BudgetData {
  id: number;
  value: number;
  label: string;
  type: string;
}

const Budget: React.FC = () => {
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
    // Prepare the data to send to the backend
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

      {/* Side-by-side container */}
      <div className="budget-container">
        {/* Budget Form */}
        <div className="budget-form">
          <BudgetForm onAddBudget={handleAddBudget} month={currentMonth} />
        </div>

        {/* List of Budget Items */}
        <div className="budget-list">
          {budgetData.length > 0 ? (
            <>
              <Typography variant="h6" style={{ marginTop: '20px' }}>Budget Items</Typography>
              <List>
                {budgetData.map(item => (
                  <ListItem key={item.id}>
                    <ListItemText primary={`${item.label} - $${item.value.toFixed(2)} (${item.type})`} />
                    <Button onClick={() => handleRemoveBudget(item.id)}>
                      Remove
                    </Button>
                  </ListItem>
                ))}
              </List>
            </>
          ) : null}
        </div>
      </div>
      {/* Budget Chart */}
      <BudgetChart data={budgetData} />
    </div>
  );
};

export default Budget;
