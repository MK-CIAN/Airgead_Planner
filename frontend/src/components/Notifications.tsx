import React, { useEffect, useState } from "react";
import {
  Dialog,
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
  const [open, setOpen] = useState(false);

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
        { headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` } }
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
        { headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` } }
      );
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error denying friend request:", error);
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={() => setOpen(true)}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <Box p={2}>
          <Typography variant="h6">Notifications</Typography>
          <List>
            {notifications.map((notification) => (
              <ListItem key={notification.id}>
                <ListItemText
                  primary={notification.message}
                  secondary={notification.sender || ""}
                />
                {notification.type === "friend_request" && (
                  <>
                    <Button
                      onClick={() => handleAccept(notification.id)}
                      color="primary"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleDeny(notification.id)}
                      color="secondary"
                    >
                      Deny
                    </Button>
                  </>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </Dialog>
    </>
  );
};

export default Notifications;
