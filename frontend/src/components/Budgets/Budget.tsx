import React, { useState, useEffect } from "react";
import Axios from "../Axios";
import TestBudgetChart from "../charts/TestBudgetChart";
import BudgetForm from "../forms/BudgetForm";
import { Button } from "@/components/ui/button";
import { Typography, List, ListItem, Icon } from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import dayjs, { Dayjs } from "dayjs";

interface BudgetData {
  id: number;
  value: number;
  label: string;
  type: string;
}

const Budget: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(
    dayjs().startOf("month")
  );
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);

  // Function to get budget data
  const getBudgetData = (month: Dayjs) => {
    Axios.get(`data/budget/`, { params: { month: month.format("YYYY-MM") } })
      .then((response) => {
        const formattedData: BudgetData[] = response.data.map(
          (item: {
            id: number;
            amount: string;
            category: string;
            transaction_type: string;
          }) => ({
            id: item.id,
            value: parseFloat(item.amount),
            label: item.category,
            type: item.transaction_type,
          })
        );
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

  // Monthly navigation functions
  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => prev.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => prev.add(1, "month"));
  };

  // Function to add an item
  const handleAddBudget = (newItem: {
    amount: string;
    category: string;
    transaction_type: string;
  }) => {
    const budgetItem = {
      amount: newItem.amount,
      category: newItem.category,
      transaction_type: newItem.transaction_type,
    };

    Axios.post("data/budget/", budgetItem)
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

  // Function to remove an item
  const handleRemoveBudget = (id: number) => {
    Axios.delete(`data/budget/${id}/`)
      .then(() => {
        setBudgetData((prevData) => prevData.filter((item) => item.id !== id));
      })
      .catch((error) => {
        console.error("Error removing budget item:", error);
      });
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <Typography
        variant="h4"
        align="center"
        className="mb-4 text-xl md:text-2xl"
      >
        Monthly Budget
      </Typography>

      {/* Month Navigation */}
      <div className="flex justify-center items-center gap-2 mb-4">
        <Button onClick={handlePreviousMonth} variant="ghost">
          <Icon component="span" className="material-icons">
            {"<-"}
          </Icon>
        </Button>
        <Typography variant="h6">{currentMonth.format("MMMM YYYY")}</Typography>
        <Button onClick={handleNextMonth} variant="ghost">
          <Icon component="span" className="material-icons">
            {"->"}
          </Icon>
        </Button>
      </div>

      {/* Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {/* Budget Form */}
        <Card className="bg-gray-50 p-4 rounded-md">
          <BudgetForm onAddBudget={handleAddBudget} month={currentMonth} />
        </Card>

        {/* Budget List */}
        <Card className="overflow-y-auto max-h-[350px] border p-4">
          <Typography variant="h6" className="mb-2">
            Budget Items
          </Typography>
          <div className="max-h-[250px]">
            <Table className="table-auto w-full text-sm">
              <TableHead>
                <TableRow>
                  <TableCell className="text-left px-2 py-1">
                    Category
                  </TableCell>
                  <TableCell className="text-right px-2 py-1">Amount</TableCell>
                  <TableCell className="text-left px-2 py-1">Type</TableCell>
                  <TableCell className="text-center px-2 py-1">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {budgetData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-100">
                    <TableCell className="text-left px-2 py-1 truncate max-w-[100px]">
                      {item.label}
                    </TableCell>
                    <TableCell className="text-right px-2 py-1">
                      €{item.value.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={`text-left px-2 py-1 capitalize ${
                        item.type === "income"
                          ? "text-green-600"
                          : item.type === "debt"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {item.type}
                    </TableCell>
                    <TableCell className="text-center px-2 py-1">
                      <Button
                        className="bg-red-600 text-white text-xs px-2 py-1"
                        size="sm"
                        onClick={() => handleRemoveBudget(item.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Budget Chart */}
      <div className="mt-5 flex justify-center">
        <TestBudgetChart data={budgetData} />
      </div>
    </div>
  );
};

export default Budget;
