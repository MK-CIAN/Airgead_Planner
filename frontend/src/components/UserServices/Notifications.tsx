import React, { useEffect, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, X } from "lucide-react"; // Using Lucide icons for better integration
import Axios from "../Services/Axios";
import { toast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  type: string; // "friend_request", "budget_invite", "savings_invite", "stock_league_invite"
  message: string;
  sender: string | null;
  budget_id?: number;
  stock_league_id?: number;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch notifications from the backend
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

  // Handle accepting a notifications
  const handleAccept = async (notification: Notification) => {
    try {
      const payload: any = { notification_id: notification.id };

      if (notification.type === "budget_invite" && notification.budget_id) {
        payload.budget_id = notification.budget_id;
      } else if (notification.type === "stock_league_invite" && notification.stock_league_id) {
        payload.stock_league_id = notification.stock_league_id;
      }

      await Axios.post(`notifications/accept`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
      });

      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));

      toast({
        title: "Accepted",
        description: "You have successfully accepted the invitation.",
      });
    } catch (error) {
      console.error("Error accepting notification:", error);
      toast({
        title: "Error",
        description: "Failed to accept the notification.",
        variant: "destructive",
      });
    }
  };

  // Handle denying a notification
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

      toast({
        title: "Denied",
        description: "Notification request has been declined.",
      });
    } catch (error) {
      console.error("Error denying notification:", error);
      toast({
        title: "Error",
        description: "Failed to deny the notification.",
        variant: "destructive",
      });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative">
          {notifications.length > 0 && (
            <Badge className="absolute -top-1 -right-1 text-xs bg-red-500">
              {notifications.length}
            </Badge>
          )}
          <Bell className="w-5 h-5" aria-label="Notifications"/>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <h4 className="font-medium text-lg mb-2">Notifications</h4>
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between border-b pb-2">
                <div className="text-sm flex-1">
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {notification.sender || "Unknown sender"}
                  </p>
                </div>
                {(notification.type === "friend_request" ||
                  notification.type === "budget_invite" ||
                  notification.type === "savings_invite" ||
                  notification.type === "stock_league_invite") && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="hover:bg-green-600"
                      onClick={() => handleAccept(notification)}
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="hover:bg-red-500 hover:text-white"
                      onClick={() => handleDeny(notification.id)}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center">No new notifications</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;
