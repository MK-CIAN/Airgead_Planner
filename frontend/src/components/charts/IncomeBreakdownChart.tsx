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
  const size = Math.min(containerWidth * 0.9, 500); // Scale chart size dynamically
  return { width: size, height: size };
};

// Props interface
interface IncomeBreakdownChartProps {
  grossSalary: number;
  netIncome: number;
  taxesPaid: number;
  pensionContribution: number;
}

const IncomeBreakdownChart: React.FC<IncomeBreakdownChartProps> = ({
  grossSalary,
  netIncome,
  taxesPaid,
  pensionContribution,
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
    () => [
      { value: netIncome, name: "Net Income", fill: "rgba(6,170,19,0.85)" }, // Green for net income
      { value: taxesPaid, name: "Taxes Paid", fill: "rgba(255,17,0,0.8)" }, // Red for taxes
      {
        value: pensionContribution,
        name: "Pension Contribution",
        fill: "rgba(54,162,235,0.8)", // Blue for pension contribution
      },
    ],
    [netIncome, taxesPaid, pensionContribution]
  );

  // Calculate tax percentage
  const taxableIncome = grossSalary - pensionContribution;
  const taxPercentage = taxableIncome ? (taxesPaid / taxableIncome) * 100 : 0;

  // Center label component
  const CenterLabel = (props: { viewBox?: any }) => {
    const { viewBox } = props;

    if (
      !viewBox ||
      typeof viewBox.cx !== "number" ||
      typeof viewBox.cy !== "number"
    ) {
      return null;
    }

    const { cx, cy } = viewBox;
    const fontSize = Math.max(chartSize.width * 0.08, 16); // Dynamic font size based on chart size

    return (
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground text-center"
      >
        {/* Display the tax percentage */}
        <tspan
          x={cx}
          y={cy - fontSize * 0.2}
          className="font-bold"
          style={{
            fontSize: `${fontSize}px`, // Dynamic font size
          }}
        >
          {taxPercentage.toFixed(2)}%
        </tspan>
        <tspan
          x={cx}
          y={cy + fontSize * 0.5} // Adjust label positioning dynamically
          className="fill-muted-foreground"
          style={{
            fontSize: `${fontSize * 0.5}px`, // Smaller font size for the description
          }}
        >
          Tax on Gross Income
        </tspan>
      </text>
    );
  };

  return (
    <Card className="flex flex-col w-full max-w-[700px] mx-auto">
      <CardHeader className="items-center pb-0">
        <CardTitle>Income Breakdown</CardTitle>
        <CardDescription>See how your salary is distributed</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={{}}
          className="mx-auto aspect-square chart-container"
        >
          <PieChart width={chartSize.width} height={chartSize.height}>
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
              innerRadius={chartSize.width * 0.28} // Adjusted for padding
              outerRadius={chartSize.width * 0.42} // Adjusted for padding
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
          Breakdown of your gross salary into net income, taxes, pension.
        </div>
      </CardFooter>
    </Card>
  );
};

export default IncomeBreakdownChart;
