import React, { useState, useEffect } from "react";
import {
  Popover,
  TextField,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Axios from "./Axios";

interface User {
  id: number;
  username: string;
  email: string;
  status: "pending" | "friends" | "none";
}

const Search: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (query.trim() === "") {
        setSearchResults([]);
        return;
      }
      try {
        const response = await Axios.get(`search`, {
          params: { q: query },
          headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
        });
        setSearchResults(response.data);
      } catch (error) {
        console.error("Error during search:", error);
      }
    };

    const debounceTimer = setTimeout(() => fetchSearchResults(), 300);
    return () => clearTimeout(debounceTimer);
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
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <SearchIcon />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box p={2} width={400} sx={{ maxHeight: 400, overflowY: "auto" }}>
          <TextField
            fullWidth
            label="Search for users"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <List>
            {searchResults.map((user) => (
              <ListItem key={user.id}>
                <ListItemText primary={user.username} secondary={user.email} />
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
      </Popover>
    </>
  );
};

export default Search;
