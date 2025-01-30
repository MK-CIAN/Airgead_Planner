import React, { useState, useEffect } from "react";
import Axios from "./Axios"; // ✅ Uses Axios instance for API calls
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Suggestion {
  id: number;
  suggestion_text: string;
  created_at: string;
}

const FinancialSuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing suggestions from the API
  const fetchSuggestions = () => {
    Axios.get(`/data/financial-suggestions/`)
      .then((response) => {
        setSuggestions(response.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching financial suggestions:", err);
        setError("Failed to load suggestions.");
        setLoading(false);
      });
  };

  // Generate new suggestions manually
  const handleGenerateSuggestions = () => {
    Axios.get(`/data/financial-suggestions/generate/`)
      .then(() => {
        alert("New suggestions generated!");
        fetchSuggestions(); // Fetch updated suggestions
      })
      .catch((err) => console.error("Error generating suggestions:", err));
  };

  // Accept a suggestion
  const handleAccept = (id: number) => {
    Axios.post(`/data/financial-suggestions/${id}/accept/`)
      .then(() => {
        alert("Suggestion accepted!");
        fetchSuggestions();
      })
      .catch((err) => console.error("Error accepting suggestion:", err));
  };

  // Dismiss a suggestion
  const handleDismiss = (id: number) => {
    Axios.post(`/data/financial-suggestions/${id}/dismiss/`)
      .then(() => {
        alert("Suggestion dismissed!");
        fetchSuggestions();
      })
      .catch((err) => console.error("Error dismissing suggestion:", err));
  };

  useEffect(() => {
    fetchSuggestions(); // Automatically load existing suggestions
  }, []);

  return (
    <div className="max-w-lg mx-auto mt-6">
      <h2 className="text-xl font-bold">Financial Suggestions</h2>

      <Button variant="default" onClick={handleGenerateSuggestions} className="mb-4">
        🔄 Generate Suggestions
      </Button>

      {loading && <p>Loading suggestions...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {suggestions.length === 0 && !loading && <p className="text-gray-500">No new suggestions.</p>}

      {suggestions.map((s) => (
        <Card key={s.id} className="mt-4">
          <CardHeader>
            <h3 className="text-lg font-semibold">Suggested Action</h3>
          </CardHeader>
          <CardContent>
            <p>{s.suggestion_text}</p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="default" onClick={() => handleAccept(s.id)}>
                ✔ Accept
              </Button>
              <Button variant="destructive" onClick={() => handleDismiss(s.id)}>
                ✖ Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FinancialSuggestions;
