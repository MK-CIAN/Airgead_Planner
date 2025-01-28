import React, { useState, useEffect } from "react";
import Axios from "../Axios";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import TestBudgetChart from "../charts/TestBudgetChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

interface CustomBudget {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  items: { id: number; value: number; label: string; type: string }[];
}

interface BudgetData {
  id: number;
  value: number;
  label: string;
  type: string;
}

const MainBudgetPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(
    dayjs().startOf("month")
  );
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [customBudgets, setCustomBudgets] = useState<CustomBudget[]>([]);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const fetchMonthlyBudget = (month: Dayjs) => {
    Axios.get(`data/budget/`, { params: { month: month.format("YYYY-MM") } })
      .then((response) => {
        console.log("Fetched budget data:", response.data); // Debugging API response
        if (response.data.length === 0) {
          console.warn("No budget data available");
        }

        const formattedData: BudgetData[] = response.data.map((item: any) => ({
          id: item.id,
          value: parseFloat(item.amount) || 0,
          label: item.category || "Unknown",
          type: item.transaction_type || "expense",
        }));

        setBudgetData(formattedData);
        console.log("Processed budgetData:", formattedData);
      })
      .catch((error) => {
        console.error("Error fetching budget data:", error);
      });
  };

  const fetchCustomBudgets = () => {
    Axios.get("data/custom-budget/")
      .then((response) => {
        console.log("Fetched custom budgets:", response.data);

        // Validate items structure before setting state
        const formattedBudgets = response.data.map((budget: any) => ({
          ...budget,
          items: budget.items.map((item: any) => ({
            id: item.id,
            value: parseFloat(item.amount) || 0,
            label: item.category || "Unknown",
            type: item.transaction_type || "expense",
          })),
        }));

        setCustomBudgets(formattedBudgets);
        console.log("Processed custom budgets:", formattedBudgets);
      })
      .catch((error) => console.error("Error fetching custom budgets:", error));
  };

  useEffect(() => {
    fetchMonthlyBudget(currentMonth);
    fetchCustomBudgets();
  }, [currentMonth]);

  useEffect(() => {
    console.log("Processed budgetData:", budgetData); // Debugging output
  }, [budgetData]);

  // Create New Custom Budget
  const handleCreateCustomBudget = () => {
    if (!name.trim() || !startDate || !endDate) {
      alert("All fields are required to create a budget.");
      return;
    }

    const payload = {
      name,
      start_date: startDate.format("YYYY-MM-DD"),
      end_date: endDate.format("YYYY-MM-DD"),
    };

    Axios.post("data/custom-budget/", payload)
      .then(() => {
        fetchCustomBudgets();
        setName("");
        setStartDate(null);
        setEndDate(null);
      })
      .catch((error) => console.error("Error creating budget:", error));
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <h2 className="text-center text-2xl font-bold">Budgets Overview</h2>
      {/* Custom Budget Form - Toggle */}
      <div className="text-center">
        <Button
          className="bg-green-500 text-white"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Hide Form" : "Create New Custom Budget"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 mt-4">
          <CardHeader>
            <CardTitle>Create a New Custom Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="budget-name">Budget Name</Label>
              <Input
                id="budget-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter budget name"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate ? startDate.format("YYYY-MM-DD") : ""}
                  onChange={(e) => setStartDate(dayjs(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate ? endDate.format("YYYY-MM-DD") : ""}
                  onChange={(e) => setEndDate(dayjs(e.target.value))}
                />
              </div>
            </div>
            <Button
              className="w-full bg-green-500 text-white"
              onClick={handleCreateCustomBudget}
            >
              Create Budget
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Budgets Display - Side by Side Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <h2 className="text-center text-2xl font-bold">Your Monthly Budgets</h2>
      <h2 className="text-center text-2xl font-bold">Your Custom Budgets</h2>
        {/* Monthly Budget Section */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/monthly-budget")}
        >
          <CardHeader>
          <CardTitle>{currentMonth.format("MMMM YYYY")} Budget</CardTitle>
          <CardDescription>test description</CardDescription>
          </CardHeader>
          <CardContent>
              <TestBudgetChart
              data={budgetData}
              showTitle={false}
              useCard={false}
            />
          </CardContent>
        </Card>

        {/* Custom Budgets - Carousel */}
            {customBudgets.length > 0 ? (

              <Carousel>
                <CarouselContent>
                  {customBudgets.map((budget) => (
                    <CarouselItem key={budget.id}>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/custom-budget/${budget.id}`)}>
                        <CardHeader>
                          <CardTitle>{budget.name}</CardTitle>
                          <CardDescription>
                            {budget.start_date} - {budget.end_date}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {budget.items.length > 0 ? (
                            <TestBudgetChart
                              data={budget.items}
                              showTitle={false}
                              useCard={false}
                            />
                          ) : (
                            <p className="text-center text-gray-500">
                              No data available
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <p className="text-center text-gray-500">
                No custom budgets available
              </p>
            )}
      </div>
    </div>
  );
};

export default MainBudgetPage;
