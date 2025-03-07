import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HandCoins } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BudgetPlaceholder() {
  const navigate = useNavigate();

  return (
    <Card className="w-full h-full p-6 flex flex-col justify-center items-center text-center border border-dashed">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Let's Get You Started with a Budget!</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center items-center flex-grow">
        <div className="w-16 h-16 flex items-center justify-center rounded-full mb-4">
          <HandCoins className="w-16 h-16 text-green-500" />
        </div>
        <p className="text-muted-foreground mb-4">
          Money can be confusing. Let's set up your budget for this month and take control of your finances.
        </p>
        <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => navigate("/budget/monthly-budget")}>
          Create Budget
        </Button>
      </CardContent>
    </Card>
  );
}
