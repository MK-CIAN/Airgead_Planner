import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SavingsPlaceholder() {
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
        <p className="text-muted-foreground mb-4">
          Saving for the future starts today! Set up a savings goal and start
          working towards it.
        </p>
        <Button
          className="bg-green-500 hover:bg-green-600 text-white"
          onClick={() => navigate("/savings")}
        >
          Create Savings Goal
        </Button>
      </CardContent>
    </Card>
  );
}
