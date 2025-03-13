import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, ShoppingCart, Scale, AlertCircle } from "lucide-react"; // Icons
import Axios from "../Axios";
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  CartesianGrid,
  XAxis,
  Area,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import dayjs from "dayjs";

// Define the possible categories
type UserCategory = "SAVER" | "SPENDER" | "BALANCED" | "No Classification";

interface ClassificationCardProps {
  category: string | null;
}

const ClassificationCard: React.FC<ClassificationCardProps> = ({
  category,
}) => {
  // Ensure category is properly typed
  const validCategory: UserCategory = ["SAVER", "SPENDER", "BALANCED"].includes(
    category as UserCategory
  )
    ? (category as UserCategory)
    : "No Classification";

  const classificationDetails: Record<
    UserCategory,
    { title: string; description: string; icon: JSX.Element }
  > = {
    SAVER: {
      title: "You're a Saver!",
      description:
        "You prioritize savings and spend wisely. Consider diversifying investments.",
      icon: <PiggyBank className="w-16 h-16 text-green-500" />,
    },
    SPENDER: {
      title: "You're a Spender!",
      description:
        "Your expenses are high. Consider reducing discretionary spending and budgeting smarter.",
      icon: <ShoppingCart className="w-16 h-16 text-red-500" />,
    },
    BALANCED: {
      title: "You're Balanced!",
      description:
        "You maintain a good balance between savings and spending. Keep optimizing your finances!",
      icon: <Scale className="w-16 h-16 text-green-500" />,
    },
    "No Classification": {
      title: "No Classification Available",
      description:
        "Not enough data to determine your financial category. Try adding budget details.",
      icon: <AlertCircle className="w-16 h-16 text-gray-500" />,
    },
  };

  const details = classificationDetails[validCategory];

  // State for budget trend data
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchBudgetData();
  }, []);

  // Fetch and aggregate budget items by category and month
  const fetchBudgetData = async () => {
    try {
      const response = await Axios.get("data/budget/");
      const budgets = response.data; // List of budgets

      const monthlyData: Record<
        string,
        { income: number; expenses: number; debt: number; disposable: number }
      > = {};

      budgets.forEach((budget: any) => {
        const month = dayjs(budget.month).format("YYYY-MM");

        // Ignore budgets with no items
        if (!budget.items || budget.items.length === 0) {
          return;
        }

        if (!monthlyData[month]) {
          monthlyData[month] = {
            income: 0,
            expenses: 0,
            debt: 0,
            disposable: 0,
          };
        }

        budget.items.forEach((item: any) => {
          const amount = parseFloat(item.amount);

          if (item.transaction_type === "income") {
            monthlyData[month].income += amount;
          } else if (item.transaction_type === "expense") {
            monthlyData[month].expenses += amount;
          } else if (item.transaction_type === "debt") {
            monthlyData[month].debt += amount;
          }
        });

        // Calculate disposable income
        monthlyData[month].disposable =
          monthlyData[month].income -
          (monthlyData[month].expenses + monthlyData[month].debt);
      });

      // Format data for the chart
      const formattedData = Object.keys(monthlyData).map((month) => ({
        month,
        income: monthlyData[month].income,
        expenses: monthlyData[month].expenses,
        debt: monthlyData[month].debt,
        disposable: monthlyData[month].disposable,
      }));

      setChartData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching budget data:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mb-6">
      <Card className="w-full max-w-lg p-4 md:p-6 flex flex-col items-center text-center border border-gray-300 shadow-md">
        <CardHeader className="w-full">
          <CardTitle className="text-xl font-semibold">
            {details.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full flex flex-col items-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-full mb-4">
            {details.icon}
          </div>
          <p className="text-muted-foreground mb-4 w-full">
            {details.description}
          </p>

          {/* Budget Trend Chart */}
          <div className="mt-4 w-full max-w-full">
            <h3 className="text-lg font-semibold text-center mb-2">
              Your Budgeting Trends Over Time
            </h3>
            {loading ? (
              <p className="text-center">Loading chart...</p>
            ) : chartData.filter((d) => d.income || d.expenses || d.debt)
                .length < 2 ? (
              <p className="text-center text-muted-foreground">
                Not enough budget data available to show trends.
              </p>
            ) : (
              <div className="w-full max-w-full overflow-hidden">
                <ChartContainer
                  config={{
                    income: { label: "Income", color: "#22c55e" },
                    expenses: { label: "Expenses", color: "#3b82f6" },
                    debt: { label: "Debt", color: "#ef4444" },
                    disposable: {
                      label: "Disposable Income",
                      color: "#facc15",
                    },
                  }}
                  className="w-full h-64"
                >
                  <AreaChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={(value) =>
                        value.slice(5, 7) + "/" + value.slice(2, 4)
                      }
                    />
                    <YAxis />
                    <Tooltip
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Legend content={<ChartLegendContent />} />
                    <Area
                      type="natural"
                      dataKey="income"
                      fill="#22c55e"
                      fillOpacity={0.3}
                      stroke="#22c55e"
                    />
                    <Area
                      type="natural"
                      dataKey="expenses"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      stroke="#3b82f6"
                    />
                    <Area
                      type="natural"
                      dataKey="debt"
                      fill="#ef4444"
                      fillOpacity={0.3}
                      stroke="#ef4444"
                    />
                    <Area
                      type="monotone"
                      dataKey="disposable"
                      fill="#facc15"
                      fillOpacity={0.2}
                      stroke="#facc15"
                      strokeDasharray="4 4"
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassificationCard;
