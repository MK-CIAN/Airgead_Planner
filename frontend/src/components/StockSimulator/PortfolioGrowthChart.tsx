import React, { useEffect, useState } from "react";
import Axios from "../Services/Axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface PortfolioHistoryEntry {
  timestamp: string;
  total_value: string;
  transaction_label?: string | null;
}

interface PortfolioGrowthChartProps {
  portfolioType: "personal" | "league";
  leagueId?: string;
  showTitle?: boolean;
  showCardContainer?: boolean;
}

const PortfolioGrowthChart: React.FC<PortfolioGrowthChartProps> = ({
  portfolioType,
  leagueId,
  showTitle = true,
  showCardContainer = true,
}) => {
  const [history, setHistory] = useState<PortfolioHistoryEntry[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const url =
          portfolioType === "league"
            ? `data/portfolio/history/?portfolio_type=league&league_id=${leagueId}`
            : `data/portfolio/history/?portfolio_type=personal`;

        const response = await Axios.get(url);
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch portfolio history:", error);
      }
    };

    fetchHistory();
  }, []);

  console.log(history);

  // Formatting the Data Correctly
  const formattedData = history
    .map((entry) => ({
      rawTimestamp: new Date(entry.timestamp).getTime(),
      date: new Date(entry.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      tooltipDate: new Date(entry.timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      total_value: parseFloat(entry.total_value),
    }))
    .sort((a, b) => a.rawTimestamp - b.rawTimestamp);

  // Checking if screen is mobile-sized
  const isMobile = window.innerWidth < 768;
  const axisFontSize = isMobile ? 8 : 12;
  const leftMargin = isMobile ? -27.5 : 10;

  return showCardContainer ? (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent>
        {showTitle && (
          <h3 className="text-xl font-semibold text-center mb-2">
            Portfolio Growth Over Time
          </h3>
        )}
        <div className="w-full sm:min-w-full mx-auto h-[300px] md:h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: leftMargin, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: axisFontSize }}
                angle={-45}
                textAnchor="middle"
                interval="preserveStartEnd"
              />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: axisFontSize }} />
              <Tooltip
                formatter={(value: number | string) => [`$${Number(value).toFixed(2)}`, "Total Value"]}
                labelFormatter={(label: any, payload: any[]) =>
                  payload.length > 0 ? payload[0].payload.tooltipDate : label
                }
              />
              <Line
                type="monotone"
                dataKey="total_value"
                stroke="hsl(150, 70%, 45%)"
                strokeWidth={2.5}
                dot={{ fill: "hsl(120, 60%, 40%)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  ) : (
    <div className="w-full h-[300px] md:h-[380px]">
      {showTitle && (
        <h3 className="text-xl font-semibold text-center mb-2">
          Portfolio Growth Over Time
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: leftMargin, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: axisFontSize }}
            angle={-45}
            textAnchor="middle"
            interval="preserveStartEnd"
          />
          <YAxis domain={["auto", "auto"]} tick={{ fontSize: axisFontSize }} />
          <Tooltip
            formatter={(value: number | string) => [`$${Number(value).toFixed(2)}`, "Total Value"]}
            labelFormatter={(label: any, payload: any[]) =>
              payload.length > 0 ? payload[0].payload.tooltipDate : label
            }
          />
          <Line
            type="monotone"
            dataKey="total_value"
            stroke="hsl(150, 70%, 45%)"
            strokeWidth={2.5}
            dot={{ fill: "hsl(120, 60%, 40%)", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );  
};

export default PortfolioGrowthChart;
