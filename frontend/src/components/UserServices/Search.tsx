import React, { useState, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import Axios from "../Axios";

interface User {
  id: number;
  username: string;
  email: string;
  status: "pending" | "friends" | "none";
}

const SearchUsers: React.FC = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

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
      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been sent successfully.",
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast({
        title: "Error",
        description: "Failed to send friend request.",
        variant: "destructive",
      });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          <Search className="w-5 h-5" aria-label="Search"/>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <h4 className="font-medium text-lg mb-2">Search Users</h4>
        <Input
          placeholder="Search for users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-3"
        />
        <div className="flex flex-col gap-2">
          {searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                {user.status === "none" ? (
                  <Button
                    className="hover:bg-green-500"
                    variant="secondary"
                    size="sm"
                    onClick={() => sendFriendRequest(user.id)}
                  >
                    Add Friend
                  </Button>
                ) : user.status === "pending" ? (
                  <span className="text-sm text-muted-foreground">Pending</span>
                ) : (
                  <span className="text-sm text-green-500">Friends</span>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No users found.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchUsers;
