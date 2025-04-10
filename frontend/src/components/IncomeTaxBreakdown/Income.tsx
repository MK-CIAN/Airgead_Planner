import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableHeader,
} from "@/components/ui/table";
import IncomeComparison from "./IncomeComparisons";
import IncomeBreakdownChart from "./IncomeBreakdownChart";
import Axios from "../Services/Axios";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "../ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import IncomePlaceholder from "../Placeholders/IncomePlaceholder";
import FeatureTooltip from "../ui/featureTooltip";

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
  net_monthly: number;
  net_weekly: number;
}

const IncomeTaxCalculator: React.FC = () => {
  const [salary, setSalary] = useState<number | "">("");
  const [pensionContribution, setPensionContribution] = useState<number | "">(
    ""
  );
  const [maritalStatus, setMaritalStatus] = useState<string>("single");
  const [breakdown, setBreakdown] = useState<IncomeTaxBreakdown | null>(null);
  const [savedBreakdowns, setSavedBreakdowns] = useState<IncomeTaxBreakdown[]>(
    []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [baseIncomeId, setBaseIncomeId] = useState<number | null>(null);
  const [newIncomeId, setNewIncomeId] = useState<number | null>(null);
  const [comparisonData, setComparisonData] = useState<{
    baseIncome: IncomeTaxBreakdown | null;
    newIncome: IncomeTaxBreakdown | null;
  }>({
    baseIncome: null,
    newIncome: null,
  });

  // Fetch saved breakdowns on component load
  useEffect(() => {
    Axios.get("/data/income-tax/")
      .then((response) => {
        const formattedData = response.data.map((income: any) => ({
          ...income,
          salary: parseFloat(income.salary), // Convert to number
          pension_contribution: parseFloat(income.pension_contribution),
          taxable_income: parseFloat(income.taxable_income),
          income_tax: parseFloat(income.income_tax),
          tax_credit: parseFloat(income.tax_credit),
          net_tax: parseFloat(income.net_tax),
          usc: parseFloat(income.usc),
          prsi: parseFloat(income.prsi),
          total_deductions: parseFloat(income.total_deductions),
          net_salary: parseFloat(income.net_salary),
          net_monthly: parseFloat(income.net_monthly),
          net_weekly: parseFloat(income.net_weekly),
        }));
        setSavedBreakdowns(formattedData);
      })
      .catch((error) => {
        console.error("Error fetching saved breakdowns:", error);
      });
  }, []);

  const calculateTaxBreakdown = () => {
    if (salary === "" || pensionContribution === "") {
      toast({ title: "Please Provide Valid Inputs!", variant: "destructive" });
      return;
    }
    // Calculating the taxable income
    const taxableIncome = salary - pensionContribution;
    // Calculate income tax
    const standardRateCutoff = 44000;
    const standardRate = 0.2;
    const higherRate = 0.4;
    let incomeTax = 0;
    let taxCredit = 0;
    let net_tax = 0;

    if (taxableIncome >= 20000) {
      // Apply tax bands
      if (taxableIncome <= standardRateCutoff) {
        incomeTax = taxableIncome * standardRate;
      } else {
        incomeTax =
          standardRateCutoff * standardRate +
          (taxableIncome - standardRateCutoff) * higherRate;
      }
      // Apply credit only if income tax exists
      taxCredit = 4000;
      net_tax = incomeTax - taxCredit;
      if (net_tax < 0) net_tax = 0; // Ensure net_tax doesn’t go negative
    }

    // Calculating USC
    let usc = 0;
    if (salary > 13000) {
      usc += Math.min(12012, salary) * 0.005;
      if (salary > 12012) usc += Math.min(15370, salary - 12012) * 0.02;
      if (salary > 27382) usc += (salary - 27382) * 0.03;
    }
    // Calculating PRSI owed
    const weeklyIncome = salary / 52;
    let prsi = 0;

    if (weeklyIncome > 424) {
      // No credit, full PRSI
      prsi = salary * 0.041;
    } else if (weeklyIncome > 352.01) {
      // Tapered credit appling
      const creditPerWeek = 12 - (weeklyIncome - 352.01) / 6;
      const annualCredit = Math.max(0, Math.min(12, creditPerWeek)) * 52;
      prsi = salary * 0.041 - annualCredit;
    } else {
      // No PRSI if earning <= €352/week
      prsi = 0;
    }

    // Total deductions
    const totalDeductions = net_tax + usc + prsi;
    // Net salary
    const netSalary = salary - totalDeductions - pensionContribution;
    const netMonthly = netSalary / 12;
    const netWeekly = netSalary / 52;
    // Prepare the breakdown object
    const calculatedBreakdown: IncomeTaxBreakdown = {
      id: savedBreakdowns.length + 1,
      salary,
      pension_contribution: pensionContribution,
      taxable_income: parseFloat(taxableIncome.toFixed(2)),
      income_tax: parseFloat(incomeTax.toFixed(2)),
      tax_credit: taxCredit,
      net_tax: parseFloat(net_tax.toFixed(2)),
      usc: parseFloat(usc.toFixed(2)),
      prsi: parseFloat(prsi.toFixed(2)),
      total_deductions: parseFloat(totalDeductions.toFixed(2)),
      net_salary: parseFloat(netSalary.toFixed(2)),
      net_monthly: parseFloat(netMonthly.toFixed(2)),
      net_weekly: parseFloat(netWeekly.toFixed(2)),
    };

    setBreakdown(calculatedBreakdown); // Update state
  };

  // Save the breakdown to the backend
  const saveBreakdown = () => {
    if (!breakdown || isSaving) return;

    setIsSaving(true);

    Axios.post("/data/income-tax/", breakdown)
      .then((response) => {
        toast({
          title: "Salary saved successfully!",
        });

        // Add the saved breakdown to the list with the returned ID
        setSavedBreakdowns((prev) => [
          ...prev,
          { ...breakdown, id: response.data.id },
        ]);

        // Clear state after saving
        setSalary("");
        setPensionContribution("");
        setMaritalStatus("single");
        setBreakdown(null);
      })
      .catch((error) => {
        console.error("Error saving tax breakdown:", error);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  // Remove a saved salary
  const handleRemoveSalary = (id: number) => {
    Axios.delete(`/data/income-tax/${id}/`)
      .then(() => {
        setSavedBreakdowns((prevBreakdowns) =>
          prevBreakdowns.filter((breakdown) => breakdown.id !== id)
        );
        toast({
          title: "Salary removed successfully!",
          variant: "successfull",
        });
      })
      .catch((error) => {
        console.error("Error removing salary:", error);
        toast({
          title: "Failed to remove the salary. Please try again.",
          variant: "destructive",
        });
      });
  };

  // Toggle the expansion of the card
  const toggleCardExpansion = (id: number) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  // Compare two incomes
  const compareIncomes = () => {
    const baseIncome = savedBreakdowns.find(
      (income) => income.id === baseIncomeId
    );
    const newIncome = savedBreakdowns.find(
      (income) => income.id === newIncomeId
    );

    if (!baseIncome || !newIncome) {
      alert("Please select both incomes to compare.");
      return;
    }

    setComparisonData({ baseIncome, newIncome });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Income Tax Calculator
      </h1>

      {/* Responsive Grid for Inputs and Saved Salaries */}
      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* Input Section */}
        <FeatureTooltip content="Calculate different income levels to see the effect on tax and net pay.">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-center">
                Calculate Tax Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="salary">Enter Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  min="0"
                  value={salary}
                  onChange={(e) =>
                    setSalary(
                      e.target.value == "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder="Enter your gross salary amount per annum (€)"
                  className="w-full"
                />
              </div>
              <div className="space-y-4 mt-4">
                <Label htmlFor="pension">Enter Pension Contribution</Label>
                <Input
                  id="pension"
                  type="number"
                  min="0"
                  value={pensionContribution}
                  onChange={(e) =>
                    setPensionContribution(
                      e.target.value == "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder="Enter your pension contribution amount per annum (€)"
                  className="w-full"
                />
              </div>
              <div className="space-y-4 mt-4">
                <Label htmlFor="marital-status">Marital Status</Label>
                <select
                  id="marital-status"
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                </select>
              </div>
              <Button
                onClick={calculateTaxBreakdown}
                className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white"
              >
                Calculate
              </Button>
            </CardContent>
          </Card>
        </FeatureTooltip>

        {/* Saved Salaries Section */}
        {savedBreakdowns.length > 0 ? (
          <FeatureTooltip content="Your saved incomes with detailed breakdowns and tax rate chart.">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-center">
                  Saved Incomes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedBreakdowns.map((income) => (
                    <div
                      key={income.id}
                      className="border border-gray-300 rounded-md p-4 shadow-md"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p>
                            <strong>Salary:</strong> €{income.salary.toFixed(2)}
                          </p>
                          <p>
                            <strong>Pension:</strong> €
                            {income.pension_contribution.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => toggleCardExpansion(income.id)}
                          >
                            {expandedCardId === income.id
                              ? "Collapse"
                              : "Expand"}
                          </Button>
                          <Button
                            className="bg-red-600 text-white"
                            onClick={() => handleRemoveSalary(income.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      {expandedCardId === income.id && (
                        <div className="mt-4">
                          <Carousel>
                            <CarouselContent>
                              <CarouselItem>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="text-left w-16">
                                        Type
                                      </TableHead>
                                      <TableHead className="text-right">
                                        Amount (€)
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {income ? (
                                      <>
                                        <TableRow>
                                          <TableCell className="text-left">
                                            Taxable Income
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {income.taxable_income.toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell className="text-left">
                                            Income Tax
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {income.income_tax.toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell className="text-left">
                                            Tax Credit
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {income.tax_credit.toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell className="text-left">
                                            Net Tax
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {income.net_tax.toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell className="text-left">
                                            USC
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {income.usc.toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell className="text-left">
                                            PRSI
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {income.prsi.toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell className="text-left">
                                            Total Deductions
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {income.total_deductions.toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                        <TableRow className="bg-neutral-300 hover:bg-neutral-300">
                                          <TableCell className="font-semibold text-left">
                                            Net Salary
                                          </TableCell>
                                          <TableCell className="font-semibold text-right">
                                            {income.net_salary.toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                        <TableRow className="bg-neutral-300 hover:bg-neutral-300">
                                          <TableCell className="font-semibold text-left">
                                            Net Monthly
                                          </TableCell>
                                          <TableCell className="font-semibold text-right">
                                            {income.net_monthly.toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                        <TableRow className="bg-neutral-300 hover:bg-neutral-300">
                                          <TableCell className="font-semibold text-left">
                                            Net Weekly
                                          </TableCell>
                                          <TableCell className="font-semibold text-right">
                                            {income.net_weekly.toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                      </>
                                    ) : (
                                      <TableRow>
                                        <TableCell
                                          colSpan={2}
                                          className="text-center text-gray-500"
                                        >
                                          No breakdown available.
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </CarouselItem>
                              <CarouselItem>
                                {/* Income Breakdown Chart */}
                                <div>
                                  <IncomeBreakdownChart
                                    grossSalary={income.taxable_income}
                                    netIncome={income.net_salary}
                                    taxesPaid={income.total_deductions}
                                    pensionContribution={
                                      income.pension_contribution
                                    }
                                  />
                                </div>
                              </CarouselItem>
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                          </Carousel>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FeatureTooltip>
        ) : (
          <IncomePlaceholder type="breakdown" />
        )}
      </div>

      {/* Breakdown Section (Below Inputs and Saved) */}
      {breakdown && (
        <div className="border border-gray-300 rounded-md p-4 shadow-md mt-6">
          <Carousel>
            <CarouselContent>
              <CarouselItem>
                <h2 className="text-xl font-semibold mb-4">Tax Breakdown</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left w-16">Type</TableHead>
                      <TableHead className="text-right">Amount (€)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {breakdown ? (
                      <>
                        <TableRow>
                          <TableCell className="text-left">
                            Taxable Income
                          </TableCell>
                          <TableCell className="text-right">
                            {breakdown.taxable_income.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-left">
                            Income Tax
                          </TableCell>
                          <TableCell className="text-right">
                            {breakdown.income_tax.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-left">
                            Tax Credit
                          </TableCell>
                          <TableCell className="text-right">
                            {breakdown.tax_credit.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-left">Net Tax</TableCell>
                          <TableCell className="text-right">
                            {breakdown.net_tax.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-left">USC</TableCell>
                          <TableCell className="text-right">
                            {breakdown.usc.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-left">PRSI</TableCell>
                          <TableCell className="text-right">
                            {breakdown.prsi.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-left">
                            Total Deductions
                          </TableCell>
                          <TableCell className="text-right">
                            {breakdown.total_deductions.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-neutral-300 hover:bg-neutral-300">
                          <TableCell className="font-semibold text-left">
                            Net Salary
                          </TableCell>
                          <TableCell className="font-semibold text-right">
                            {breakdown.net_salary.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-neutral-300 hover:bg-neutral-300">
                          <TableCell className="font-semibold text-left">
                            Net Monthly
                          </TableCell>
                          <TableCell className="font-semibold text-right">
                            {breakdown.net_monthly.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-neutral-300 hover:bg-neutral-300">
                          <TableCell className="font-semibold text-left">
                            Net Weekly
                          </TableCell>
                          <TableCell className="font-semibold text-right">
                            {breakdown.net_weekly.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </>
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-center text-gray-500"
                        >
                          No breakdown available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <Button
                  onClick={saveBreakdown}
                  className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  {isSaving ? "Saving..." : "Save Breakdown"}
                </Button>
              </CarouselItem>

              <CarouselItem>
                {/* Income Breakdown Chart */}
                <div>
                  <IncomeBreakdownChart
                    grossSalary={breakdown.taxable_income}
                    netIncome={breakdown.net_salary}
                    taxesPaid={breakdown.total_deductions}
                    pensionContribution={breakdown.pension_contribution}
                  />
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}

      {/* Comparison Section */}
      {savedBreakdowns.length > 1 ? (
        <FeatureTooltip content="Compare different incomes to see how they can affect your every day life.">
          <Card className="hover:shadow-md transition-shadow mt-8">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-center">
                Compare Salaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label>Select Base Income</Label>
                <Select
                  onValueChange={(value) => setBaseIncomeId(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Base Income" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedBreakdowns.map((income) => (
                      <SelectItem key={income.id} value={String(income.id)}>
                        Salary: €{income.salary.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Select New Income</Label>
                <Select
                  onValueChange={(value) => setNewIncomeId(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select New Income" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedBreakdowns.map((income) => (
                      <SelectItem key={income.id} value={String(income.id)}>
                        Salary: €{income.salary.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={compareIncomes}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  Compare
                </Button>
              </div>
            </CardContent>
          </Card>
        </FeatureTooltip>
      ) : (
        <IncomePlaceholder type="comparison" />
      )}

      {comparisonData.baseIncome && comparisonData.newIncome && (
        <IncomeComparison
          data={{
            baseIncome: comparisonData.baseIncome,
            newIncome: comparisonData.newIncome,
          }}
        />
      )}
    </div>
  );
};

export default IncomeTaxCalculator;
