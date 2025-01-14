import React, { useState, useEffect } from "react";
import {
  Popover,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Typography,
} from "@mui/material";
import Axios from "./Axios";

interface Friend {
  id: number;
  username: string;
  status: "none" | "pending" | "joined"; // Relationship with the budget
}

interface ShowFriendsProps {
  onInvite: (friendId: number) => void; // Function to handle inviting a friend
  triggerElement: React.ReactNode; // The element that triggers the popup
  budgetId: string | undefined; // Current budget ID to check contributors
}

const ShowFriends: React.FC<ShowFriendsProps> = ({
  onInvite,
  triggerElement,
  budgetId,
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await Axios.get(`/friends/`); // Fetch all friends
        const contributorsResponse = await Axios.get(
          `/data/custom-budget/${budgetId}/`
        ); // Fetch contributors for the budget

        const contributors = contributorsResponse.data.contributors || [];

        // Map friends with their relationship to the budget
        const friendsWithStatus = response.data.map((friend: Friend) => {
          if (contributors.some((c: any) => c.id === friend.id)) {
            return { ...friend, status: "joined" };
          }
          return friend; // Default to "none" unless specified below
        });

        setFriends(friendsWithStatus);
      } catch (error) {
        console.error("Error fetching friends or contributors:", error);
      }
    };

    if (budgetId) fetchFriends(); // Only fetch if budgetId is available
  }, [budgetId]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <div onClick={handleOpen}>{triggerElement}</div>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right", // Anchor to the bottom-left of the button
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left", // Align the popup's top-right corner to the button
        }}
      >
        <Box sx={{ p: 2, width: "300px", maxHeight: 400, overflowY: "auto" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Invite Friends
          </Typography>
          <List>
            {friends.map((friend) => (
              <ListItem
                key={friend.id}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <ListItemText primary={friend.username} />
                {friend.status === "none" ? (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => onInvite(friend.id)}
                  >
                    Invite
                  </Button>
                ) : friend.status === "pending" ? (
                  <Typography color="textSecondary">Invite Pending</Typography>
                ) : (
                  <Typography color="primary">Joined</Typography>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </Popover>
    </>
  );
};

export default ShowFriends;
