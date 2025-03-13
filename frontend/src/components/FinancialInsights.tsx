import React, { useState, useEffect } from "react";
import Axios from "./Axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Lightbulb, ChartColumn, RefreshCcw, Check, X } from "lucide-react";
import ClassificationCard from "./Placeholders/ClassificationPlaceholder";
import SuggestedAction from "./SuggestedAction";
import AnalyzationChart from "./charts/AnalyzationChart";

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
    Axios.get(`/data/financial-suggestions/get-analyzation`)
      .then((response) => {
        const { needs_percentage, wants_percentage, savings_percentage } =
          response.data;

        setNeedsPct(needs_percentage);
        setWantsPct(wants_percentage);
        setSavingsPct(savings_percentage);
        setAnalyzations(response.data || []);
      })
      .catch((err) => {
        console.error("Error fetching spending analysis:", err);
        setError("Failed to load spending analysis.");
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
    Axios.get(`/data/financial-suggestions/analyze/`)
      .then(() => {
        toast({ title: "New analyzations generated!" });
        fetchAnalyzations();
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

        // savings or loan suggestion, open the drawer
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

            {viewMode === "analyzations" && (
                          <AnalyzationChart 
                            needs={needsPct ?? 0} 
                            wants={wantsPct ?? 0} 
                            savings={savingsPct ?? 0} 
                          />
                        )}

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
                            : "Analysis Result"}
                        </h3>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-grow">

                        <p className="text-sm text-gray-500 mb-2 ">
                          {s.acceptance_rate > 0
                            ? `${s.acceptance_rate.toFixed(
                                1
                              )}% of users accepted this type of suggestion.`
                            : "No data yet."}
                        </p>
                        <p className="text-sm">{s.suggestion_text}</p>
                        {viewMode === "suggestions" && (
                          <div className="flex flex-wrap justify-center mt-2 gap-2 mt-auto">
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
