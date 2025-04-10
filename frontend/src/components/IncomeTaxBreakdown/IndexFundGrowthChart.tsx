"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";

interface IndexFundGrowthChartProps {
  totalContributions: number;
  futureValue: number;
}

const chartConfig = {
  invested: {
    label: "Amount Invested",
    color: "hsl(150, 70%, 45%)", // Green hue
  },
  total: {
    label: "Total Amount",
    color: "hsl(120, 60%, 40%)", // Darker green hue
  },
} satisfies ChartConfig;

export function IndexFundGrowthChart({
  totalContributions,
  futureValue,
}: IndexFundGrowthChartProps) {
  // Generate chart data for visualization
  const chartData = Array.from({ length: 5 }, (_, i) => {
    const year = i + 1;
    const invested = totalContributions * (year / 5); // Progressively grows over 10 years
    const total = futureValue * (year / 5); // Matches future value growth
    return { year: `Year ${year}`, invested, total };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Index Fund Growth</CardTitle>
        <CardDescription>
          See how your money grows over 10 years
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            width={800} // Increased width
            height={400} // Increased height
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
              tickFormatter={(value) => value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => `€${value}`}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillInvested" x1="0" y1="0" x2="0" y2="1">
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
              <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="invested"
              type="monotone"
              fill="url(#fillInvested)"
              stroke="hsl(150, 70%, 45%)"
              name="Amount Invested"
              strokeWidth={2}
            />
            <Area
              dataKey="total"
              type="monotone"
              fill="url(#fillTotal)"
              stroke="hsl(120, 60%, 40%)"
              name="Total Amount"
              strokeWidth={2}
            />
            <Legend />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Annual Growth: 8% (Example Rate)
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Simulated over 5 years
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
