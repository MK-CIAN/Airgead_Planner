import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Axios from "./Axios";
import { Box, Typography } from "@mui/material";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import SavingsChart from "./charts/TestSavingsChart";
import UpdateSavingsForm from "./Savings/SavingsUpdateForms";
import ShowFriends from "./UserServices/ShowFriends";
import ChatRoom from "./UserServices/ChatRoom";

interface Contributor {
  id: number;
  username: string;
}

interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  contributors: Contributor[];
}

const SavingsGoalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [savingsGoal, setSavingsGoal] = useState<SavingsGoal | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    Axios.get(`data/savings/${id}/`)
      .then((response) => {
        const data = response.data;

        setSavingsGoal({
          ...data,
          current_amount: Number(data.current_amount),
          target_amount: Number(data.target_amount),
        });
      })
      .catch((error) => console.error("Error fetching savings goal:", error));
  }, [id]);

  const handleUpdate = async (updatedGoal: SavingsGoal) => {
    try {
      const response = await Axios.get(`data/savings/${updatedGoal.id}/`);
      setSavingsGoal({
        ...response.data,
        current_amount: Number(response.data.current_amount),
        target_amount: Number(response.data.target_amount),
      });
    } catch (error) {
      console.error("Error fetching updated savings goal:", error);
    }
  };

  const handleInviteFriend = async (friendId: number) => {
    try {
      await Axios.post(`data/savings/${id}/invite-friend/`, {
        friend_id: friendId,
      });
      setAlertMessage("Invite to join goal sent.");
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error("Error inviting contributor:", error);
      setAlertMessage("Failed to invite contributor.");
      setTimeout(() => setAlertMessage(null), 3000);
    }
  };

  if (!savingsGoal) {
    return <Typography>Loading...</Typography>;
  }

  const progress =
    (savingsGoal.current_amount / savingsGoal.target_amount) * 100;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">{savingsGoal.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart and Summary */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <SavingsChart progress={progress} />
            <Typography className="text-center mt-4">
              {`€${savingsGoal.current_amount.toFixed(2)} / €${savingsGoal.target_amount.toFixed(
                2
              )}`}
            </Typography>
          </CardContent>
        </Card>

        {/* Contribution Form */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Add Contribution</CardTitle>
          </CardHeader>
          <CardContent>
            <UpdateSavingsForm savingsGoal={savingsGoal} onUpdate={handleUpdate} />
          </CardContent>
        </Card>
      </div>

      {/* Contributors */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Contributors</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Contributor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {savingsGoal.contributors.map((contributor) => (
              <TableRow key={contributor.id}>
                <TableCell>{contributor.username}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Invite Friend */}
      <div className="mt-6">
        <ShowFriends
          entityId={id}
          entityType="savingsGoal"
          onInvite={handleInviteFriend}
          triggerElement={
            <Button className="w-full">Invite Friends</Button>
          }
        />
      </div>

      {/* Chat Room */}
      <div className="mt-6">
        <ChatRoom entityId={Number(id)} entityType="savingsGoal" />
      </div>
    </div>
  );
};

export default SavingsGoalDetails;
