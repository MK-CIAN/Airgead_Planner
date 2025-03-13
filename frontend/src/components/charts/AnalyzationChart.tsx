import React, { useMemo, useEffect, useState } from "react";
import { PieChart, Pie, Label, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";


interface AnalyzationChartProps {
    needs: number;
    wants: number;
    savings: number;
}
  
// Utility for dynamic chart sizing
const getChartSize = (containerWidth: number) => {
  const size = Math.min(containerWidth * 0.9, 500); // Scale chart dynamically
  return { width: size, height: size };
};

// Colors for each budget section
const budgetColors = {
  needs: "#ff6666", // Red for needs
  wants: "#ffcc66", // Orange for wants
  savings: "#66ccff", // Blue for savings
  leftover: "#66ff66", // Green for leftover
};

// Budget guideline markers (50% / 30% / 20%)
const guidelineMarkers = [
  { name: "Needs (50%)", value: 50, color: "rgba(255,102,102,0.3)" },
  { name: "Wants (30%)", value: 30, color: "rgba(255,204,102,0.3)" },
  { name: "Savings (20%)", value: 20, color: "rgba(102,204,255,0.3)" },
];

// Props interface
interface AnalyzationChartProps {
  needs: number;
  wants: number;
  savings: number;
}

const AnalyzationChart: React.FC<AnalyzationChartProps> = ({ needs, wants, savings }) => {
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

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate leftover budget
  const totalUsed = needs + wants + savings;
  const leftover = Math.max(100 - totalUsed, 0); // Ensure leftover doesn't go negative

  // Prepare chart data
  const chartData = useMemo(() => {
    return [
      { name: "Needs", value: needs, fill: budgetColors.needs },
      { name: "Wants", value: wants, fill: budgetColors.wants },
      { name: "Savings", value: savings, fill: budgetColors.savings },
      { name: "Leftover", value: leftover, fill: budgetColors.leftover },
    ];
  }, [needs, wants, savings, leftover]);

  // Center label component
  const CenterLabel = (props: { viewBox?: any }) => {
    const { viewBox } = props;
    if (!viewBox || typeof viewBox.cx !== "number" || typeof viewBox.cy !== "number") return null;

    const { cx, cy } = viewBox;
    const fontSize = Math.max(chartSize.width * 0.08, 16);

    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-center">
        <tspan x={cx} y={cy - fontSize * 0.2} className="font-bold" style={{ fontSize: `${fontSize}px` }}>
          {totalUsed > 100 ? "Over Budget" : `${leftover.toFixed(1)}% Left`}
        </tspan>
        <tspan x={cx} y={cy + fontSize * 0.5} className="fill-muted-foreground" style={{ fontSize: `${fontSize * 0.5}px` }}>
          {totalUsed > 100 ? "Exceeds 100%" : "Remaining Budget"}
        </tspan>
      </text>
    );
  };

  return (
    <Card className="flex flex-col w-full max-w-[700px] mx-auto">
      <CardHeader className="items-center pb-0">
        <CardTitle>Spending Breakdown</CardTitle>
        <CardDescription>Compare your budget distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer className="mx-auto aspect-square chart-container" config={{}}>
          <PieChart width={chartSize.width} height={chartSize.width}>
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
                      <div>{value.toFixed(1)}%</div>
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
              innerRadius={chartSize.width * 0.3}
              outerRadius={chartSize.width * 0.45}
              stroke="#ffffff"
              strokeWidth={1}
            >
              <Label content={(props) => <CenterLabel {...props} />} />
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>

            {/* Overlay guideline markers */}
            <Pie
              data={guidelineMarkers}
              dataKey="value"
              nameKey="name"
              innerRadius={chartSize.width * 0.45}
              outerRadius={chartSize.width * 0.47}
              stroke="#ffffff"
              strokeWidth={1}
              fill="transparent"
            >
              {guidelineMarkers.map((entry, index) => (
                <Cell key={`marker-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Needs: {needs.toFixed(1)}% | Wants: {wants.toFixed(1)}% | Savings: {savings.toFixed(1)}% | Leftover: {leftover.toFixed(1)}%
        </div>
      </CardFooter>
    </Card>
  );
};

export default AnalyzationChart;
