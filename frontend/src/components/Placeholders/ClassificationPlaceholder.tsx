import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, ShoppingCart, Scale, AlertCircle } from "lucide-react"; // Icons

// Define the possible categories
type UserCategory = "SAVER" | "SPENDER" | "BALANCED" | "No Classification";

interface ClassificationCardProps {
  category: string | null;
}

const ClassificationCard: React.FC<ClassificationCardProps> = ({ category }) => {
  // Ensure category is properly typed
  const validCategory: UserCategory = ["SAVER", "SPENDER", "BALANCED"].includes(category as UserCategory)
    ? (category as UserCategory)
    : "No Classification";

  const classificationDetails: Record<UserCategory, { title: string; description: string; icon: JSX.Element }> = {
    SAVER: {
      title: "You're a Saver!",
      description: "You prioritize savings and spend wisely. Consider diversifying investments.",
      icon: <PiggyBank className="w-16 h-16 text-green-500" />,
    },
    SPENDER: {
      title: "You're a Spender!",
      description: "Your expenses are high. Consider reducing discretionary spending and budgeting smarter.",
      icon: <ShoppingCart className="w-16 h-16 text-red-500" />,
    },
    BALANCED: {
      title: "You're Balanced!",
      description: "You maintain a good balance between savings and spending. Keep optimizing your finances!",
      icon: <Scale className="w-16 h-16 text-green-500" />,
    },
    "No Classification": {
      title: "No Classification Available",
      description: "Not enough data to determine your financial category. Try adding budget details.",
      icon: <AlertCircle className="w-16 h-16 text-gray-500" />,
    },
  };

  const details = classificationDetails[validCategory];

  return (
    <div className="flex justify-center mb-6">
      <Card className="w-full max-w-lg p-6 flex flex-col justify-center items-center text-center border border-gray-300 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{details.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-full mb-4">
            {details.icon}
          </div>
          <p className="text-muted-foreground mb-4">{details.description}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassificationCard;
