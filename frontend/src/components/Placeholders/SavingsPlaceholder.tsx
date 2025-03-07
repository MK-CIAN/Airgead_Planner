import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SavingsPlaceholder({ pageType = "dashboard" }) {
  const navigate = useNavigate();

  return (
    <Card className="w-full h-full p-6 flex flex-col justify-center items-center text-center border border-dashed">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Have an Upcoming Trip or Big Purchase? Start Saving Now!
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center items-center flex-grow">
        <div className="w-16 h-16 flex items-center justify-center rounded-full mb-4">
          <PiggyBank className="w-16 h-16 text-green-500" />
        </div>

        {/* Dynamic Description Based on Page Type */}
        <p className="text-muted-foreground mb-4">
          {pageType === "dashboard"
            ? "Start your savings journey today! Create a goal to track your progress and reach your financial milestones."
            : "No savings goals found. Use the button above to create your first savings goal and start planning your future big or small, dont be afraid to invite friends to your goal."}
        </p>

        {/* Show Button Only on Dashboard */}
        {pageType === "dashboard" && (
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() => navigate("/savings")}
          >
            Create Savings Goal
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
