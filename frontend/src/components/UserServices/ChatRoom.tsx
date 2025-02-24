import React, { useState, useEffect } from "react";
import Axios from "../Axios";

interface ChatMessage {
  id: number;
  sender_name: string;
  content: string;
  timestamp: string;
}

interface ChatRoomProps {
  entityId: number; // ID of the budget or savings goal
  entityType: "budget" | "savingsGoal" | "stockLeague"; // Type of entity (budget or savings goal)
}

const ChatRoom: React.FC<ChatRoomProps> = ({ entityId, entityType }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

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
    if (!newMessage.trim()) return; // Prevent sending empty messages
  
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
      setNewMessage(""); // Clear the input after sending
      fetchMessages(); // Refresh messages
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  

  useEffect(() => {
    fetchMessages(); // Initial fetch
  }, [entityId, entityType]); // Refetch messages if entityId or entityType changes

  return (
    <div>
      {/* Messages */}
      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        {messages.map((msg) => (
          <div key={msg.id}>
            {new Date (msg.timestamp).toLocaleTimeString()} <strong>{msg.sender_name}:</strong> {msg.content}
          </div>
        ))}
      </div>

      {/* Input for new messages */}
      <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "8px 16px",
            borderRadius: "4px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
