import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import Axios from "../components/Axios";
import SavingsChart from "../components/charts/TestSavingsChart";
import BudgetChart from "../components/charts/TestBudgetChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import dayjs, { Dayjs } from "dayjs";
import TestBudgetChart from "../components/charts/TestBudgetChart";

interface BudgetData {
  id: number;
  value: number;
  label: string;
  type: string;
}

interface SavingsGoalData {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  progress: number;
  contributions: { id: string; amount: number; contribution_date: string }[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentMonth] = useState<Dayjs>(dayjs().startOf("month"));
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [savingsData, setSavingsData] = useState<SavingsGoalData[]>([]);
  const [, setLoading] = useState<boolean>(true);

  // Fetch Monthly Budget Data
  const fetchMonthlyBudget = async (month: Dayjs) => {
    setLoading(true);
    try {
      const response = await Axios.get("data/budget/", {
        params: { month: month.format("YYYY-MM") },
      });

      if (response.data.length > 0) {
        const budget = response.data[0];
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
        setBudgetData([]);
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Savings Data with Contributions
  const getSavingsData = () => {
    Axios.get(`data/savings`)
      .then((response) => {
        const formattedData = response.data.map((goal: any) => ({
          id: goal.id,
          name: goal.name,
          target_amount: Number(goal.target_amount),
          current_amount: Number(goal.current_amount),
          progress: (goal.current_amount / goal.target_amount) * 100,
          contributions: goal.contributions || [],
        }));
        setSavingsData(formattedData);
      })
      .catch((error) => {
        console.error("Error fetching savings goals:", error);
      });
  };

  useEffect(() => {
    fetchMonthlyBudget(currentMonth);
    getSavingsData();
  }, [currentMonth]);

  const firstSavingsGoal = savingsData.length > 0 ? savingsData[0] : null;

  // Get latest contribution
  const latestContribution = firstSavingsGoal?.contributions?.length
    ? firstSavingsGoal.contributions.sort(
        (a, b) =>
          new Date(b.contribution_date).getTime() -
          new Date(a.contribution_date).getTime()
      )[0]
    : null;

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-center">
        Your Financial Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Budget Chart Widget */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          data-testid="monthly-budget-card"
          onClick={() => navigate("/budget/monthly-budget")}
        >
          <CardHeader>
            <CardTitle>{currentMonth.format("MMMM YYYY")} Budget</CardTitle>
            <CardDescription>Your Budget For This Month</CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetChart
              data={budgetData}
              showTitle={false}
              useCard={false}
            />
          </CardContent>
        </Card>

        {/* Savings Goal Widget */}
        <Card
          className="cursor-pointer transition hover:shadow-lg flex flex-col justify-between"
          onClick={() => navigate("/savings")}
        >
          {/* Title & Goal Name at the Top */}
          <CardHeader className="text-center">
            <h3 className="text-lg font-semibold">Savings Goal</h3>
            {firstSavingsGoal && (
              <h4 className="text-xl font-medium text-gray-700">
                {firstSavingsGoal.name}
              </h4>
            )}
          </CardHeader>

          {/* Chart Positioned Near the Top */}
          <CardContent className="flex flex-col items-center justify-start flex-grow mt-2">
            {firstSavingsGoal ? (
              <>
                <div className="w-full flex justify-center">
                  <div className="w-full h-auto">
                    <SavingsChart progress={firstSavingsGoal.progress} />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm">
                No savings goals available.
              </p>
            )}
          </CardContent>

          {/* Latest Contribution at the Bottom */}
          <div className="text-center border-t py-3 text-sm text-gray-600">
            {latestContribution ? (
              <p>
                Last Contribution: €
                {Number(latestContribution.amount).toFixed(2)} on{" "}
                {new Date(
                  latestContribution.contribution_date
                ).toLocaleDateString()}
              </p>
            ) : (
              <p>No contributions yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
