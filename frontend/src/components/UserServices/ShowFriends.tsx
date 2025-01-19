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
import Axios from "../Axios";
import { toast } from "@/hooks/use-toast";

interface Friend {
  id: number;
  username: string;
  status: "none" | "joined"; // Relationship with the entity
}

interface ShowFriendsProps {
  onInvite: (friendId: number) => void; // Function to handle inviting a friend
  triggerElement: React.ReactNode; // The element that triggers the popup
  entityId: string | undefined; // ID of the budget or savings goal
  entityType: "budget" | "savingsGoal"; // Context to distinguish between budgets and savings goals
}

const ShowFriends: React.FC<ShowFriendsProps> = ({
  onInvite,
  triggerElement,
  entityId,
  entityType,
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [contributors, setContributors] = useState<number[]>([]); // Store contributor IDs separately
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const fetchFriendsAndContributors = async () => {
      try {
        console.log("Fetching friends and contributors...");

        // Fetch all friends
        const friendsResponse = await Axios.get(`/friends/`);
        console.log("Friends fetched:", friendsResponse.data);

        // Fetch contributors based on entity type
        const contributorsResponse = await Axios.get(
          `/data/${entityType === "budget" ? "custom-budget" : "savings"}/${entityId}/`
        );
        console.log(
          "Contributors fetched for entity:",
          contributorsResponse.data.contributors
        );

        const contributorsList = contributorsResponse.data.contributors || [];
        setContributors(contributorsList); // Store contributor IDs directly

        // Map friends with their relationship to the entity
        const friendsWithStatus = friendsResponse.data.map((friend: Friend) => {
          if (contributorsList.includes(friend.id)) {
            return { ...friend, status: "joined" }; // Check against the array of IDs
          }
          return { ...friend, status: "none" }; // Default to "none"
        });

        console.log("Mapped friends with status:", friendsWithStatus);
        setFriends(friendsWithStatus);
      } catch (error) {
        console.error("Error fetching friends or contributors:", error);
      }
    };

    if (entityId) fetchFriendsAndContributors(); // Only fetch if entityId is available
  }, [entityId, entityType]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getStatus = (friendId: number): "none" | "joined" => {
    return contributors.includes(friendId) ? "joined" : "none"; // Check if friendId exists in contributors
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
          horizontal: "right", // Anchor to the bottom-right of the button
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left", // Align the popup's top-left corner to the button
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
                {getStatus(friend.id) === "none" ? (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => {
                      onInvite(friend.id);
                      toast({
                        title: "Friend invited",
                        description: friend.username,
                      });
                    }}
                  >
                    Invite
                  </Button>
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
