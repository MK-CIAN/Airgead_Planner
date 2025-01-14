import React, { useState, useEffect } from "react";
import Axios from "./Axios";
import {
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";

interface CustomBudget {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}

const CustomBudget: React.FC = () => {
  const [customBudgets, setCustomBudgets] = useState<CustomBudget[]>([]);
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

      {/* Create New Budget Form */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 4 }}>
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

      {/* Grid View of Budgets */}
      <Grid container spacing={3}>
        {customBudgets.map((budget) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={budget.id}
            onClick={() => navigate(`/custom-budget/${budget.id}`)}
            style={{ cursor: "pointer" }}
          >
            <Paper elevation={3} style={{ padding: "16px", height: "100%" }}>
              <Typography variant="h6">{budget.name}</Typography>
              <Typography variant="body2">
                Start: {budget.start_date} | End: {budget.end_date}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CustomBudget;
