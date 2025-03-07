import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HandCoins, ListChecks } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BudgetPlaceholder({ type = "monthly-budget" }) {
  const navigate = useNavigate();

  return (
    <Card className="w-full h-full p-6 flex flex-col justify-center items-center text-center border border-dashed">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {type === "monthly-budget"
            ? "Let's Get You Started with a Budget!"
            : "Create a Custom Budget for Your Needs!"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center items-center flex-grow">
        <div className="w-16 h-16 flex items-center justify-center rounded-full mb-4">
          {type === "monthly-budget" ? (
            <HandCoins className="w-16 h-16 text-green-500" />
          ) : (
            <ListChecks className="w-16 h-16 text-green-500" />
          )}
        </div>
        <p className="text-muted-foreground mb-4">
          {type === "monthly-budget"
            ? "Money can be confusing. Let's set up your budget for this month and take control of your finances."
            : "Plan your expenses with a custom budget that fits your lifestyle or create a shareable budget with friends.\n Use the create custom budget button to get started!"}
        </p>
        {type === "monthly-budget" && (
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() => navigate("/budget/monthly-budget")}
          >
            Create Budget
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
