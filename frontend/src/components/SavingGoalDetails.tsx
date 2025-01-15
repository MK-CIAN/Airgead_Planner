import React, { useState, useEffect } from "react";
import Axios from "./Axios";
import { useParams } from "react-router-dom";
import {
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import ShowFriends from "./ShowFriends";
import SavingsChart from "./charts/SavingsChart";

interface Contributor {
  id: number;
  username: string;
}

interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  contributors: Contributor[];
}

const SavingsGoalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [savingsGoal, setSavingsGoal] = useState<SavingsGoal | null>(null);

  useEffect(() => {
    Axios.get(`data/savings/${id}/`)
      .then((response) => {
        const data = response.data;

        // Ensure amounts are numbers
        setSavingsGoal({
          ...data,
          current_amount: Number(data.current_amount),
          target_amount: Number(data.target_amount),
        });
      })
      .catch((error) => console.error("Error fetching savings goal:", error));
  }, [id]);

  const handleInviteFriend = async (friendId: number) => {
    Axios.post(`data/savings/${id}/invite-friend/`, {
        friend_id: friendId,
    })
      .then(() => alert("Contributor invited!"))
      .catch((error) => console.error("Error inviting contributor:", error));
  };

  if (!savingsGoal) {
    return <Typography>Loading...</Typography>;
  }

  const progress = (savingsGoal.current_amount / savingsGoal.target_amount) * 100;

  return (
    <Box sx={{ padding: "16px" }}>
      <Typography variant="h4">{savingsGoal.name}</Typography>
      <Typography>
        Current Amount: €{savingsGoal.current_amount.toFixed(2)} / €
        {savingsGoal.target_amount.toFixed(2)}
      </Typography>

      {/* Savings Chart */}
      <SavingsChart progress={progress} />

      <Typography variant="h6" style={{ marginTop: "16px" }}>
        Contributors
      </Typography>
      <List>
        {savingsGoal.contributors.map((contributor) => (
          <ListItem key={contributor.id}>
            <ListItemText primary={contributor.username} />
          </ListItem>
        ))}
      </List>
      <ShowFriends
        entityId={id} // Savings Goal ID
        entityType="savingsGoal" // Context is savings goal
        onInvite={handleInviteFriend}
        triggerElement={
          <Button variant="contained" color="primary">
            Invite Friends
          </Button>
        }
      />
    </Box>
  );
};

export default SavingsGoalDetails;
