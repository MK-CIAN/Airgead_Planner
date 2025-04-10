import React, { useState, useEffect, useRef } from "react";
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
import Axios from "../Services/Axios";
import { toast } from "@/hooks/use-toast";
import { PensionGrowthChart } from "./PensionGrowthChart";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import PensionPlaceholder from "../Placeholders/PensionPlaceholder";
import FeatureTooltip from "../ui/featureTooltip";

interface PensionProjection {
  id: number;
  starting_age: number;
  retirement_age: number;
  annual_salary: string;
  contribution_rate: string;
  employer_match: string;
  roi: string;
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
  const [expandedProjection, setExpandedProjection] =
    useState<PensionProjection | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const projectionRef = useRef<HTMLDivElement | null>(null);

  // Fetch saved projections from the backend
  useEffect(() => {
    Axios.get(`data/pension-planner/`)
      .then((response) => {
        const formattedData = response.data.map((proj: any) => ({
          ...proj,
          total_contributions: proj.total_contributions
            ? parseFloat(proj.total_contributions)
            : 0,
          total_growth: proj.total_growth ? parseFloat(proj.total_growth) : 0,
          final_pension_balance: proj.final_pension_balance
            ? parseFloat(proj.final_pension_balance)
            : 0,
        }));
        setSavedProjections(formattedData);
      })
      .catch((error) =>
        console.error("Error fetching saved pension projections:", error)
      );
  }, []);

  // Calculate the pension projection
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
      Number(annualSalary) *
      ((Number(contributionRate) + Number(employerMatch)) / 100);

