import React, { useState, useEffect } from "react";
import Axios from "../Services/Axios";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";

interface Friend {
  id: number;
  username: string;
  status: "none" | "joined" | "pending"; // Relationship with the entity
}

interface ShowFriendsProps {
  triggerElement: React.ReactNode; // The element that triggers the popup
  entityId: string | undefined; // ID of the budget/savings goal/stock league
  entityType: "budget" | "savingsGoal" | "stockLeague";
}

const ShowFriends: React.FC<ShowFriendsProps> = ({
  triggerElement,
  entityId,
  entityType,
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [, setContributors] = useState<number[]>([]);
  const [pendingInvites, setPendingInvites] = useState<number[]>([]);

  // Fetch friends and contributors when the component mounts or when entityId changes
  useEffect(() => {
    const fetchFriendsAndContributors = async () => {
      try {
        const friendsResponse = await Axios.get(`/friends/`);
        // Validating API response
        if (!Array.isArray(friendsResponse.data)) {
          console.error("Unexpected API response:", friendsResponse.data);
          return;
        }
        // Fetching contributors
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
        // Fetch pending invites
        const pendingResponse = await Axios.get(`/notifications/pending-invites`, {
          params: { entity_id: entityId, entity_type: entityType },
        });
        const pendingIds = pendingResponse.data.map((invite: any) => invite.friend_id);
        setPendingInvites(pendingIds);

        // Update friend status based on contributors and pending invites
        const friendsWithStatus: Friend[] = friendsResponse.data.map((friend: Friend) => ({
          ...friend,
          status: contributorsList.includes(friend.id)
            ? "joined" as const
            : pendingIds.includes(friend.id)
            ? "pending" as const
            : "none" as const,
        }));
        
        setFriends(friendsWithStatus);
      } catch (error) {
        console.error("Error fetching friends or contributors:", error);
      }
    };
    
    if (entityId) fetchFriendsAndContributors();
  }, [entityId, entityType]);

  // Function to handle inviting a friend
  const handleInvite = async (friendId: number) => {
    if (pendingInvites.includes(friendId)) {
      return; // Preventing sending duplicate invites
    }

    let inviteUrl = "";
    if (entityType === "budget") {
      inviteUrl = `/data/custom-budget/${entityId}/invite-friend/`;
    } else if (entityType === "savingsGoal") {
      inviteUrl = `/data/savings/${entityId}/invite-friend/`;
    } else if (entityType === "stockLeague") {
      inviteUrl = `/data/leagues/${entityId}/invite-friend/`;
    }

    try {
      await Axios.post(inviteUrl, { friend_id: friendId });

      // Update UI to reflect "pending" status
      setPendingInvites((prev) => [...prev, friendId]);
      setFriends((prev) =>
        prev.map((friend) =>
          friend.id === friendId ? { ...friend, status: "pending" } : friend
        )
      );

      toast({
        title: "Friend Invited",
        description: "Invitation sent successfully.",
        variant: "successfull",
      });
    } catch (error: any) {
      console.error("Error sending invite:", error);

      if (error.response && error.response.status === 400) {
        toast({
          title: "Invite Failed",
          description: "This user has already been invited.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send invitation.",
          variant: "destructive",
        });
      }
    }
  };

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
                {friend.status === "joined" ? (
                  <span className="text-green-600 text-sm">Joined</span>
                ) : friend.status === "pending" ? (
                  <span className="text-sm text-muted-foreground">Pending</span>
                ) : (
                  <Button
                    className="hover:bg-green-600 hover:text-white"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleInvite(friend.id)}
                  >
                    Invite
                  </Button>
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

