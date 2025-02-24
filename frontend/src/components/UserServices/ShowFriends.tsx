import React, { useState, useEffect } from "react";
import Axios from "../Axios";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";

interface Friend {
  id: number;
  username: string;
  status: "none" | "joined"; // Relationship with the entity
}

interface ShowFriendsProps {
  onInvite: (friendId: number) => void; // Function to handle inviting a friend
  triggerElement: React.ReactNode; // The element that triggers the popup
  entityId: string | undefined; // ID of the budget or savings goal
  entityType: "budget" | "savingsGoal" | "stockLeague"; // Context to distinguish between budgets and savings goals
}

const ShowFriends: React.FC<ShowFriendsProps> = ({
  onInvite,
  triggerElement,
  entityId,
  entityType,
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [, setContributors] = useState<number[]>([]);

  useEffect(() => {
    const fetchFriendsAndContributors = async () => {
      try {
        const friendsResponse = await Axios.get(`/friends/`);
    
        if (!Array.isArray(friendsResponse.data)) {
          console.error("Unexpected API response:", friendsResponse.data);
          return; // Exit early if data is not an array
        }
    
        let contributorsUrl = "";
        if (entityType === "budget") {
          contributorsUrl = `/data/custom-budget/${entityId}/`;
        } else if (entityType === "savingsGoal") {
          contributorsUrl = `/data/savings/${entityId}/`;
        } else if (entityType === "stockLeague") {
          contributorsUrl = `/data/leagues/${entityId}/`;
        }
    
        const contributorsResponse = await Axios.get(contributorsUrl);
        const contributorsList = Array.isArray(contributorsResponse.data.contributors)
          ? contributorsResponse.data.contributors
          : [];
    
        setContributors(contributorsList);
    
        const friendsWithStatus: Friend[] = friendsResponse.data.map((friend: Friend) => ({
          ...friend,
          status: contributorsList.includes(friend.id) ? "joined" as const : "none" as const,
        }));
        
        setFriends(friendsWithStatus);
      } catch (error) {
        console.error("Error fetching friends or contributors:", error);
      }
    };
    
    if (entityId) fetchFriendsAndContributors();
  }, [entityId, entityType]);

  return (
    <Popover>
      <PopoverTrigger asChild>{triggerElement}</PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <h4 className="font-medium text-lg mb-2">Invite Friends</h4>
        <div className="flex flex-col gap-2">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between">
                <span>{friend.username}</span>
                {friend.status === "none" ? (
                  <Button
                    className="hover:bg-green-600 hover:text-white"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      onInvite(friend.id);
                      toast({
                        title: "Friend Invited",
                        description: friend.username,
                      });
                    }}
                  >
                    Invite
                  </Button>
                ) : (
                  <span className="text-green-600 text-sm">Joined</span>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No friends available to invite.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ShowFriends;
