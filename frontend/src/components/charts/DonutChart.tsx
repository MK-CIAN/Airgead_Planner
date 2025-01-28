"use client";

import React, { useMemo, useEffect, useState } from "react";
import { PieChart, Pie, Label, Tooltip, ResponsiveContainer } from "recharts";

interface DonutChartProps {
  principal: number;
  interest: number;
  customContribution?: number;
  expanded?: boolean; // New prop to check if the chart is in expanded view
}

const DonutChart: React.FC<DonutChartProps> = ({
  principal,
  interest,
  customContribution = 0,
  expanded = true,
}) => {
  const total = principal + interest + customContribution;

  // Determine chart size based on screen width
  const [chartSize, setChartSize] = useState(250);

  useEffect(() => {
    const handleResize = () => {
      setChartSize(expanded ? 400 : 200); // Adjust size dynamically
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    console.log(expanded);
    
    return () => window.removeEventListener("resize", handleResize);
  }, [expanded]);

  // Prepare chart data
  const chartData = useMemo(
    () => [
      { value: principal, name: "Principal", fill: "hsl(120, 70%, 40%)" }, // Green
      { value: interest, name: "Interest", fill: "hsl(0, 80%, 50%)" }, // Red
      { value: customContribution, name: "Custom Contribution", fill: "hsl(220, 70%, 50%)" }, // Blue
    ],
    [principal, interest, customContribution]
  );

  // Center label for the chart
  const CenterLabel = (props: { viewBox?: any }) => {
    const { viewBox } = props;

    if (!viewBox || typeof viewBox.cx !== "number" || typeof viewBox.cy !== "number") {
      return null;
    }

    const { cx, cy } = viewBox;
    const percentage = total > 0 ? (principal / total) * 100 : 0;

    return (
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground text-center"
      >
        <tspan
          x={cx}
          y={cy - 10}
          className="font-bold text-lg"
        >
          {percentage.toFixed(1)}%
        </tspan>
        <tspan
          x={cx}
          y={cy + 10}
          className="text-muted-foreground text-sm"
        >
          Principal
        </tspan>
      </text>
    );
  };

  return (
    <div className={`flex justify-center items-center w-full mx-auto ${expanded ? "h-[400px]" : "h-[200px]"}`}>
      <ResponsiveContainer className="items-center pb-0">
        <PieChart>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const { name, value, fill } = payload[0].payload;
                return (
                  <div
                    style={{
                      backgroundColor: "#fff",
                      border: `1px solid ${fill}`,
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "14px",
                      color: "#000",
                    }}
                  >
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
            innerRadius={chartSize * 0.28}
            outerRadius={chartSize * 0.42}
            stroke="#ffffff"
            strokeWidth={1}
            isAnimationActive
          >
            <Label content={(props) => <CenterLabel {...props} />} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChart;
