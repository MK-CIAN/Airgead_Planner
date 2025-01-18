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
} from "@/components/ui/table";
import IncomeComparison from "./IncomeComparisons";
import Axios from "../Axios";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "../ui/select";

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
        }));
        setSavedBreakdowns(formattedData);
      })
      .catch((error) => {
        console.error("Error fetching saved breakdowns:", error);
      });
  }, []);

  const calculateTaxBreakdown = () => {
    if (!salary || !pensionContribution) {
      alert("Please provide valid inputs!");
      return;
    }

    // Calculate taxable income
    const taxableIncome = salary - pensionContribution;

    // Tax credit based on marital status
    const taxCredit = maritalStatus === "married" ? 8000 : 4000;

    // Calculate income tax
    const standardRateCutoff = 44000;
    const standardRate = 0.2;
    const higherRate = 0.4;

    let incomeTax = 0;
    if (taxableIncome <= standardRateCutoff) {
      incomeTax = taxableIncome * standardRate;
    } else {
      incomeTax =
        standardRateCutoff * standardRate +
        (taxableIncome - standardRateCutoff) * higherRate;
    }

    // Apply tax credit
    const net_tax = incomeTax - taxCredit;

    // Calculate USC
    let usc = 0;
    if (salary > 13000) {
      usc += Math.min(12012, salary) * 0.005;
      if (salary > 12012) usc += Math.min(15370, salary - 12012) * 0.02;
      if (salary > 27382) usc += (salary - 27382) * 0.03;
    }

    // Calculate PRSI
    const prsi = salary * 0.041;

    // Total deductions
    const totalDeductions = net_tax + usc + prsi;

    // Net salary
    const netSalary = salary - totalDeductions - pensionContribution;

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
    };

    setBreakdown(calculatedBreakdown); // Update state
  };

  const saveBreakdown = () => {
    if (!breakdown || isSaving) return;

    setIsSaving(true);

    Axios.post("/data/income-tax/", breakdown)
      .then((response) => {
        alert("Tax breakdown saved successfully!");

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

  const handleRemoveSalary = (id: number) => {
    Axios.delete(`/data/income-tax/${id}/`)
      .then(() => {
        setSavedBreakdowns((prevBreakdowns) =>
          prevBreakdowns.filter((breakdown) => breakdown.id !== id)
        );
        alert("Salary removed successfully!");
      })
      .catch((error) => {
        console.error("Error removing salary:", error);
        alert("Failed to remove the salary. Please try again.");
      });
  };

  const toggleCardExpansion = (id: number) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Income Tax Calculator
      </h1>

      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="salary">Enter Salary</Label>
          <Input
            id="salary"
            type="number"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            placeholder="Enter your salary"
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="pension">Enter Pension Contribution</Label>
          <Input
            id="pension"
            type="number"
            value={pensionContribution}
            onChange={(e) => setPensionContribution(Number(e.target.value))}
            placeholder="Enter your pension contribution"
            className="w-full"
          />
        </div>
        <div>
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
          className="w-full bg-green-600 text-white"
        >
          Calculate
        </Button>
      </div>

      {breakdown && (
        <div className="border border-gray-300 rounded-md p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tax Breakdown</h2>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Amount (€)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Taxable Income</TableCell>
                <TableCell>{breakdown.taxable_income.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Income Tax</TableCell>
                <TableCell>{breakdown.income_tax.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Tax Credit</TableCell>
                <TableCell>{breakdown.tax_credit.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Net Tax</TableCell>
                <TableCell>{breakdown.net_tax.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>USC</TableCell>
                <TableCell>{breakdown.usc.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>PRSI</TableCell>
                <TableCell>{breakdown.prsi.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Deductions</TableCell>
                <TableCell>{breakdown.total_deductions.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Net Salary</TableCell>
                <TableCell>{breakdown.net_salary.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Button
            onClick={saveBreakdown}
            className="mt-4 w-full bg-green-500 text-white"
          >
            {isSaving ? "Saving..." : "Save Breakdown"}
          </Button>
        </div>
      )}

      <h2 className="text-xl font-bold mt-6">Saved Incomes</h2>
      <div className="space-y-4 mt-4">
        {savedBreakdowns.map((income) => (
          <div
            key={income.id}
            className="border border-gray-300 rounded-md p-4 shadow-md"
            onClick={() => toggleCardExpansion(income.id!)}
          >
            <div className="flex justify-between">
              <div>
                <p>
                  <strong>Salary:</strong> €{income.salary.toFixed(2)}
                </p>
                <p>
                  <strong>Pension:</strong> €
                  {income.pension_contribution.toFixed(2)}
                </p>
              </div>
              <Button className="bg-green-500 text-white">
                {expandedCardId === income.id ? "Collapse" : "Expand"}
              </Button>
              <Button
                className="bg-red-500 text-white"
                onClick={() => handleRemoveSalary(income.id)}
              >
                Remove
              </Button>
            </div>
            {expandedCardId === income.id && (
              <div className="mt-4">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount (€)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Taxable Income</TableCell>
                      <TableCell>{income.taxable_income.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Income Tax</TableCell>
                      <TableCell>{income.income_tax.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Tax Credit</TableCell>
                      <TableCell>{income.tax_credit.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Net Tax</TableCell>
                      <TableCell>{income.net_tax.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>USC</TableCell>
                      <TableCell>{income.usc.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>PRSI</TableCell>
                      <TableCell>{income.prsi.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Deductions</TableCell>
                      <TableCell>
                        {income.total_deductions.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Net Salary</TableCell>
                      <TableCell>{income.net_salary.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="space-y-4 mb-6">
        <Label>Select Base Income</Label>
        <Select onValueChange={(value) => setBaseIncomeId(Number(value))}>
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
        <Select onValueChange={(value) => setNewIncomeId(Number(value))}>
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
          className="w-full bg-green-600 text-white"
        >
          Compare
        </Button>
      </div>

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
