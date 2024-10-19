import { useState, useEffect } from 'react';
import Axios from './Axios';
import BudgetChart from "./charts/BudgetChart";

interface BudgetItem {
  value: number;
  label: string;
}

const Budget: React.FC = () => {
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);

  const getBudgetData = () => {
    Axios.get('budget/')
      .then((response) => {
        // Format the budget data into a structure for the chart
        const formattedData = response.data.map((item: { amount: string; category: string }) => ({
          value: parseFloat(item.amount),
          label: item.category,
        }));
        setBudgetData(formattedData);
      })
      .catch((error) => {
        console.error("Error fetching budget data:", error);
      });
  };

  useEffect(() => {
    getBudgetData();
  }, []);

  return (
    <div>
      <h1>Monthly Budget</h1>
      <BudgetChart data={budgetData} />
    </div>
  );
};

export default Budget;