import React from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface BudgetData {
  id: number;
  value: number;
  label: string;
  type: string;
}

interface BudgetRadarChartProps {
  budgetData: BudgetData[];
}

const chartConfig = {
  expense: {
    label: "Expense",
    color: "hsl(150, 70%, 45%)",
  },
  debt: {
    label: "Debt",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const BudgetRadarChart: React.FC<BudgetRadarChartProps> = ({ budgetData }) => {
  // Filter data for expense and debt types only
  const filteredData = budgetData
    .filter((item) => item.type === "expense" || item.type === "debt")
    .map((item) => ({
      label: item.label,
      value: item.value,
    }));

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Expenditure Spread</CardTitle>
        <CardDescription>
          A breakdown of expenses and debts by category
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[350px]"
        >
          <RadarChart
            data={filteredData}
            outerRadius="70%" // Adjusted radius to provide space for labels
            margin={{ top: 10, bottom: 10, left: 10, right: 10 }} // Add padding
          >
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "hsl(0, 0%, 0%)" }} // Increase tick font size and color
            />
            <PolarGrid stroke="hsla(194 100% 0% / 0.42)" strokeWidth={1.5} />
            <Radar
              dataKey="value"
              stroke="hsl(150, 70%, 35%)" // Green border
              fill="hsl(120, 60%, 60%)" // Green fill
              fillOpacity={0.5}
              strokeWidth={2} // Bold border
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Expense and debt distribution
        </div>
      </CardFooter>
    </Card>
  );
};

export default BudgetRadarChart;
