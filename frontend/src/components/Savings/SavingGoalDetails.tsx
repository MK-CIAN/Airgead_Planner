import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Axios from "../Services/Axios";
import { Typography } from "@mui/material";
import { Button } from "@/components/ui/button";
//import { Input } from "@/components/ui/input";
//import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import SavingsChart from "./SavingsChart";
import UpdateSavingsForm from "./SavingsUpdateForms";
import ShowFriends from "../UserServices/ShowFriends";
import ChatRoom from "../UserServices/ChatRoom";
import ProgressiveImageReveal from "./ProgressiveImageReveal";
import FeatureTooltip from "../ui/featureTooltip";

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

interface SavingsContribution {
  id: string;
  amount: number;
  contribution_date: string;
}

const SavingsGoalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [savingsGoal, setSavingsGoal] = useState<SavingsGoal | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [contributionHistory, setContributionHistory] = useState<
    SavingsContribution[]
  >([]);

  // Fetch the savings goal details and contribution history
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

    Axios.get(`data/savings/${id}/contributions/`)
      .then((response) => {
        setContributionHistory(response.data);
      })
      .catch((error) =>
        console.error("Error fetching savings contributions:", error)
      );
  }, [id]);

  // Handle updates to the savings goal and contribution history
  const handleUpdate = async (
    updatedGoal: SavingsGoal,
    newContribution?: SavingsContribution
  ) => {
    if (!updatedGoal.id) {
      console.error("Error: Missing Savings Goal ID");
      return;
    }

    try {
      const response = await Axios.get(`data/savings/${updatedGoal.id}/`);
      setSavingsGoal({
        ...response.data,
        current_amount: Number(response.data.current_amount),
        target_amount: Number(response.data.target_amount),
      });

      if (newContribution) {
        setContributionHistory((prevHistory) => [
          ...prevHistory,
          newContribution,
        ]);
      }
    } catch (error) {
      console.error("Error fetching updated savings goal:", error);
    }
  };

  // Handle image upload
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

  if (!savingsGoal) {
    return <Typography data-testid="loading-state">Loading...</Typography>;
  }

  const progress =
    (savingsGoal.current_amount / savingsGoal.target_amount) * 100;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        {savingsGoal.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progress and Image */}
        <FeatureTooltip content="Your saving goal progress visualized.">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Progress and Image</CardTitle>
            </CardHeader>
            <CardContent>
              <Carousel>
                <CarouselContent>
                  <CarouselItem>
                    <SavingsChart progress={Math.min(progress, 100)} />
                    <Typography className="text-center mt-4">
                      {`€${savingsGoal.current_amount.toFixed(
                        2
                      )} / €${savingsGoal.target_amount.toFixed(2)}`}
                    </Typography>
                  </CarouselItem>

                  {savingsGoal.image_url && (
                    <CarouselItem>
                      <ProgressiveImageReveal
                        imageUrl={savingsGoal.image_url}
                        progress={Math.min(progress, 100)}
                      />
                      <div className="text-center mt-2 font-medium">
                        Add to Your Savings Goal to Reveal the Image
                      </div>
                    </CarouselItem>
                  )}
                </CarouselContent>
                {savingsGoal.image_url && (
                  <>
                    <CarouselPrevious className="bg-green-500 hidden sm:flex absolute" />
                    <CarouselNext className="bg-green-500 hidden sm:flex absolute" />
                  </>
                )}
              </Carousel>
            </CardContent>
          </Card>
        </FeatureTooltip>

        {/* Contribution Form and Upload */}
        <div className="grid grid-cols-1 gap-6">
          <FeatureTooltip content="Add a contribution to your saving goal.">
            <Card>
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
          </FeatureTooltip>

          <FeatureTooltip content="Upload an image to your saving goal.">
            <Card>
              <CardHeader>
                <CardTitle>Upload Image</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleImageUpload} className="space-y-4">
                  {/* Image preview */}
                  {image && (
                    <div className="w-full h-48 rounded-md overflow-hidden border border-gray-300">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Choose File Button (label triggers input) */}
                  <div className="relative w-full">
                    <input
                      id="fileUpload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Button
                      type="button"
                      className="w-full bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 relative z-0"
                    >
                      {image ? `Change Image: ${image.name}` : "Choose Image"}
                    </Button>
                  </div>

                  {/* Upload Button */}
                  <Button
                    type="submit"
                    disabled={uploading || !image}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    {uploading ? "Uploading..." : "Upload Image"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </FeatureTooltip>
        </div>
      </div>

      {/* Contribution History - Scrollable */}
      <FeatureTooltip content="Track your contribution history.">
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Contribution History</CardTitle>
          </CardHeader>
          <CardContent className="h-48 overflow-y-auto">
            {contributionHistory.length > 0 ? (
              <ul>
                {contributionHistory.map((contribution) => (
                  <li key={contribution.id} className="border-b py-2">
                    €{Number(contribution.amount).toFixed(2)} on{" "}
                    {new Date(
                      contribution.contribution_date
                    ).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No contributions yet.</p>
            )}
          </CardContent>
        </Card>
      </FeatureTooltip>

      <div className="text-right mt-4">
        <FeatureTooltip content="Have a shared goal with friends? Add them to contribute to your goal.">
          <ShowFriends
            entityId={id}
            entityType="savingsGoal"
            triggerElement={
              <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2">
                Add Friends
              </Button>
            }
          />
        </FeatureTooltip>
      </div>

      {/* Chat Room */}
      <div className="mt-6">
        <ChatRoom entityId={Number(id)} entityType="savingsGoal" />
      </div>
    </div>
  );
};

export default SavingsGoalDetails;