    // Convert ROI to decimal
    const rateOfReturn = Number(roi) / 100;
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
      starting_age: Number(startingAge),
      retirement_age: Number(retirementAge),
      annual_salary: annualSalary.toString(),
      contribution_rate: contributionRate.toString(),
      employer_match: employerMatch.toString(),
      roi: roi.toString(),
      total_contributions: parseFloat(totalContributions.toFixed(2)) || 0,
      total_growth: parseFloat(totalGrowth.toFixed(2)) || 0,
      final_pension_balance: parseFloat(futureValue.toFixed(2)) || 0,
    };

    setProjection(calculatedProjection);
    setExpandedProjection(calculatedProjection); // Expand the new projection
    setExpandedCardId(null); // Collapse any previously expanded projection
    toast({ title: "Projection calculated successfully!" });

    setTimeout(() => {
      if (projectionRef.current) {
        projectionRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 300);
  };
  
  // Toggle the expansion of a saved projection card
  const toggleCardExpansion = (id: number) => {
    if (expandedCardId === id) {
      setExpandedCardId(null);
      setExpandedProjection(null); // Clear expanded projection
    } else {
      const expanded = savedProjections.find((proj) => proj.id === id);

      if (expanded) {
        setExpandedCardId(id);
        setExpandedProjection({
          ...expanded,
          total_contributions: Number(expanded.total_contributions) || 0,
          total_growth: Number(expanded.total_growth) || 0,
          final_pension_balance: Number(expanded.final_pension_balance) || 0,
        });

        setTimeout(() => {
          if (projectionRef.current) {
            projectionRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 300);
      }
    }
  };

  // Remove a saved projection
  const handleRemovePension = (id: number) => {
    Axios.delete(`/data/pension-planner/${id}/`)
      .then(() => {
        setSavedProjections((prevProjections) =>
          prevProjections.filter((projection) => projection.id !== id)
        );
        // If the removed projection was expanded, clear the expanded state
        if (expandedProjection?.id === id) {
          setExpandedProjection(null);
          setExpandedCardId(null);
        }
        toast({
          title: "Pension removed successfully!",
          variant: "successfull",
        });
      })
      .catch((error) => {
        console.error("Error removing pension:", error);
        toast({
          title: "Failed to remove pension. Please try again.",
          variant: "destructive",
        });
      });
  };

  // Save the current projection
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

      {/* Grid Layout for Form & Saved Projections */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 items-start">
        {/* Left Side - Input Section */}
        <FeatureTooltip content="Calculate a pension projection to see your possible retirement savings.">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-center">
                Calculate Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label>Starting Age</Label>
              <Input
                type="number"
                value={startingAge}
                placeholder="What age are you now?"
                onChange={(e) => {
                  const val = e.target.value;
                  setStartingAge(val === "" ? "" : Number(val));
                }}
                data-testid="starting-age-input"
              />

              <Label>Retirement Age</Label>
              <Input
                type="number"
                value={retirementAge}
                placeholder="What age do you want to retire?"
                onChange={(e) =>
                  setRetirementAge(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                data-testid="retirement-age-input"
              />

              <Label>Annual Salary (€)</Label>
              <Input
                type="number"
                value={annualSalary}
                placeholder="What is your annual salary?"
                onChange={(e) =>
                  setAnnualSalary(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                data-testid="annual-salary-input"
              />

              <Label>Contribution Rate (%)</Label>
              <Input
                type="number"
                value={contributionRate}
                placeholder="What percentage of your salary do you contribute?"
                onChange={(e) =>
                  setContributionRate(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                data-testid="contribution-rate-input"
              />

              <Label>Employer Match (%)</Label>
              <Input
                type="number"
                value={employerMatch}
                placeholder="What percentage does your employer match?"
                onChange={(e) =>
                  setEmployerMatch(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                data-testid="employer-match-input"
              />

              <Label>Rate of Return (ROI %)</Label>
              <Input
                type="number"
                value={roi}
                placeholder="Average return rates vary between 5% and 10%"
                onChange={(e) =>
                  setRoi(e.target.value === "" ? "" : Number(e.target.value))
                }
                data-testid="roi-input"
              />

              <div className="flex space-x-2 justify-center mt-4">
                <Button
                  onClick={calculateProjection}
                  data-testid="calculate-pension-button"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Calculate
                </Button>

                <Button
                  onClick={saveProjection}
                  data-testid="save-pension-button"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {isSaving ? "Saving..." : "Save Projection"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </FeatureTooltip>

        {/* Right Side - Saved Projections */}
        {savedProjections.length > 0 ? (
          <FeatureTooltip content="Your saved pension projections expand to show more details.">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-center">
                  Saved Projections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedProjections.map((proj) => (
                    <div
                      key={proj.id}
                      data-testid="saved-pension-card"
                      className="border p-4 rounded-md cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <p>
                        <strong>Starting Age:</strong> {proj.starting_age}
                      </p>
                      <p>
                        <strong>Retirement Age:</strong> {proj.retirement_age}
                      </p>
                      <p>
                        <strong>Final Balance:</strong> €
                        {Number(proj.final_pension_balance || 0).toFixed(2)}
                      </p>
                      <div className="flex justify-center space-x-2">
                        <Button
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => toggleCardExpansion(proj.id)}
                        >
                          {expandedCardId === proj.id ? "Collapse" : "Expand"}
                        </Button>
                        <Button
                          className="bg-red-600 text-white"
                          data-testid="remove-pension-button"
                          onClick={() => handleRemovePension(proj.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FeatureTooltip>
        ) : (
          <PensionPlaceholder />
        )}
      </div>

      {/* Expanded Projection Section */}
      {expandedProjection && (
        <FeatureTooltip content="A breakdown of your calculated pension projection.">
          <div
            ref={projectionRef}
            data-testid="pension-projection-card"
            className="mt-10 flex flex-col items-center"
          >
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
                      €{expandedProjection.total_contributions.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Growth</TableCell>
                    <TableCell>
                      €{expandedProjection.total_growth.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Final Balance</TableCell>
                    <TableCell>
                      €
                      {Number(
                        expandedProjection.final_pension_balance || 0
                      ).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Growth Chart */}
            <div
              data-testid="pension-growth-chart"
              className="mt-10 w-full max-w-4xl"
            >
              <PensionGrowthChart
                annualContribution={
                  Number(expandedProjection.annual_salary) *
                  ((Number(expandedProjection.contribution_rate) +
                    Number(expandedProjection.employer_match)) /
                    100)
                }
                rateOfReturn={Number(expandedProjection.roi) / 100}
                years={
                  expandedProjection.retirement_age -
                  expandedProjection.starting_age
                }
              />
            </div>
          </div>
        </FeatureTooltip>
      )}
    </div>
  );
};

export default PensionPlanner;
