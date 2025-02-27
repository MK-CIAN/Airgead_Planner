import React, { useState, useEffect, useRef } from "react";
import Axios from "../Axios";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: number;
  sender_name: string;
  content: string;
  timestamp: string;
}

interface ChatRoomProps {
  entityId: number;
  entityType: "budget" | "savingsGoal" | "stockLeague";
}

const ChatRoom: React.FC<ChatRoomProps> = ({ entityId, entityType }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch messages from the API
  const fetchMessages = async () => {
    try {
      const params =
        entityType === "budget"
          ? { budget_id: entityId }
          : entityType === "savingsGoal"
          ? { savings_goal_id: entityId }
          : entityType === "stockLeague"
          ? { stock_league_id: entityId }
          : {};

      const response = await Axios.get("/chat/messages/", { params });
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const data =
        entityType === "budget"
          ? { budget_id: entityId, content: newMessage }
          : entityType === "savingsGoal"
          ? { savings_goal_id: entityId, content: newMessage }
          : entityType === "stockLeague"
          ? { stock_league_id: entityId, content: newMessage }
          : {};

      await Axios.post("/chat/messages/", data);
      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Scroll to the latest message when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchMessages();
  }, [entityId, entityType]);

  // Format timestamp as YYYY-MM-DD HH:mm
  const formatTimestamp = (timestamp: string) => {
    const dateObj = new Date(timestamp);
    return dateObj.toISOString().slice(0, 16).replace("T", " "); // Outputs: "YYYY-MM-DD HH:mm"
  };

  return (
    <Card className="w-full h-full flex flex-col p-4">
      {/* Messages container */}
      <div className="flex-grow overflow-auto border p-3 rounded-md bg-gray-100 dark:bg-gray-800">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2 flex flex-col sm:flex-row sm:items-center gap-y-1">
            {/* Timestamp stacked on small screens, inline on larger screens */}
            <span className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">
              {formatTimestamp(msg.timestamp)}
            </span>

            <div className="flex sm:flex-row sm:items-center gap-x-2">
              {/* Timestamp inline on larger screens */}
              <span className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
                {formatTimestamp(msg.timestamp)}
              </span>

              {/* User & Message */}
              <div className="flex flex-col sm:flex-row">
                <strong className="text-gray-900 dark:text-gray-200 flex-shrink-0">
                  {msg.sender_name}:
                </strong>
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {msg.content}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input field and send button */}
      <div className="mt-3 flex items-center gap-2">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 text-sm md:text-base"
        />
        <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm md:text-base" onClick={sendMessage}>
          Send
        </Button>
      </div>
    </Card>
  );
};

export default ChatRoom;
