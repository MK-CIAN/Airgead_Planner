import React from "react";
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

interface StockData {
  date: string;
  close_price: number;
}

interface StockChartProps {
  data: StockData[];
  ticker: string;
}

const StockChart: React.FC<StockChartProps> = ({ data, ticker }) => {
  // ✅ Format Data for Recharts
  const formattedData = data.map((entry) => ({
    rawTimestamp: new Date(entry.date).getTime(),
    date: new Date(entry.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    tooltipDate: new Date(entry.date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    close_price: entry.close_price,
  }));

  const firstEntry = formattedData[0]?.close_price || 0;
  const latestEntry = formattedData[formattedData.length - 1]?.close_price || 0;
  const priceChange = latestEntry - firstEntry;
  const percentageChange = firstEntry
    ? ((priceChange / firstEntry) * 100).toFixed(2)
    : "0";

  // **Check if screen is mobile-sized**
  const isMobile = window.innerWidth < 768;
  const axisFontSize = isMobile ? 8 : 12;
  const leftMargin = isMobile ? -35 : 10; // ✅ Fixes left shifting issue

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent>
        <h3 className="text-xl font-semibold text-center mb-2">
          {ticker} Stock Price Over Time
        </h3>
        {/* ✅ Ensure full-width on mobile */}
        <div className="w-full sm:min-w-full mx-auto h-[300px] md:h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: leftMargin, bottom: 10 }} // ✅ Correct conditional left margin
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: axisFontSize }}
                angle={-45}
                textAnchor="middle"
                interval="preserveStartEnd"
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: axisFontSize }}
              />
              <Tooltip
                formatter={(value: number | string) => [`$${Number(value).toFixed(2)}`, "Close Price"]}
                labelFormatter={(label: any, payload: any[]) =>
                  payload.length > 0 ? payload[0].payload.tooltipDate : label
                }
              />
              <Line
                type="monotone"
                dataKey="close_price"
                stroke={priceChange >= 0 ? "hsl(150, 70%, 45%)" : "hsl(0, 80%, 50%)"}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-base">
        <div className="flex gap-2 font-semibold leading-tight">
          {priceChange >= 0 ? (
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
          {priceChange >= 0
            ? "This stock is performing well!"
            : "The stock price has declined recently."}
        </div>
      </CardFooter>
    </Card>
  );
};

export default StockChart;
