import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";

interface PensionGrowthChartProps {
  annualContribution: number;
  rateOfReturn: number;
  years: number;
}

const chartConfig = {
  contributions: {
    label: "Total Contributions",
    color: "hsl(150, 70%, 45%)", // Green Hue
  },
  totalValue: {
    label: "Total Value",
    color: "hsl(120, 60%, 40%)", // Darker Green hue
  },
} satisfies ChartConfig;

export function PensionGrowthChart({
  annualContribution,
  rateOfReturn,
  years,
}: PensionGrowthChartProps) {
  // Generate chart data
  const chartData = Array.from({ length: years }, (_, i) => {
    const year = i + 1;
    const contributions = annualContribution * year;
    const growth =
      annualContribution * (((1 + rateOfReturn) ** year - 1) / rateOfReturn);
    const totalValue = growth;

    return { year: `Year ${year}`, contributions, totalValue };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pension Growth Over Time</CardTitle>
        <CardDescription>
          Visualize the growth of your pension contributions and investments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            width={800}
            height={400}
            data={chartData}
            margin={{
              left: 20,
              right: 20,
              top: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => `€${value}`}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillContributions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(150, 70%, 45%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(150, 70%, 45%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillTotalValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(120, 60%, 40%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(120, 60%, 40%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="contributions"
              type="monotone"
              fill="url(#fillContributions)"
              stroke="hsl(150, 70%, 45%)"
              name="Contributions"
              strokeWidth={2}
            />
            <Area
              dataKey="totalValue"
              type="monotone"
              fill="url(#fillTotalValue)"
              stroke="hsl(120, 60%, 40%)"
              name="Total Value"
              strokeWidth={2}
            />
            <Legend />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="text-sm">
          <p>Annual Growth: {Math.round(rateOfReturn * 100)}% (Example)</p>
          <p>Simulated over {years} years</p>
        </div>
      </CardFooter>
    </Card>
  );
}
