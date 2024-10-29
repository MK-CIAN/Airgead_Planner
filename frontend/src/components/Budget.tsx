// Budget.tsx
import React, { useState, useEffect } from 'react';
import Axios from './Axios';
import BudgetChart from "./charts/BudgetChart";
import BudgetForm from './forms/BudgetForm';
import { IconButton, Typography } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import dayjs, { Dayjs } from 'dayjs';

interface BudgetData {
  value: number;
  label: string;
  transaction_type: string;
}

const Budget: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs().startOf('month'));
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);

  const getBudgetData = (month: Dayjs) => {
    Axios.get(`data/budget/`, { params: { month: month.format('YYYY-MM') } })
      .then((response) => {
        const formattedData: BudgetData[] = response.data.map((item: { amount: string; category: string; transaction_type: string}) => ({
          value: parseFloat(item.amount),
          label: item.category,
          transaction_type: item.transaction_type,
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
    setBudgetData(prevData => [
      ...prevData,
      { value: parseFloat(newItem.amount), label: newItem.category, transaction_type: newItem.transaction_type }, // Add transaction type here
    ]);
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
    </div>
  );
};

export default Budget;
