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
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
} from "recharts";
import DonutChart from "../charts/DonutChart";
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
  isActiveLoan?: boolean;
  actualPayments?: { date: string; balance: number }[]; // Precomputed payments
  createdAt?: string;
}

const chartConfig = {
  originalRepayment: {
    label: "Original Repayment Schedule",
    color: "hsl(220, 70%, 50%)",
  },
  customRepayment: {
    label: "Custom Repayment Schedule",
    color: "hsl(0, 80%, 50%)",
  },
  actualPayments: {
    label: "Actual Payments",
    color: "hsl(120, 70%, 40%)",
  },
} as const;

const ActiveLoanChart: React.FC<LoanChartProps> = ({
  repaymentSchedule,
  totalInterest,
  loanBalance,
  originalBalance,
  termLength,
  isEditing,
  customRepaymentSchedule,
  actualPayments,
}) => {
  const chartData = actualPayments?.map((payment, index) => ({
    date: payment.date,
    originalRepayment: repaymentSchedule?.[index] ?? null,
    customRepayment: customRepaymentSchedule?.[index] ?? null,
    actualPayment: payment.balance,
  })) || [];

  console.log(chartData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Repayment Visualization</CardTitle>
        <CardDescription>
          Track your progress against the scheduled repayment plan.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Carousel>
          <CarouselContent>
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
                    dataKey="date"
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
                  <Tooltip content={<ChartTooltipContent />} />

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

                  {/* Original Repayment Line */}
                  <Area
                    dataKey="originalRepayment"
                    type="monotone"
                    fill="url(#fillOriginal)"
                    stroke="hsl(220, 70%, 50%)"
                    name="Original Loan Balance"
                    strokeWidth={2}
                  />

                  {/* Custom Repayment Line (Only if editing) */}
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

                  {/* User Actual Payments Progress Line */}
                  {actualPayments && actualPayments.length > 0 && (
                    <Area
                      dataKey="actualPayment"
                      type="monotone"
                      fill="url(#fillActual)"
                      stroke="hsl(120, 70%, 40%)"
                      name="Actual Payments"
                      strokeWidth={2}
                    />
                  )}

                  <Legend />
                </AreaChart>
              </ChartContainer>
            </CarouselItem>

            <CarouselItem>
              <div className="flex justify-center w-full">
                <DonutChart
                  principal={loanBalance}
                  interest={totalInterest}
                  expanded={isEditing}
                />
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

export default ActiveLoanChart;
