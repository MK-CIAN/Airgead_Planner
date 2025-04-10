import React, { useState, useEffect } from "react";
import Axios from "../Services/Axios";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Lightbulb, ChartColumn, RefreshCcw, Check, X } from "lucide-react";
import ClassificationCard from "./ClassificationPlaceholder";
import SuggestedAction from "./SuggestedAction";
import AnalyzationChart from "./AnalyzationChart";
import FeatureTooltip from "../ui/featureTooltip";

interface Suggestion {
  id: number;
  suggestion_text: string;
  created_at: string;
  acceptance_rate: number;
  savings_goal?: number;
  loan_id?: number;
}

const FinancialInsights: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [analyzations, setAnalyzations] = useState<Suggestion[]>([]);
  const [userCategory, setUserCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"suggestions" | "analyzations">(
    "suggestions"
  );
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Variables for analyzing spending
  const [needsPct, setNeedsPct] = useState<number | null>(null);
  const [wantsPct, setWantsPct] = useState<number | null>(null);
  const [savingsPct, setSavingsPct] = useState<number | null>(null);
  const [analysisRequested, setAnalysisRequested] = useState<boolean>(false);

  useEffect(() => {
    fetchUserCategory();
    fetchSuggestions();
  }, []);

  const fetchUserCategory = () => {
    Axios.get(`/data/financial-suggestions/classify/`)
      .then((response) => {
        setUserCategory(response.data.user_category || "Balanced");
      })
      .catch((err) => {
        console.error("Error fetching user category:", err);
        setUserCategory("No Classification");
      });
  };

  const fetchSuggestions = () => {
    setLoading(true);
    Axios.get(`/data/financial-suggestions/get-suggestions`)
      .then((response) => {
        setSuggestions(response.data || []);
      })
      .catch((err) => {
        console.error("Error fetching financial suggestions:", err);
        setError("Failed to load suggestions.");
      })
      .finally(() => setLoading(false));
  };

  const fetchAnalyzations = () => {
    setLoading(true);

    Axios.get(`/data/financial-suggestions/analyze/`)
      .then((response) => {
        if (!response.data) {
          setNeedsPct(null);
          setWantsPct(null);
          setSavingsPct(null);
          setAnalyzations([]); // Ensure empty array instead of null
          return;
        }

        const {
          needs_percentage,
          wants_percentage,
          savings_percentage,
          suggestions,
        } = response.data;

        setNeedsPct(needs_percentage ?? null);
        setWantsPct(wants_percentage ?? null);
        setSavingsPct(savings_percentage ?? null);

        // Ensure `suggestions` is an array before setting state
        setAnalyzations(Array.isArray(suggestions) ? suggestions : []);
      })
      .catch((err) => {
        console.error("Error fetching spending analysis:", err);
        setError("Failed to load spending analysis.");
        setAnalyzations([]); // Ensure it's always an array
      })
      .finally(() => setLoading(false));
  };

  const handleGenerateSuggestions = () => {
    Axios.get(`/data/financial-suggestions/generate/`)
      .then(() => {
        toast({ title: "New suggestions generated!" });
        fetchSuggestions();
      })
      .catch((err) => console.error("Error generating suggestions:", err));
  };

  const handleAnalyzeSpending = () => {
    setAnalysisRequested(true); // Ensure chart appears only after clicking Analyze Spending

    Axios.get(`/data/financial-suggestions/analyze/`)
      .then(() => {
        toast({ title: "New analyzations generated!" });
        fetchAnalyzations(); // Correctly fetch budget breakdown & suggestions
      })
      .catch((err) => console.error("Error analyzing spending:", err));
  };

  const handleAccept = (suggestion: any) => {
    console.log("Clicked Accept - Suggestion Data:", suggestion);

    if (!suggestion.id) {
      console.error("Suggestion ID is missing:", suggestion);
      return;
    }

    // First, send the accept request to the backend
    Axios.post(`/data/financial-suggestions/${suggestion.id}/accept/`)
      .then(() => {
        toast({
          title: "Suggestion accepted!",
          description: "Thank you for your feedback.",
          variant: "successfull",
        });

        // Savings or loan suggestion, open the drawer
        if (suggestion.savings_goal || suggestion.loan_id) {
          setSelectedSuggestion(suggestion);
          setIsModalOpen(true);
        }

        fetchSuggestions();
      })
      .catch((err) => console.error("Error accepting suggestion:", err));
  };

  const handleDismiss = (id: number) => {
    Axios.post(`/data/financial-suggestions/${id}/dismiss/`)
      .then(() => {
        toast({
          title: "Suggestion dismissed, removing from list.",
          description: "Thanks for your feedback!",
          variant: "successfull",
        });
        fetchSuggestions();
      })
      .catch((err) => console.error("Error dismissing suggestion:", err));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Financial Insights
      </h1>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Classification Section (Left on Desktop, Top on Mobile) */}
        <ClassificationCard category={userCategory} />

        {/* Suggestions/Analyzations Section (Right on Desktop, Below on Mobile) */}
        <Card className="p-6 shadow-md border border-gray-300">
          <div>
            <div className="flex justify-center space-x-4 mb-4">
              <Button
                className={`px-4 py-2 rounded border transition-all ${
                  viewMode === "suggestions"
                    ? "border-green-600 bg-green-600 text-white hover:bg-green-600 hover:text-white"
                    : "border-green-500 bg-white text-black hover:bg-green-600 hover:text-white"
                }`}
                onClick={() => setViewMode("suggestions")}
              >
                <Lightbulb className="w-16 h-16"></Lightbulb>Suggestions
              </Button>
              <Button
                className={`px-4 py-2 rounded border transition-all ${
                  viewMode === "analyzations"
                    ? "border-green-600 bg-green-600 text-white hover:bg-green-600 hover:text-white"
                    : "border-green-500 bg-white text-black hover:bg-green-600 hover:text-white"
                }`}
                onClick={() => setViewMode("analyzations")}
              >
                <ChartColumn></ChartColumn>Analyzations
              </Button>
            </div>

            <div className="flex justify-center space-x-4 mb-6">
              <AnimatePresence>
                {viewMode === "suggestions" && (
                  <motion.div
                    key="generate-suggestions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      variant="outline"
                      onClick={handleGenerateSuggestions}
                      className="border-green-500 bg-white text-black hover:bg-green-600 hover:text-white"
                    >
                      <RefreshCcw></RefreshCcw>Generate Suggestions
                    </Button>
                  </motion.div>
                )}
                {viewMode === "analyzations" && (
                  <motion.div
                    key="analyze-spending"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      variant="outline"
                      onClick={handleAnalyzeSpending}
                      className="border-green-500 bg-white text-black hover:bg-green-600 hover:text-white"
                    >
                      <RefreshCcw></RefreshCcw>Analyze Spending
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <FeatureTooltip content="This visualizes your budget based on the 50/30/20 rule.">
            <div className="flex justify-center space-x-4 mb-6">
              {viewMode === "analyzations" &&
                analysisRequested &&
                needsPct !== null &&
                wantsPct !== null &&
                savingsPct !== null && (
                  <AnalyzationChart
                    needs={needsPct}
                    wants={wantsPct}
                    savings={savingsPct}
                  />
                )}

              {viewMode === "analyzations" &&
                analysisRequested &&
                needsPct === null &&
                wantsPct === null &&
                savingsPct === null && (
                  <p className="text-center text-gray-500">
                    No budget data available. Click "Analyze Spending" to
                    generate data.
                  </p>
                )}
            </div>
            </FeatureTooltip>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading && <p>Loading...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {(viewMode === "suggestions" ? suggestions : analyzations).map(
                (s) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="shadow-md border border-gray-200 p-4 flex flex-col h-full">
                      <CardHeader>
                        <h3 className="text-lg font-semibold">
                          {viewMode === "suggestions"
                            ? "Suggested Action"
                            : "Suggested Analyzation"}
                        </h3>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-grow">
                        <p className="text-sm">{s.suggestion_text}</p>
                        {viewMode === "suggestions" && (
                          <div className="flex flex-wrap justify-center mt-2 p-2 gap-2 mt-auto">
                            <Button
                              className="bg-green-500 hover:bg-green-600 text-white"
                              variant="default"
                              onClick={() => handleAccept(s)}
                            >
                              <Check></Check>Accept
                            </Button>
                            <Button
                              className="bg-red-600 text-white"
                              variant="destructive"
                              onClick={() => handleDismiss(s.id)}
                            >
                              <X></X>Dismiss
                            </Button>
                          </div>
                        )}
                      </CardContent>
                      {viewMode === "suggestions" && (
                        <FeatureTooltip content="This fiqure is gathered directly from other users.">
                        <CardFooter className="flex items-center justify-center h-10">
                          <p className="text-sm text-gray-500 text-center">
                            {s.acceptance_rate > 0
                              ? `${s.acceptance_rate.toFixed(
                                  1
                                )}% of users have a suggestion like this helpful.`
                              : "No data yet."}
                          </p>
                        </CardFooter>
                        </FeatureTooltip>
                      )}
                    </Card>
                  </motion.div>
                )
              )}
            </div>
          </div>
        </Card>
      </div>

      <SuggestedAction
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        suggestion={selectedSuggestion}
      />
    </div>
  );
};

export default FinancialInsights;
