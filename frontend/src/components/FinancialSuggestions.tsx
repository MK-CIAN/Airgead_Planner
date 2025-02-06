"use client";

import React, { useState, useEffect } from "react";
import Axios from "./Axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface Suggestion {
  id: number;
  suggestion_text: string;
  created_at: string;
}

const FinancialSuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [analyzations, setAnalyzations] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"suggestions" | "analyzations">(
    "suggestions"
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isDrawerOpen) {
      viewMode === "suggestions" ? fetchSuggestions() : fetchAnalyzations();
    }
  }, [isDrawerOpen, viewMode]);

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
        toast({title: "New suggestions generated!"});
        fetchSuggestions();
      })
      .catch((err) => console.error("Error generating suggestions:", err));
  };

  const handleAnalyzeSpending = () => {
    Axios.get(`/data/financial-suggestions/analyze/`)
      .then(() => {
        toast({title: "New analyzations generated!"});
        fetchSuggestions();
      })
      .catch((err) => console.error("Error analyzing spending:", err));
  };

  const handleAccept = (id: number) => {
    Axios.post(`/data/financial-suggestions/${id}/accept/`)
      .then(() => {
        toast({title: "Suggested accepted, removing from list.", description: "Thanks for your feedback!"});
        fetchSuggestions();
      })
      .catch((err) => console.error("Error accepting suggestion:", err));
  };

  const handleDismiss = (id: number) => {
    Axios.post(`/data/financial-suggestions/${id}/dismiss/`)
      .then(() => {
        toast({title: "Suggestion dismmised removing from list.", description: "Thanks for your feedback!"});
        fetchSuggestions();
      })
      .catch((err) => console.error("Error dismissing suggestion:", err));
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={(open) => setIsDrawerOpen(open)}>
      <DrawerTrigger asChild>
        <Button
          variant="default"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          💡 Financial Insights
        </Button>
      </DrawerTrigger>

      {/* Fixed Height & Width for Consistency */}
      <DrawerContent className="fixed inset-x-0 bottom-0 w-full max-h-[70vh] bg-white shadow-lg rounded-t-lg overflow-hidden">
        <DrawerHeader className="p-4">
          <DrawerTitle>Financial Suggestions & Analysis</DrawerTitle>

          {/* Toggle Buttons for View Mode */}
          <div className="flex justify-center space-x-2">
            <Button
              className={`px-4 py-2 rounded border transition-all ${
                viewMode === "suggestions"
                  ? "border-green-600 bg-green-600 text-white hover:bg-green-600 hover:text-white"
                  : "border-green-500 bg-white text-black hover:bg-green-600 hover:text-white"
              }`}
              onClick={() => setViewMode("suggestions")}
            >
              💡 Suggestions
            </Button>
            <Button
              className={`px-4 py-2 rounded border transition-all ${
                viewMode === "analyzations"
                  ? "border-green-600 bg-green-600 text-white hover:bg-green-600 hover:text-white"
                  : "border-green-500 bg-white text-black hover:bg-green-600 hover:text-white"
              }`}
              onClick={() => setViewMode("analyzations")}
            >
              📊 Analyzations
            </Button>
          </div>

          {/* Show Generate Buttons Only When Corresponding Section is Active */}
          <div className="flex justify-center mt-2">
            <AnimatePresence>
              {viewMode === "suggestions" && (
                <motion.div
                  key="generate-suggestions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button variant="outline" onClick={handleGenerateSuggestions} className="border-green-500 bg-white text-black hover:bg-green-600 hover:text-white">
                    🔄 Generate Suggestions
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
                  <Button variant="outline" onClick={handleAnalyzeSpending} className="border-green-500 bg-white text-black hover:bg-green-600 hover:text-white">
                    📊 Analyze Spending
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DrawerHeader>

        {/* Maintains Fixed Height to Prevent Jumps */}
        <div className="flex space-x-4 overflow-x-auto p-4 h-[50vh] overflow-y-auto">
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {viewMode === "suggestions" &&
            suggestions.length === 0 &&
            !loading && <p className="text-gray-500">No new suggestions.</p>}
          {viewMode === "analyzations" &&
            analyzations.length === 0 &&
            !loading && (
              <p className="text-gray-500">No analysis results available.</p>
            )}

          {(viewMode === "suggestions" ? suggestions : analyzations).map(
            (s) => (
              <Card
                key={s.id}
                className="w-72 min-w-[20rem] max-w-xs md:max-w-sm lg:max-w-md flex flex-col justify-between p-4 shadow-md border border-gray-200"
              >
                <CardHeader>
                  <h3 className="text-lg font-semibold">
                    {viewMode === "suggestions"
                      ? "Suggested Action"
                      : "Analysis Result"}
                  </h3>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="line-clamp-3 text-sm">{s.suggestion_text}</p>
                </CardContent>

                {/* Buttons now aligned at the bottom of the card */}
                {viewMode === "suggestions" && (
                  <div className="flex justify-end items-center space-x-2 mt-auto">
                    <Button
                      variant="default"
                      onClick={() => handleAccept(s.id)}
                    >
                      ✔ Accept
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDismiss(s.id)}
                    >
                      ✖ Dismiss
                    </Button>
                  </div>
                )}
              </Card>
            )
          )}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="mt-4">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default FinancialSuggestions;
