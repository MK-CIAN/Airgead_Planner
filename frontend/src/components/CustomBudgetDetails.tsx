import React, { useState, useEffect } from "react";
import Axios from "./Axios";
import BudgetChart from "./charts/BudgetChart";
import CustomBudgetForm from "./forms/CustomBudgetForm";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import ShowFriends from "./ShowFriends";
import "../App.css";
import ChatRoom from "./ChatRoom";
import TestBudgetChart from "./charts/TestBudgetChart";

interface BudgetData {
  id: number;
  value: number;
  label: string;
  type: string;
}

interface Contributor {
  id: number;
  email: string;
}

const CustomBudgetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect mobile view

  const [budgetName, setBudgetName] = useState<string | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch custom budget details
  const fetchBudgetDetails = async () => {
    try {
      const response = await Axios.get(`data/custom-budget/${id}/`);
      const data = response.data;

      setBudgetName(data.name);

      // Map items safely
      const formattedData: BudgetData[] = (data.items || []).map(
        (item: any) => ({
          id: item.id,
          value: parseFloat(item.amount),
          label: item.category,
          type: item.transaction_type,
        })
      );
      setBudgetData(formattedData);
      setContributors(data.contributors || []);
    } catch (error) {
      console.error("Error fetching budget details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetDetails();
  }, [id]);

  const handleAddBudgetItem = (newItem: {
    amount: string;
    category: string;
    transaction_type: string;
  }) => {
    if (isSubmitting) return; // Prevent duplicate submissions
    setIsSubmitting(true);

    Axios.post(`data/custom-budget/${id}/items/`, newItem)
      .then((response) => {
        const savedItem = response.data;

        // Update state with the new item
        setBudgetData((prevData) => [
          ...prevData,
          {
            id: savedItem.id,
            value: parseFloat(savedItem.amount),
            label: savedItem.category,
            type: savedItem.transaction_type,
          },
        ]);
      })
      .catch((error) => {
        console.error("Error adding budget item:", error);
      })
      .finally(() => {
        setIsSubmitting(false); // Re-enable the button
      });
  };

  const handleRemoveBudgetItem = (itemId: number) => {
    Axios.delete(`data/custom-budget/${id}/items/${itemId}/`)
      .then(() => {
        fetchBudgetDetails(); // Refresh the budget data after removing an item
      })
      .catch((error) => {
        console.error("Error removing budget item:", error);
      });
  };

  const handleInviteFriend = async (friendId: number) => {
    try {
      await Axios.post(`data/custom-budget/${id}/invite-friend/`, {
        friend_id: friendId,
      });
      alert("Invitation sent!");
    } catch (error) {
      console.error("Error inviting friend:", error);
    }
  };

  if (loading) {
    return <Typography align="center">Loading...</Typography>;
  }

  if (!budgetName) {
    return <Typography align="center">Budget not found</Typography>;
  }

  return (
    <div style={{ padding: "0 16px" }}>
      <Typography
        variant="h4"
        align="center"
        style={{ marginBottom: 16, fontSize: isMobile ? "1.5rem" : "2rem" }}
      >
        {budgetName}
      </Typography>

      {/* Responsive Layout */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: "16px",
          marginTop: "20px",
        }}
      >
        {/* Add Items Form */}
        <div
          style={{
            flex: "1",
            background: "#f5f5f5",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <Typography variant="h6" style={{ marginBottom: "8px" }}>
            Add Budget Item
          </Typography>
          <CustomBudgetForm onAddBudgetItem={handleAddBudgetItem} />
        </div>

        {/* Budget List */}
        <div
          style={{
            flex: "1",
            overflowY: "auto",
            maxHeight: "300px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "8px",
          }}
        >
          <Typography variant="h6" style={{ marginBottom: "8px" }}>
            Budget Items
          </Typography>
          <List>
            {budgetData.map((item) => (
              <ListItem
                key={item.id}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <ListItemText
                  primary={`${item.label} - €${item.value.toFixed(2)} (${
                    item.type
                  })`}
                />
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={() => handleRemoveBudgetItem(item.id)}
                >
                  Remove
                </Button>
              </ListItem>
            ))}
          </List>
        </div>
      </div>

      {/* Contributors Section */}
      <div style={{ textAlign: "right" }}>
        <ShowFriends
          entityId={id} // Budget ID
          entityType="budget" // Context is budget
          onInvite={handleInviteFriend}
          triggerElement={
            <Button
              variant="contained"
              color="primary"
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                marginTop: "px",
              }}
              className="inviteButton"
            >
              Add Friends
            </Button>
          }
        />
      </div>

      {/* Responsive Budget Chart */}
      <div
        style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}
      >
        <TestBudgetChart data={budgetData} />
      </div>
      <div style={{ marginTop: "20px" }}>
        <h3>Chatroom</h3>
        <ChatRoom entityId={Number(id)} entityType="budget" />
      </div>
    </div>
  );
};

export default CustomBudgetDetails;
