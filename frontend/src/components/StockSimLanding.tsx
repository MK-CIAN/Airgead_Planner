import React, { useState, useEffect } from "react";
import Axios from "./Axios";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "@/hooks/use-toast";

interface League {
  id: string;
  name: string;
  is_creator: boolean;
}

const StockSimLanding: React.FC = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  // ✅ Fetch leagues the user is a member of
  const fetchLeagues = async () => {
    try {
      const response = await Axios.get(`data/leagues/`);
      setLeagues(response.data);
    } catch (error) {
      console.error("Error fetching leagues:", error);
    }
  };

  console.log(leagues);

  useEffect(() => {
    fetchLeagues();
  }, []);

  // ✅ Handle league creation
  const handleCreateLeague = async () => {
    if (!name.trim()) {
      alert("League name is required.");
      return;
    }

    setLoading(true);
    try {
      const response = await Axios.post("data/leagues/", { name });

      if (response.status === 201) {
        setShowForm(false);
        setName(""); // ✅ Reset form
        fetchLeagues(); // ✅ Reload leagues to show the new one
        toast({
          title: "League created successfully!",
          description: "Refreshing Page",
          variant: "successfull",
        }); // ✅ Inform user
      }
    } catch (error) {
      console.error("Error creating league:", error);
    } finally {
      setLoading(false);
    }
  };

  // Universal function for selecting a portfolio
  const handleSelectPortfolio = (
    portfolioType: "personal" | "league",
    leagueId?: string
  ) => {
    navigate(
      `/stocksim?portfolio_type=${portfolioType}${
        leagueId ? `&league_id=${leagueId}` : ""
      }`
    );
  };

  const handleLeaveLeague = async (leagueId: string) => {
    if (!window.confirm("Are you sure you want to leave this league?")) return;

    try {
      await Axios.post(`data/leagues/${leagueId}/leave-league/`);
      fetchLeagues(); // Refresh leagues after leaving
    } catch (error) {
      console.error("Error leaving league:", error);
    }
  };

  const handleDeleteLeague = async (leagueId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this league? This action is irreversible."
      )
    )
      return;

    try {
      await Axios.delete(`data/leagues/${leagueId}/delete-league/`);
      fetchLeagues(); // Refresh leagues after deletion
    } catch (error) {
      console.error("Error deleting league:", error);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Select Your Portfolio</h1>

      {/* Show Create League Button */}
      <div className="text-center">
        <Button
          className="bg-green-500 hover:bg-green-600 text-white"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Hide Form" : "Create New League"}
        </Button>
      </div>

      {/* League Creation Form (Hideable) */}
      {showForm && (
        <div className="mt-4 p-4 border rounded-lg max-w-md w-full">
          <Label htmlFor="league-name">League Name</Label>
          <Input
            id="league-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter league name"
          />
          <Button
            className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white"
            onClick={handleCreateLeague}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create League"}
          </Button>
        </div>
      )}

      {/* List Personal & League Portfolios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Personal Portfolio Card */}
        <Card
          className="cursor-pointer hover:shadow-lg transition"
          onClick={() => handleSelectPortfolio("personal")}
        >
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold">My Portfolio</h2>
            <p className="text-gray-600">Manage your personal investments</p>
          </CardContent>
        </Card>

        {/* League Portfolio Cards */}
        {leagues.length > 0 ? (
          leagues.map((league) => (
            <Card
              key={league.id}
              className="cursor-pointer hover:shadow-lg transition"
            >
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-semibold">{league.name}</h2>
                <p className="text-gray-600">
                  Compete in this stock market league
                </p>

                <div className="flex justify-center gap-4 mt-4">
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => handleSelectPortfolio("league", league.id)}
                  >
                    Enter League
                  </Button>

                  {league.is_creator ? (
                    <Button
                      className="bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => handleDeleteLeague(league.id)}
                    >
                      Delete League
                    </Button>
                  ) : (
                    <Button
                      className="bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => handleLeaveLeague(league.id)}
                    >
                      Leave League
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500 mt-4">
            You haven't joined any leagues yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default StockSimLanding;
