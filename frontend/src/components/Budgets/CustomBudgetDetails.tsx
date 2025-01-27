import React, { useState, useEffect } from "react";
import Axios from "../Axios";
import BudgetChart from "../charts/BudgetChart";
import CustomBudgetForm from "../forms/CustomBudgetForm";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import ShowFriends from "../UserServices/ShowFriends";
import "../../App.css";
import ChatRoom from "../UserServices/ChatRoom";
import TestBudgetChart from "../charts/TestBudgetChart";
import { Table, TableBody, TableCell, TableHead, TableRow } from "../ui/table";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect mobile view

  const [budgetName, setBudgetName] = useState<string | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
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
      <Typography variant="h4" align="center" className="mb-4 text-xl md:text-2xl">
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
              <TableHead>
                <TableRow>
                  <TableCell className="text-left px-2 py-1">Category</TableCell>
                  <TableCell className="text-right px-2 py-1">Amount</TableCell>
                  <TableCell className="text-left px-2 py-1">Type</TableCell>
                  <TableCell className="text-center px-2 py-1">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {budgetData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-100">
                    <TableCell className="text-left px-2 py-1 truncate max-w-[100px]">
                      {item.label}
                    </TableCell>
                    <TableCell className="text-right px-2 py-1">
                      €{item.value.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={`text-left px-2 py-1 capitalize ${
                        item.type === "income"
                          ? "text-green-600"
                          : item.type === "debt"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {item.type}
                    </TableCell>
                    <TableCell className="text-center px-2 py-1">
                      <Button
                        className="bg-red-600 text-white text-xs px-2 py-1"
                        size="sm"
                        onClick={() => handleRemoveBudgetItem(item.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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

      {/* Responsive Budget Chart */}
      <div className="mt-5 flex justify-center">
        <TestBudgetChart data={budgetData} />
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
