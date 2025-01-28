"use client";

import React, { useMemo, useEffect, useState } from "react";
import { PieChart, Pie, Label } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

// Utility for dynamic chart sizing
const getChartSize = (containerWidth: number) => {
  const size = Math.min(containerWidth * 0.9, 500); // Scale chart dynamically
  return { width: size, height: size };
};

// Random colors for expenses
const expenseColors = [
  "#3357FF", "#FF33A8", "#8A2BE2", "#FFD700", "#FF8F33",
  "#DA70D6", "#7D33FF", "#FF1493", "#00CED1", "#9370DB"
];

// Function to generate a consistent color for a label
const getColorForLabel = (label: string) => {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) % expenseColors.length;
  }
  return expenseColors[hash];
};

// Props interface
interface BudgetData {
  id: number;
  value: number;
  label: string;
  type: string;
}

interface BudgetChartProps {
  data: BudgetData[];
  showTitle?: boolean;
  useCard?: boolean;
}

const TestBudgetChart: React.FC<BudgetChartProps> = ({
  data,
  showTitle = true,
  useCard = true,
}) => {
  const [containerWidth, setContainerWidth] = useState(500);
  const [chartSize, setChartSize] = useState(getChartSize(containerWidth));

  // Resize observer for dynamic resizing
  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector(".chart-container");
      if (container) {
        const containerWidth = container.clientWidth;
        setContainerWidth(containerWidth);
        setChartSize(getChartSize(containerWidth));
      }
    };

    // Initial sizing
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prepare chart data
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        value: item.value,
        name: item.label,
        fill:
          item.type === "income"
            ? "rgba(6,170,19,0.85)" // Green for income
            : item.type === "debt"
            ? "rgba(255,0,0,0.80)" // Red for debt
            : getColorForLabel(item.label), // Color for expenses
      })),
    [data]
  );

  // Calculate totals for income, expenses, and debt
  const totals = useMemo(() => {
    const income = data
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.value, 0);
    const expensesAndDebt = data
      .filter((item) => item.type === "expense" || item.type === "debt")
      .reduce((sum, item) => sum + item.value, 0);
    return { income, expensesAndDebt };
  }, [data]);

  // Center label component
  const CenterLabel = (props: { viewBox?: any }) => {
    const { viewBox } = props;
    if (!viewBox || typeof viewBox.cx !== "number" || typeof viewBox.cy !== "number") return null;

    const { cx, cy } = viewBox;
    const fontSize = Math.max(chartSize.width * 0.08, 16);
    const total = totals.income - totals.expensesAndDebt;

    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-center">
        <tspan x={cx} y={cy - fontSize * 0.2} className="font-bold" style={{ fontSize: `${fontSize}px` }}>
          €{total.toFixed(2)}
        </tspan>
        <tspan x={cx} y={cy + fontSize * 0.5} className="fill-muted-foreground" style={{ fontSize: `${fontSize * 0.5}px` }}>
          Remaining Amount
        </tspan>
      </text>
    );
  };

  // Chart Component
  const ChartComponent = (
    <ChartContainer className="mx-auto aspect-square chart-container" config={{}}>
      <PieChart width={chartSize.width} height={chartSize.width}>
        <ChartTooltip
          cursor={false}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const { name, value, fill } = payload[0].payload;
              return (
                <div style={{
                  backgroundColor: "#ffffff",
                  border: `1px solid ${fill}`,
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "14px",
                  color: "#000",
                }}>
                  <strong>{name}</strong>
                  <div>€ {value.toLocaleString()}</div>
                </div>
              );
            }
            return null;
          }}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={chartSize.width * 0.28}
          outerRadius={chartSize.width * 0.40}
          stroke="#ffffff"
          strokeWidth={1}
        >
          <Label content={(props) => <CenterLabel {...props} />} />
        </Pie>
      </PieChart>
    </ChartContainer>
  );

  return useCard ? (
    <Card className="flex flex-col w-full max-w-[700px] mx-auto">
      {showTitle && (
        <CardHeader className="items-center pb-0">
          <CardTitle>Budget Breakdown</CardTitle>
          <CardDescription>Monthly Income vs Expenses</CardDescription>
        </CardHeader>
      )}
      <CardContent className="flex-1 pb-0">{ChartComponent}</CardContent>
      {showTitle && (
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="leading-none text-muted-foreground">
            Income: €{totals.income.toFixed(2)} | Expenses & Debt: €{totals.expensesAndDebt.toFixed(2)}
          </div>
        </CardFooter>
      )}
    </Card>
  ) : (
    ChartComponent
  );
};

export default TestBudgetChart;
