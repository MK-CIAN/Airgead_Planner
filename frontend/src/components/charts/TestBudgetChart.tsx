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
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";

// Utility for dynamic chart sizing
const getChartSize = (containerWidth: number) => {
  const width = Math.min(window.innerWidth * 0.95, 500);
  return { width, height: width };
};

// Random colors for expenses
const expenseColors = [
  "#3357FF",
  "#FF33A8",
  "#8A2BE2",
  "#FFD700",
  "#FF8F33",
  "#DA70D6",
  "#7D33FF",
  "#FF1493",
  "#00CED1",
  "#9370DB",
];

type CustomViewBox = {
  cx?: number;
  cy?: number;
  startAngle?: number;
  endAngle?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
};

// Function to generate a consistent random color for a label
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
  type: string; // income, expense, or debt
}

interface BudgetChartProps {
  data: BudgetData[];
}

const TestBudgetChart: React.FC<BudgetChartProps> = ({ data }) => {
  const [containerWidth, setContainerWidth] = useState(500);
  const [chartSize, setChartSize] = useState(getChartSize((containerWidth)));

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
            : getColorForLabel(item.label), // Random color for expenses
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
  const CenterLabel = (props: { viewBox?: CustomViewBox }) => {
    const { viewBox } = props;

    // Ensure viewBox and required properties are defined
    if (
      !viewBox ||
      typeof viewBox.cx !== "number" ||
      typeof viewBox.cy !== "number"
    ) {
      return null;
    }

    const { cx, cy } = viewBox;
    const fontSize = Math.max(chartSize.width * 0.08, 16); // Dynamic font size based on chart size

    // Calculate the total (income + expenses + debt)
    const total = totals.income - totals.expensesAndDebt;

    return (
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground text-center"
      >
        {/* Adjust the font size of the main total */}
        <tspan
          x={cx}
          y={cy - fontSize * 0.2} // Adjust positioning slightly to center vertically
          className="font-bold"
          style={{
            fontSize: `${fontSize}px`, // Increase font size for the total
          }}
        >
          €{total.toFixed(2)}
        </tspan>
        {/* Adjust the font size of the label */}
        <tspan
          x={cx}
          y={cy + fontSize * 0.5} // Position below the main text
          className="fill-muted-foreground"
          style={{
            fontSize: `${fontSize * 0.5}px`, // Increase or adjust font size for the label
          }}
        >
          Remaining Amount
        </tspan>
      </text>
    );
  };

  return (
    <Card className="flex flex-col w-full max-w-[700px] mx-auto">
      <CardHeader className="items-center pb-0">
        <CardTitle>Budget Breakdown</CardTitle>
        <CardDescription>Monthly Income vs Expenses</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          className="mx-auto aspect-square chart-container"
          config={{}}
        >
          <PieChart
            width={chartSize.width}
            height={chartSize.width} // Make chart height equal to width for a square chart
          >
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const { name, value, fill } = payload[0].payload;
                  return (
                    <div
                      style={{
                        backgroundColor: "#ffffff",
                        border: `1px solid ${fill}`,
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "14px",
                        color: "#000",
                      }}
                    >
                      <strong>{name}</strong>
                      <div>€ {value.toLocaleString()}</div>{" "}
                      {/* € sign and formatting */}
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
              innerRadius={chartSize.width * 0.28} // Adjust dynamically to occupy more space
              outerRadius={chartSize.width * 0.40} // Adjust dynamically to fill the card
              stroke="#ffffff"
              strokeWidth={1}
            >
              <Label content={(props) => <CenterLabel {...props} />} />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Income: €{totals.income.toFixed(2)} | Expenses & Debt: €
          {totals.expensesAndDebt.toFixed(2)}
        </div>
      </CardFooter>
    </Card>
  );
};

export default TestBudgetChart;
