import React, { useState, useEffect } from "react";
import Axios from "../Axios";
import TestBudgetChart from "../charts/BudgetChart";
import BudgetRadarChart from "./BudgetRadarChart";
import BudgetForm from "../forms/BudgetForm";
import { Button } from "@/components/ui/button";
import { Typography, Icon } from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import dayjs, { Dayjs } from "dayjs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import FinancialSuggestions from "../FinancialSuggestions";
import FeatureTooltip from "../ui/featureTooltip";

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
  const [budgetId, setBudgetId] = useState<number | null>(null); // Store Monthly Budget ID
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch budget data for the selected month
  const fetchBudgetData = async (month: Dayjs) => {
    setLoading(true);
    const formattedMonth = month.format("YYYY-MM-DD"); // Ensure correct format

    try {
      console.log(`Fetching budget for: ${formattedMonth}`);
      const response = await Axios.get("data/budget/", {
        params: { month: formattedMonth },
      });

      if (response.data.length > 0) {
        const budget = response.data[0];
        setBudgetId(budget.id);
        console.log(`Budget found: ${budget.id}`);

        const formattedData: BudgetData[] = (budget.items || []).map(
          (item: any) => ({
            id: item.id,
            value: parseFloat(item.amount),
            label: item.category,
            type: item.transaction_type,
          })
        );
        setBudgetData(formattedData);
      } else {
        console.log("No budget found for this month. Creating a new one...");
        const budgetResponse = await Axios.post("data/budget/", {
          month: formattedMonth,
        }); // Corrected format
        const newBudgetId = budgetResponse.data.id;
        setBudgetId(newBudgetId);
        console.log(`New budget created: ${newBudgetId}`);

        setBudgetData([]);
      }
    } catch (error) {
      console.error("Error fetching budget data:");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData(currentMonth);
  }, [currentMonth]);

  // Navigation between months
  const handlePreviousMonth = () =>
    setCurrentMonth((prev) => prev.subtract(1, "month"));
  const handleNextMonth = () => setCurrentMonth((prev) => prev.add(1, "month"));

  // Function to add a budget item
  const handleAddBudgetItem = async (newItem: {
    amount: string;
    category: string;
    transaction_type: string;
  }) => {
    if (!newItem.amount || !newItem.category || !newItem.transaction_type) {
      return;
    }

    if (!budgetId) {
      console.error("No budget available to add items to.");
      return;
    }

    try {
      const itemData = {
        amount: parseFloat(newItem.amount),
        category: newItem.category.trim(),
        transaction_type: newItem.transaction_type.trim(),
      };

      // Add the item to the budget
      const itemResponse = await Axios.post(
        `data/budget/${budgetId}/items/`,
        itemData
      );

      // Update UI
      setBudgetData((prevData) => [
        ...prevData,
        {
          id: itemResponse.data.id,
          value: parseFloat(itemResponse.data.amount),
          label: itemResponse.data.category,
          type: itemResponse.data.transaction_type,
        },
      ]);
    } catch (error) {
      console.error("Error adding budget item:", error);
    }
  };

  // Function to remove a budget item
  const handleRemoveBudgetItem = async (itemId: number) => {
    if (!budgetId) return;
    try {
      console.log(`Removing item ${itemId} from budget ${budgetId}`);
  
      // ✅ Wait for API response before updating UI
      await Axios.delete(`data/budget/${budgetId}/items/${itemId}/`);
  
      // ✅ Fetch updated budget data instead of relying on local state
      const response = await Axios.get(`data/budget/`, {
        params: { month: currentMonth.format("YYYY-MM-DD") },
      });
  
      if (response.data.length > 0) {
        const budget = response.data[0];
        const formattedData: BudgetData[] = (budget.items || []).map((item: any) => ({
          id: item.id,
          value: parseFloat(item.amount),
          label: item.category,
          type: item.transaction_type,
        }));
        setBudgetData(formattedData);
      } else {
        setBudgetData([]);
      }
  
      console.log("Budget item removed and UI updated.");
    } catch (error) {
      console.error("Error removing budget item:", error);
    }
  };
  

  if (loading) {
    return <Typography align="center">Loading...</Typography>;
  }

  return (
    <div className="p-4 max-w-8xl mx-auto">
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
        <Typography variant="h6">
          {currentMonth.format("YYYY-MM-DD")}
        </Typography>
        <Button onClick={handleNextMonth} variant="ghost">
          <Icon component="span" className="material-icons">
            {"->"}
          </Icon>
        </Button>
      </div>

      <div className="justify-center">
        <FinancialSuggestions />
      </div>

      {/* Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {/* Budget Form */}
        <FeatureTooltip content="Add new budget items">
        <Card className="bg-gray-50 p-4 rounded-md">
          <BudgetForm onAddBudget={handleAddBudgetItem} />
        </Card>
        </FeatureTooltip>

        {/* Budget List */}
        <FeatureTooltip content="A list of your budget items.">
        <Card className="overflow-y-auto max-h-[350px] border p-4">
          <Typography variant="h6" className="mb-2">
            Budget Items
          </Typography>
          <div className="max-h-[250px]">
            <Table className="table-auto w-full text-sm">
              <TableHeader>
                <TableRow className="h-6">
                  {" "}
                  {/* Reduce row height */}
                  <TableHead className="text-left w-1/4 px-2 py-1">
                    Category
                  </TableHead>
                  <TableHead className="text-right w-1/4 px-2 py-1">
                    Amount (€)
                  </TableHead>
                  <TableHead className="text-right w-1/4 px-2 py-1">
                    Type
                  </TableHead>
                  <TableHead className="text-right w-1/4 px-2 py-1">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetData.length > 0 ? (
                  budgetData.map((item) => (
                    <TableRow key={item.id} data-testid="budget-item"className="hover:bg-gray-100 h-6">
                      <TableCell className="text-left px-2 py-1">
                        {item.label}
                      </TableCell>
                      <TableCell className="text-right px-2 py-1">
                        €{item.value.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={`text-right px-2 py-1 capitalize ${
                          item.type === "income"
                            ? "text-green-600"
                            : item.type === "debt"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {item.type}
                      </TableCell>
                      {/* Fix alignment issue */}
                      <TableCell className="text-right px-2 py-1">
                        <div className="flex justify-end">
                          <Button
                            className="bg-red-600 text-white text-xs px-3 py-1"
                            data-testid="remove-budget-button"
                            size="sm"
                            onClick={() => handleRemoveBudgetItem(item.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="h-6">
                    <TableCell
                      colSpan={4}
                      className="text-center text-gray-500 px-2 py-1"
                    >
                      No budget items available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
        </FeatureTooltip>
      </div>

      {/* Budget Charts */}
      <div className="mt-5 flex justify-center">
      <FeatureTooltip content="Visualizations of your budget data and expenditures spread">
        <Carousel>
          <CarouselContent>
            <CarouselItem>
              <TestBudgetChart data={budgetData} />
            </CarouselItem>
            <CarouselItem>
              <BudgetRadarChart budgetData={budgetData} />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        </FeatureTooltip>
      </div>
    </div>
  );
};

export default Budget;
