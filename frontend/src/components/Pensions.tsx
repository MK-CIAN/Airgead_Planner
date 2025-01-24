import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Axios from "./Axios";
import { toast } from "@/hooks/use-toast";
import { PensionGrowthChart } from "./charts/PensionGrowthChart";

interface PensionProjection {
  id: number;
  starting_age: number;
  retirement_age: number;
  annual_salary: number;
  contribution_rate: number;
  employer_match: number;
  roi: number;
  total_contributions: number;
  total_growth: number;
  final_pension_balance: number;
}

const PensionPlanner: React.FC = () => {
  const [startingAge, setStartingAge] = useState<number | "">("");
  const [retirementAge, setRetirementAge] = useState<number | "">("");
  const [annualSalary, setAnnualSalary] = useState<number | "">("");
  const [contributionRate, setContributionRate] = useState<number | "">("");
  const [employerMatch, setEmployerMatch] = useState<number | "">("");
  const [roi, setRoi] = useState<number | "">("");
  const [projection, setProjection] = useState<PensionProjection | null>(null);
  const [savedProjections, setSavedProjections] = useState<PensionProjection[]>(
    []
  );
  const [isSaving, setIsSaving] = useState(false);

  // Fetch saved projections from the backend
  useEffect(() => {
    Axios.get(`data/pension-planner/`)
      .then((response) => {
        const formattedData = response.data.map((proj: any) => ({
          ...proj,
          total_contributions: parseFloat(proj.total_contributions) || 0,
          total_growth: parseFloat(proj.total_growth) || 0,
          final_pension_balance: parseFloat(proj.final_pension_balance) || 0,
        }));
        setSavedProjections(formattedData);
      })
      .catch((error) =>
        console.error("Error fetching saved pension projections:", error)
      );
  }, []);

  const calculateProjection = () => {
    if (
      !startingAge ||
      !retirementAge ||
      !annualSalary ||
      !contributionRate ||
      !employerMatch ||
      !roi
    ) {
      toast({ title: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    const years = retirementAge - startingAge;
    const annualContribution =
      annualSalary * ((contributionRate + employerMatch) / 100);

    // Convert ROI to decimal
    const rateOfReturn = roi / 100;
    console.log("rateOfReturn", rateOfReturn);

    // Corrected Future Value Calculation
    const futureValue =
      annualContribution * (((1 + rateOfReturn) ** years - 1) / rateOfReturn);

    // Total contributions over time
    const totalContributions = annualContribution * years;

    // Total growth
    const totalGrowth = futureValue - totalContributions;

    // Projection object
    const calculatedProjection: PensionProjection = {
      id: savedProjections.length + 1,
      starting_age: startingAge,
      retirement_age: retirementAge,
      annual_salary: annualSalary,
      contribution_rate: contributionRate,
      employer_match: employerMatch,
      roi,
      total_contributions: parseFloat(totalContributions.toFixed(2)),
      total_growth: parseFloat(totalGrowth.toFixed(2)),
      final_pension_balance: parseFloat(futureValue.toFixed(2)),
    };

    console.log("Annual Contribution:", annualContribution);
    console.log("Rate of Return:", rateOfReturn);
    console.log("Years:", years);
    console.log("Future Value:", futureValue);
    setProjection(calculatedProjection);
    toast({ title: "Projection calculated successfully!" });
  };

  const saveProjection = () => {
    if (!projection || isSaving) return;

    setIsSaving(true);

    Axios.post("/data/pension-planner/", projection)
      .then((response: { data: PensionProjection }) => {
        toast({ title: "Projection saved successfully!" });
        setSavedProjections((prev) => [...prev, response.data]);
        setProjection(null);
        setStartingAge("");
        setRetirementAge("");
        setAnnualSalary("");
        setContributionRate("");
        setEmployerMatch("");
        setRoi("");
      })
      .catch((error: any) =>
        console.error("Error saving pension projection:", error)
      )
      .finally(() => setIsSaving(false));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Pension Planner</h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* Input Section */}
        <div>
          <Label>Starting Age</Label>
          <Input
            type="number"
            value={startingAge}
            onChange={(e) => setStartingAge(Number(e.target.value))}
          />
  
          <Label>Retirement Age</Label>
          <Input
            type="number"
            value={retirementAge}
            onChange={(e) => setRetirementAge(Number(e.target.value))}
          />
  
          <Label>Annual Salary (€)</Label>
          <Input
            type="number"
            value={annualSalary}
            onChange={(e) => setAnnualSalary(Number(e.target.value))}
          />
  
          <Label>Contribution Rate (%)</Label>
          <Input
            type="number"
            value={contributionRate}
            onChange={(e) => setContributionRate(Number(e.target.value))}
          />
  
          <Label>Employer Match (%)</Label>
          <Input
            type="number"
            value={employerMatch}
            onChange={(e) => setEmployerMatch(Number(e.target.value))}
          />
  
          <Label>Rate of Return (ROI %)</Label>
          <Input
            type="number"
            value={roi}
            onChange={(e) => setRoi(Number(e.target.value))}
          />
  
          <Button onClick={calculateProjection} className="mt-4">
            Calculate
          </Button>
        </div>
  
        {/* Saved Projections Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Saved Projections</h2>
          {savedProjections.length > 0 ? (
            <div className="space-y-4">
              {savedProjections.map((proj) => (
                <div key={proj.id} className="border p-4 rounded-md">
                  <p>
                    <strong>Starting Age:</strong> {proj.starting_age}
                  </p>
                  <p>
                    <strong>Retirement Age:</strong> {proj.retirement_age}
                  </p>
                  <p>
                    <strong>Final Balance:</strong> €
                    {proj.final_pension_balance.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No saved projections yet.</p>
          )}
        </div>
      </div>
  
      {/* Centered Breakdown Table and Chart */}
      {projection && (
        <div className="mt-10 flex flex-col items-center">
          {/* Breakdown Table */}
          <div className="w-full max-w-3xl">
            <h2 className="text-xl font-bold mb-4 text-center">
              Projection Details
            </h2>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell>Value (€)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Total Contributions</TableCell>
                  <TableCell>
                    €{projection.total_contributions.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total Growth</TableCell>
                  <TableCell>€{projection.total_growth.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Final Balance</TableCell>
                  <TableCell>
                    €{projection.final_pension_balance.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Button onClick={saveProjection} className="mt-4 w-full">
              {isSaving ? "Saving..." : "Save Projection"}
            </Button>
          </div>
  
          {/* Growth Chart */}
          <div className="mt-10 w-full max-w-4xl">
            <PensionGrowthChart
              annualContribution={
                projection.annual_salary *
                ((projection.contribution_rate + projection.employer_match) / 100)
              }
              rateOfReturn={projection.roi / 100}
              years={projection.retirement_age - projection.starting_age}
            />
          </div>
        </div>
      )}
    </div>
  );  
};

export default PensionPlanner;
