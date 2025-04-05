import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import DonutChart from "./InterestRateChart";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface LoanChartProps {
  repaymentSchedule?: number[];
  totalInterest: number;
  loanBalance: number;
  originalBalance?: number;
  termLength: number;
  interestRate: number;
  isEditing: boolean;
  customRepaymentSchedule?: number[];
  customLoanBalance?: number;
  customTotalInterest?: number;
  isActiveLoan?: boolean; // Flag to determine if it's an active loan
}

const chartConfig = {
  originalRepayment: {
    label: "Original Repayment Schedule",
    color: "hsl(220, 70%, 50%)", // Blue hue
  },
  customRepayment: {
    label: "Custom Repayment Schedule",
    color: "hsl(0, 80%, 50%)", // Red hue
  },
} as const;

const LoanChart: React.FC<LoanChartProps> = ({
  repaymentSchedule,
  totalInterest,
  loanBalance,
  isEditing,
  customRepaymentSchedule,
}) => {
  // Chart Data Formatting
  const chartData = (repaymentSchedule ?? []).map((balance, index) => ({
    month: `Month ${index + 1}`,
    originalRepayment: balance,
    customRepayment: customRepaymentSchedule?.[index] || null,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Repayment Visualization</CardTitle>
        <CardDescription>
          Compare your repayment schedule before and after custom adjustments.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Carousel>
          <CarouselContent>
            {/* Chart Slide */}
            <CarouselItem>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  width={800}
                  height={400}
                  data={chartData}
                  margin={{ left: 10, right: 20, top: 10, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => `€${value.toLocaleString()}`}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />

                  <defs>
                    <linearGradient
                      id="fillOriginal"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(220, 70%, 50%)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(220, 70%, 50%)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillCustom" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(0, 80%, 50%)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(0, 80%, 50%)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>

                  <Area
                    dataKey="originalRepayment"
                    type="monotone"
                    fill="url(#fillOriginal)"
                    stroke="hsl(220, 70%, 50%)"
                    name="Original Loan Balance"
                    strokeWidth={2}
                  />
                  {isEditing && (
                    <Area
                      dataKey="customRepayment"
                      type="monotone"
                      fill="url(#fillCustom)"
                      stroke="hsl(0, 80%, 50%)"
                      name="New Loan Balance"
                      strokeWidth={2}
                    />
                  )}
                  <Legend />
                </AreaChart>
              </ChartContainer>
            </CarouselItem>

            {/* Original Donut Chart Slide (Main View) */}
            <CarouselItem>
              <div className="flex justify-center w-full">
                <DonutChart principal={loanBalance} interest={totalInterest} expanded={isEditing}/>
              </div>
            </CarouselItem>
          </CarouselContent>

          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
    </Card>
  );
};

export default LoanChart;
