import React, { useEffect, useState } from "react";
import {
  Popover,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Typography,
  Badge,
  IconButton,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Axios from "./Axios";

interface Notification {
  id: number;
  type: string;
  message: string;
  sender: string | null;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await Axios.get(`notifications`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
        });
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  const handleAccept = async (id: number) => {
    try {
      await Axios.post(
        `notifications/accept`,
        { notification_id: id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
        }
      );
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleDeny = async (id: number) => {
    try {
      await Axios.post(
        `notifications/deny`,
        { notification_id: id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
        }
      );
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error denying friend request:", error);
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box p={2} width={350} sx={{ maxHeight: 400, overflowY: "auto" }}>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Notifications
          </Typography>
          <List>
            {notifications.length === 0 ? (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ textAlign: "center" }}
              >
                No new notifications
              </Typography>
            ) : (
              notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1, // Add spacing between items
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">
                      {notification.message}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ fontSize: "0.85rem" }}
                    >
                      {notification.sender || "Unknown sender"}
                    </Typography>
                  </Box>
                  {notification.type === "friend_request" && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        onClick={() => handleAccept(notification.id)}
                        variant="contained"
                        color="success"
                        size="small"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleDeny(notification.id)}
                        variant="outlined"
                        color="error"
                        size="small"
                      >
                        Deny
                      </Button>
                    </Box>
                  )}
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Popover>
    </>
  );
};

export default Notifications;
