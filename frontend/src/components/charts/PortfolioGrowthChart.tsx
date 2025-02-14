import React, { useEffect, useState } from "react";
import Axios from "../Axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

interface PortfolioHistoryEntry {
  timestamp: string;
  total_value: string;
  transaction_label?: string | null;
}

const PortfolioGrowthChart: React.FC = () => {
  const [history, setHistory] = useState<PortfolioHistoryEntry[]>([]);
  const initialBalance = 10000;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await Axios.get(`data/portfolio/history/`);
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch portfolio history:", error);
      }
    };

    fetchHistory();
  }, []);

  // ✅ Step 1: Format Data Correctly
  const formattedData = history
    .map((entry) => ({
      date: new Date(entry.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      total_value: parseFloat(entry.total_value),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // ✅ Ensure data is sorted by date

  const firstEntry =
    formattedData.length > 0 ? formattedData[0].total_value : initialBalance;
  const latestEntry =
    formattedData.length > 0
      ? formattedData[formattedData.length - 1].total_value
      : initialBalance;

  const portfolioChange = latestEntry - firstEntry;
  const percentageChange = ((portfolioChange / firstEntry) * 100).toFixed(2);

  return (
    <Card>
      <CardContent>
        <ResponsiveContainer width="100%" height={380}>
          <LineChart
            data={formattedData}
            margin={{ top: 50, right: 30, left: 20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
            <Line
              type="monotone"
              dataKey="total_value"
              stroke="hsl(150, 70%, 45%)"
              strokeWidth={2}
              dot={{ fill: "hsl(120, 60%, 40%)", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-base">
        {" "}
        {/* Increased from text-sm to text-base */}
        <div className="flex gap-2 font-semibold leading-tight">
          {" "}
          {/* Made font slightly bolder */}
          {portfolioChange >= 0 ? (
            <>
              Trending up by {percentageChange}%{" "}
              <TrendingUp className="h-6 w-6 text-green-500" />
            </>
          ) : (
            <>
              Down by {percentageChange}%{" "}
              <TrendingDown className="h-6 w-6 text-red-500" />
            </>
          )}
        </div>
        <div className="leading-snug text-muted-foreground text-lg">
          {" "}
          {/* Made description larger */}
          {portfolioChange >= 0
            ? "Your portfolio is growing!"
            : "Your portfolio has declined."}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PortfolioGrowthChart;
