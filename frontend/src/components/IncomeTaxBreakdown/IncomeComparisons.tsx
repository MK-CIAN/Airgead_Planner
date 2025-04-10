import React from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableRow } from "../ui/table";
import { IndexFundGrowthChart } from "./IndexFundGrowthChart";
import { Coffee, Clapperboard, UtensilsCrossed, ChartNoAxesCombined } from "lucide-react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

interface IncomeTaxBreakdown {
  id: number;
  salary: number;
  pension_contribution: number;
  taxable_income: number;
  income_tax: number;
  tax_credit: number;
  net_tax: number;
  usc: number;
  prsi: number;
  total_deductions: number;
  net_salary: number;
}

interface IncomeComparisonProps {
  data: {
    baseIncome: IncomeTaxBreakdown;
    newIncome: IncomeTaxBreakdown;
  };
}

export const IncomeComparison: React.FC<IncomeComparisonProps> = ({ data }) => {
  const { baseIncome, newIncome } = data;

  const yearlyDifference = newIncome.net_salary - baseIncome.net_salary;
  const monthlyDifference = newIncome.net_salary - baseIncome.net_salary;
  const netMonthlyDifference = yearlyDifference / 12;
  const budget = {
    meals: netMonthlyDifference * 0.3,
    coffee: netMonthlyDifference * 0.1,
    movies: netMonthlyDifference * 0.1,
    investing: netMonthlyDifference * 0.5,
  };

  // Generate timeline entries dynamically
  const timeline: TimelineEntry[] = [
    {
      title: "Let's Get Started with the Basics",
      content: (
        <div className="flex flex-col space-y-6">
          {/* Base Income Details */}
          <Card>
            <CardHeader>
              <CardTitle>Base Income Details</CardTitle>
              <CardDescription>
                Overview of the base income selected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount (€)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Gross Salary</TableCell>
                    <TableCell>{baseIncome.salary.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Net Salary</TableCell>
                    <TableCell>{baseIncome.net_salary.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* New Income Details */}
          <Card>
            <CardHeader>
              <CardTitle>New Income Details</CardTitle>
              <CardDescription>
                Overview of the new income selected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount (€)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Gross Salary</TableCell>
                    <TableCell>{newIncome.salary.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Net Salary</TableCell>
                    <TableCell>{newIncome.net_salary.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Differences */}
          <Card>
            <CardHeader>
              <CardTitle>Income Comparison</CardTitle>
              <CardDescription>
                Yearly, Monthly, and Weekly differences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Period</TableCell>
                    <TableCell>Gross Difference (€)</TableCell>
                    <TableCell>Net Difference (€)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Yearly</TableCell>
                    <TableCell>
                      {(newIncome.salary - baseIncome.salary).toFixed(2)}
                    </TableCell>
                    <TableCell>{yearlyDifference.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Monthly</TableCell>
                    <TableCell>
                      {((newIncome.salary - baseIncome.salary) / 12).toFixed(2)}
                    </TableCell>
                    <TableCell>{(monthlyDifference / 12).toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Weekly</TableCell>
                    <TableCell>
                      {((newIncome.salary - baseIncome.salary) / 52).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {(
                        (newIncome.net_salary - baseIncome.net_salary) /
                        52
                      ).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      title: "How Does This Affect You?",
      content: (
        <div className="flex flex-col space-y-6">
          {/* New Income Details */}
          <Card>
            <CardHeader>
              <CardTitle>Spending Opportunities</CardTitle>
              <CardDescription>
                How you can spend your additional income
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Meals Out */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <span>Meals Out</span>
                      <UtensilsCrossed className="w-8 h-8 text-green-500" />
                    </div>
                  </CardTitle>
                  <CardDescription>
                    How many more meals out per month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Based on an average cost of €80 per meal for two people, you
                    could afford{" "}
                    <strong>{Math.floor(budget.meals / 80)}</strong> additional
                    meals out per month.
                  </p>
                </CardContent>
              </Card>

              {/* Coffee */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <span>Coffee</span>
                      <Coffee className="w-8 h-8 text-green-500" />
                    </div>
                  </CardTitle>

                  <CardDescription>
                    How many more coffees per week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Based on an average cost of €4 per coffee, you could afford{" "}
                    <strong>{Math.floor((budget.coffee * 12) / 4 / 52)}</strong>{" "}
                    additional coffees per week.
                  </p>
                </CardContent>
              </Card>

              {/* Movie Tickets */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <span>Movies</span>
                      <Clapperboard className="w-8 h-8 text-green-500" />
                    </div>
                  </CardTitle>
                  <CardDescription>
                    How many movie outings per month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Based on an average cost of €15 per movie outing (ticket +
                    snacks), you could afford{" "}
                    <strong>{Math.floor(budget.movies / 15)}</strong> additional
                    movie outings per month.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      title: "Lets Talk About Investing",
      content: (
        <div>
          {/* Investment Section */}
          <Card>
            <CardHeader>
              <CardTitle><div className="flex items-center gap-2">
                      <span>S&P 500 Investment Growth</span>
                      <ChartNoAxesCombined className="w-8 h-8 text-green-500" />
                    </div></CardTitle>
              <CardDescription>
                See how your additional monthly income grows with investment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                // Calculate Monthly Investment
                const monthlyDifference = budget.investing;
                const annualReturnRate = 0.08; // 8% annual return
                const years = 5; // Duration of investment in years

                // Calculate total contributions
                const totalContributions = monthlyDifference * 12 * years;

                // Calculate future value using compound interest formula
                const futureValue = Array.from({ length: years }).reduce(
                  (acc: number) =>
                    acc * (1 + annualReturnRate) + monthlyDifference * 12,
                  0
                );

                const interestEarned = futureValue - totalContributions;

                return (
                  <>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell>Amount (€)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Total Contributions</TableCell>
                          <TableCell>{totalContributions.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Total Future Value</TableCell>
                          <TableCell>{futureValue.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Interest Earned</TableCell>
                          <TableCell>{interestEarned.toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <div>
                      <IndexFundGrowthChart
                        totalContributions={totalContributions}
                        futureValue={futureValue}
                      />
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  const ref = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full bg-white dark:bg-neutral-950 font-sans md:px-10"
      ref={containerRef}
    >
      <div className="max-w-7xl mx-auto py-10">
        <h2 className="text-lg md:text-4xl mb-4 text-center text-black dark:text-white">
          Income Comparison
        </h2>

        <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base max-w-sm">
          This timeline shows the comparison between your selected incomes.
        </p>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-5">
        {timeline.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white dark:bg-black flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-500 dark:text-neutral-500 ">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
              {item.content}{" "}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0  w-[2px] bg-gradient-to-t from-green-400 via-green-600 to-transparent from-[0%] via-[50%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

export default IncomeComparison;
