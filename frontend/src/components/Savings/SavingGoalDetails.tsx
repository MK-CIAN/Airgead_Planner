import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Axios from "../Axios";
import { Box, Typography } from "@mui/material";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import SavingsChart from "../charts/TestSavingsChart";
import UpdateSavingsForm from "./SavingsUpdateForms";
import ShowFriends from "../UserServices/ShowFriends";
import ChatRoom from "../UserServices/ChatRoom";
import ProgressiveImageReveal from "./ProgressiveImageReveal";

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
  image_url?: string;
}

const SavingsGoalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [savingsGoal, setSavingsGoal] = useState<SavingsGoal | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    Axios.get(`data/savings/${id}/`)
      .then((response) => {
        const data = response.data;

        setSavingsGoal({
          ...data,
          current_amount: Number(data.current_amount),
          target_amount: Number(data.target_amount),
          image_url: data.image_url || undefined,
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

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !savingsGoal) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await Axios.post(
        `data/savings/${savingsGoal.id}/upload-image/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSavingsGoal((prev) => ({
        ...prev!,
        image_url: response.data.image_url, // Update image URL after upload
      }));

      setImage(null);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
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

  console.log(savingsGoal);

  const progress =
    (savingsGoal.current_amount / savingsGoal.target_amount) * 100;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        {savingsGoal.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart and Summary */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Progress and Image</CardTitle>
          </CardHeader>
          <CardContent>
            <Carousel>
              <CarouselContent>
                {/* Chart Slide */}
                <CarouselItem>
                  <SavingsChart progress={Math.min(progress, 100)} />
                  <Typography className="text-center mt-4">
                    {`€${savingsGoal.current_amount.toFixed(
                      2
                    )} / €${savingsGoal.target_amount.toFixed(2)}`}
                  </Typography>
                </CarouselItem>

                {/* Image Slide */}
                {savingsGoal.image_url && (
                  <CarouselItem>
                    <ProgressiveImageReveal
                      imageUrl={savingsGoal.image_url}
                      progress={Math.min(progress, 100)} // Ensure progress doesn't exceed 100%
                    />
                    <div className="flex items-center gap-2 font-medium leading-none">
                      Continuously Add to Your Savings Goal to Reveal the Image
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>

        {/* Contribution Form */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Add Contribution</CardTitle>
          </CardHeader>
          <CardContent>
            <UpdateSavingsForm
              savingsGoal={savingsGoal}
              onUpdate={handleUpdate}
            />
          </CardContent>
        </Card>
      </div>

      {/* Image Upload */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleImageUpload} className="space-y-4">
            <div>
              <Label htmlFor="image">Select Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </div>
            <Button type="submit" disabled={!image || uploading}>
              {uploading ? "Uploading..." : "Upload Image"}
            </Button>
          </form>
        </CardContent>
      </Card>

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
                <TableCell>{contributor.id}</TableCell>
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
          triggerElement={<Button className="w-full">Invite Friends</Button>}
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
