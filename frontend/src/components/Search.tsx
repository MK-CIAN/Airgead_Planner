import React, { useState, useEffect } from "react";
import {
  Dialog,
  TextField,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Typography,
} from "@mui/material";
import Axios from "./Axios";

interface User {
  id: number;
  username: string;
  email: string;
  status: "pending" | "friends" | "none"; // Add status to the user object
}

interface SearchComponentProps {
  open: boolean;
  onClose: () => void;
}

const Search: React.FC<SearchComponentProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (query.trim() === "") {
        setSearchResults([]); // Clear results if query is empty
        return;
      }
      try {
        const response = await Axios.get(`search`, {
          params: { q: query },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        });
        console.log("Search Response:", response.data); // Log the response
        setSearchResults(response.data); // Ensure response includes the "status" field
      } catch (error) {
        console.error("Error during search:", error);
      }
    };
  
    const delayDebounceFn = setTimeout(() => {
      fetchSearchResults();
    }, 300); // Add a 300ms debounce
  
    return () => clearTimeout(delayDebounceFn); // Cleanup debounce
  }, [query]);
  

  const sendFriendRequest = async (receiverId: number) => {
    try {
      await Axios.post(
        `friend-request`,
        { receiver_id: receiverId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
        }
      );
      alert("Friend request sent!");
      // Update the status in the search results
      setSearchResults((prev) =>
        prev.map((user) =>
          user.id === receiverId ? { ...user, status: "pending" } : user
        )
      );
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box p={2}>
        <TextField
          fullWidth
          label="Search for users"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <List>
          {searchResults.map((user) => (
            <ListItem key={user.id}>
              <ListItemText
                primary={user.username}
                secondary={user.email}
              />
              {/* Render the correct button or status text */}
              {user.status === "none" ? (
                <Button
                  onClick={() => sendFriendRequest(user.id)}
                  color="primary"
                >
                  Add Friend
                </Button>
              ) : user.status === "pending" ? (
                <Typography color="textSecondary">Request Pending</Typography>
              ) : (
                <Typography color="primary">Friends</Typography>
              )}
            </ListItem>
          ))}
        </List>
      </Box>
    </Dialog>
  );
};

export default Search;
