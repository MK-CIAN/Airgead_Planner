import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Axios from "./Axios";

interface IncomeTaxBreakdown {
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

    console.log("Calculated breakdown:", calculatedBreakdown); // Log the calculated value

    setBreakdown(calculatedBreakdown); // Update state
  };

  const saveBreakdown = () => {
    // Ensure breakdown is not null
    if (!breakdown || isSaving) return;

    setIsSaving(true); // Start loading state
    console.log(breakdown);

    // Use the breakdown directly here
    Axios.post("/data/income-tax/", breakdown)
      .then(() => {
        alert("Tax breakdown saved successfully!");

        // Add the saved breakdown to the savedBreakdowns list
        setSavedBreakdowns((prev) => [...prev, breakdown]);

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
        setIsSaving(false); // Reset loading state
      });
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
          className="w-full bg-blue-500 text-white"
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
                <TableCell>Total Taxable Income</TableCell>
                <TableCell>{breakdown.taxable_income.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Tax Liability</TableCell>
                <TableCell>{breakdown.income_tax.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Personal Tax Credits(minus)</TableCell>
                <TableCell>{breakdown.tax_credit.toFixed(2)}</TableCell>
              </TableRow>
                <TableRow>
                    <TableCell>Net Tax Due</TableCell>
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
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Breakdown"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default IncomeTaxCalculator;
