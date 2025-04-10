import React, { useState } from "react";
import Axios from "../Services/Axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CreateLeague: React.FC = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateLeague = async () => {
    if (!name.trim()) {
      alert("League name is required.");
      return;
    }

    setLoading(true);
    try {
      const response = await Axios.post("data/leagues/", { name });

      // Navigating to the new league's portfolio
      if (response.status === 201) {
        const { league_id } = response.data;
        navigate(`/stocksim?portfolio_type=league&league_id=${league_id}`);
      }
    } catch (error) {
      console.error("Error creating league:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <Card className="p-6 max-w-md">
        <CardHeader>
          <CardTitle>Create a Stock Market League</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label htmlFor="league-name">League Name</Label>
          <Input
            id="league-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter league name"
          />
          <Button className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={handleCreateLeague} disabled={loading}>
            {loading ? "Creating..." : "Create League"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateLeague;
