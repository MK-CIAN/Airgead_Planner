import React, { useState, useEffect } from "react";
import Axios from "../Axios";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import TestBudgetChart from "../charts/TestBudgetChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
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
  const [currentMonth] = useState<Dayjs>(dayjs().startOf("month"));
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [customBudgets, setCustomBudgets] = useState<CustomBudget[]>([]);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

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

  if (loading) {
    return <h1 className="center">Loading...</h1>;
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <h2 className="text-center text-2xl font-bold">Budgets Overview</h2>
      {/* Custom Budget Form - Toggle */}
      <div className="text-center">
        <Button
          className="bg-green-500 hover:bg-green-600 text-white"
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full text-left">
                      {startDate
                        ? format(startDate.toDate(), "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={startDate ? startDate.toDate() : undefined}
                      onSelect={(date) => setStartDate(dayjs(date))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
              <Label htmlFor="start-date">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full text-left">
                      {endDate
                        ? format(endDate.toDate(), "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={endDate ? endDate.toDate() : undefined}
                      onSelect={(date) => setEndDate(dayjs(date))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white"
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
          <Carousel className="cursor-pointer hover:shadow-md transition-shadow relative">
            <CarouselContent>
              {customBudgets.map((budget) => (
                <CarouselItem key={budget.id}>
                  <Card onClick={() => navigate(`/custom-budget/${budget.id}`)}>
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
            <CarouselPrevious className="absolute left-[-1px] top-1/2 transform -translate-y-1/2" />
            <CarouselNext className="absolute right-[-1px] top-1/2 transform -translate-y-1/2" />
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
