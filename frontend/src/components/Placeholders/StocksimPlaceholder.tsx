import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartCandlestick, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StockSimPlaceholder({ portfolioType = "personal" }) {
  const navigate = useNavigate();

  return (
    <Card className="w-full h-full p-6 flex flex-col items-center text-center border border-dashed">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {portfolioType === "personal"
            ? "Don't Know Where to Start with Investing?"
            : "Create or Join a Stock Market League!"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center flex-grow">
        <div className="w-16 h-16 flex items-center justify-center rounded-full mb-4">
          {portfolioType === "personal" ? (
            <ChartCandlestick className="w-16 h-16 text-green-500" />
          ) : (
            <Users className="w-16 h-16 text-green-500" />
          )}
        </div>

        {/* Description with Dynamic Text */}
        <p className="text-muted-foreground mb-4">
          {portfolioType === "personal"
            ? "Investing is a great way to grow your money, but it can be confusing. Try your hand at investing with our stock simulator using mock money but real-time data."
            : "Compete with friends in a stock market league! Create or join a league to see who can build the best portfolio over time."}
        </p>

        {/* Button Only for Personal Portfolio */}
        {portfolioType === "personal" && (
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() => navigate(`/stocksim?portfolio_type=personal`)}
          >
            Start Investing
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
