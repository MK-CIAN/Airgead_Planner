import React, { useState, useEffect } from "react";
import Axios from "../Axios";
import CustomBudgetForm from "../forms/CustomBudgetForm";
import { Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import ShowFriends from "../UserServices/ShowFriends";
import "../../App.css";
import ChatRoom from "../UserServices/ChatRoom";
import TestBudgetChart from "../charts/TestBudgetChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import BudgetRadarChart from "./BudgetRadarChart";

interface BudgetData {
  id: number;
  value: number;
  label: string;
  type: string;
}

interface Contributor {
  id: number;
  email: string;
}

const CustomBudgetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [budgetName, setBudgetName] = useState<string | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch custom budget details
  const fetchBudgetDetails = async () => {
    try {
      const response = await Axios.get(`data/custom-budget/${id}/`);
      const data = response.data;

      setBudgetName(data.name);

      // Map items safely
      const formattedData: BudgetData[] = (data.items || []).map(
        (item: any) => ({
          id: item.id,
          value: parseFloat(item.amount),
          label: item.category,
          type: item.transaction_type,
        })
      );
      setBudgetData(formattedData);
      setContributors(data.contributors || []);
    } catch (error) {
      console.error("Error fetching budget details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetDetails();
  }, [id]);

  const handleAddBudgetItem = (newItem: {
    amount: string;
    category: string;
    transaction_type: string;
  }) => {
    if (isSubmitting) return; // Prevent duplicate submissions
    setIsSubmitting(true);

    Axios.post(`data/custom-budget/${id}/items/`, newItem)
      .then((response) => {
        const savedItem = response.data;

        // Update state with the new item
        setBudgetData((prevData) => [
          ...prevData,
          {
            id: savedItem.id,
            value: parseFloat(savedItem.amount),
            label: savedItem.category,
            type: savedItem.transaction_type,
          },
        ]);
      })
      .catch((error) => {
        console.error("Error adding budget item:", error);
      })
      .finally(() => {
        setIsSubmitting(false); // Re-enable the button
      });
  };

  const handleRemoveBudgetItem = (itemId: number) => {
    Axios.delete(`data/custom-budget/${id}/items/${itemId}/`)
      .then(() => {
        fetchBudgetDetails(); // Refresh the budget data after removing an item
      })
      .catch((error) => {
        console.error("Error removing budget item:", error);
      });
  };

  const handleInviteFriend = async (friendId: number) => {
    try {
      await Axios.post(`data/custom-budget/${id}/invite-friend/`, {
        friend_id: friendId,
      });
      alert("Invitation sent!");
    } catch (error) {
      console.error("Error inviting friend:", error);
    }
  };

  if (loading) {
    return <Typography align="center">Loading...</Typography>;
  }

  if (!budgetName) {
    return <Typography align="center">Budget not found</Typography>;
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <Typography
        variant="h4"
        align="center"
        className="mb-4 text-xl md:text-2xl"
      >
        {budgetName}
      </Typography>

      {/* Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {/* Add Items Form */}
        <Card className="bg-gray-50 p-4 rounded-md">
          <Typography variant="h6" className="mb-4">
            Add Budget Item
          </Typography>
          <CustomBudgetForm onAddBudgetItem={handleAddBudgetItem} />
        </Card>

        {/* Budget List */}
        <Card className="overflow-y-auto max-h-[350px] border p-4">
          <Typography variant="h6" className="mb-2">
            Budget Items
          </Typography>
          <div className="max-h-[250px]">
            <Table className="table-auto w-full text-sm">
              <TableHeader>
                <TableRow className="h-6">
                  {" "}
                  {/* Reduce row height */}
                  <TableHead className="text-left w-1/4 px-2 py-1">
                    Category
                  </TableHead>
                  <TableHead className="text-right w-1/4 px-2 py-1">
                    Amount (€)
                  </TableHead>
                  <TableHead className="text-right w-1/4 px-2 py-1">
                    Type
                  </TableHead>
                  <TableHead className="text-right w-1/4 px-2 py-1">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetData.length > 0 ? (
                  budgetData.map((item) => (
                    <TableRow key={item.id} data-testid="budget-item" className="hover:bg-gray-100 h-6">
                      <TableCell className="text-left px-2 py-1">
                        {item.label}
                      </TableCell>
                      <TableCell className="text-right px-2 py-1">
                        €{item.value.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={`text-right px-2 py-1 capitalize ${
                          item.type === "income"
                            ? "text-green-600"
                            : item.type === "debt"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {item.type}
                      </TableCell>
                      {/* Fix alignment issue */}
                      <TableCell className="text-right px-2 py-1">
                        <div className="flex justify-end">
                          <Button
                            className="bg-red-600 text-white text-xs px-3 py-1"
                            size="sm"
                            data-testid="remove-budget-button"
                            onClick={() => handleRemoveBudgetItem(item.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="h-6">
                    <TableCell
                      colSpan={4}
                      className="text-center text-gray-500 px-2 py-1"
                    >
                      No budget items available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Contributors Section */}
      <div className="text-right mt-4">
        <ShowFriends
          entityId={id}
          entityType="budget"
          onInvite={handleInviteFriend}
          triggerElement={
            <Button className="bg-green-600 text-white px-4 py-2">
              Add Friends
            </Button>
          }
        />
      </div>

      {/* Budget Charts */}
      <div className="mt-5 flex justify-center">
        <Carousel>
          <CarouselContent>
            <CarouselItem>
              <TestBudgetChart data={budgetData} />
            </CarouselItem>
            <CarouselItem>
              <BudgetRadarChart budgetData={budgetData} />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Chatroom Section */}
      <div className="mt-5">
        <Typography variant="h6" className="mb-4">
          Chatroom
        </Typography>
        <ChatRoom entityId={Number(id)} entityType="budget" />
      </div>
    </div>
  );
};

export default CustomBudgetDetails;
