import React, { useState, useEffect } from "react";
import Axios from "./Axios";
import {
  Button,
  Typography,
  TextField,
  Box,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import BudgetChart from "./charts/BudgetChart";

interface CustomBudget {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  items: { id: number; value: number; label: string; type: string }[];
}

const CustomBudget: React.FC = () => {
  const [customBudgets, setCustomBudgets] = useState<CustomBudget[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const navigate = useNavigate();

  // Fetch all custom budgets
  const fetchCustomBudgets = () => {
    Axios.get("data/custom-budget/")
      .then((response) => {
        setCustomBudgets(response.data);
      })
      .catch((error) => {
        console.error("Error fetching custom budgets:", error);
      });
  };

  useEffect(() => {
    fetchCustomBudgets();
  }, []);

  // Toggle form visibility
  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  // Create a new custom budget
  const handleCreateBudget = () => {
    if (!name.trim() || !startDate || !endDate) {
      console.error("All fields are required to create a new budget.");
      return;
    }

    const payload = {
      name,
      start_date: startDate.format("YYYY-MM-DD"),
      end_date: endDate.format("YYYY-MM-DD"),
    };

    Axios.post("data/custom-budget/", payload)
      .then(() => {
        fetchCustomBudgets();
        setName("");
        setStartDate(null);
        setEndDate(null);
        setIsFormVisible(false); // Hide the form after submission
      })
      .catch((error) => {
        console.error("Error creating custom budget:", error.response?.data);
      });
  };

  return (
    <Box sx={{ padding: "16px" }}>
      <Typography variant="h4" align="center" style={{ marginBottom: 16 }}>
        Your Custom Budgets
      </Typography>

      {/* Toggle Button for the Form */}
      <Box sx={{ textAlign: "center", marginBottom: "16px" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={toggleFormVisibility}
        >
          {isFormVisible ? "Hide Form" : "Add New Budget"}
        </Button>
      </Box>

      {/* Conditional Form Rendering */}
      {isFormVisible && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            marginBottom: 4,
            background: "#f9f9f9",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <Typography variant="h6">Create a New Custom Budget</Typography>
          <TextField
            label="Budget Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate ? startDate.format("YYYY-MM-DD") : ""}
              onChange={(e) => setStartDate(dayjs(e.target.value))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate ? endDate.format("YYYY-MM-DD") : ""}
              onChange={(e) => setEndDate(dayjs(e.target.value))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateBudget}
          >
            Create Budget
          </Button>
        </Box>
      )}

      {/* Display Budgets */}
      <Typography variant="h6" style={{ marginBottom: "16px" }}>
        Your Budgets
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "16px",
        }}
      >
        {customBudgets.map((budget) => (
          <Card
            key={budget.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "250px",
              cursor: "pointer",
              "&:hover": { boxShadow: 6 },
            }}
            onClick={() => navigate(`/custom-budget/${budget.id}`)}
          >
            <CardContent>
              <Typography variant="h6">{budget.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                Start: {budget.start_date}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                End: {budget.end_date}
              </Typography>
            </CardContent>
            <Box sx={{ padding: "8px" }}>
              <BudgetChart data={budget.items} />
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default CustomBudget;
