import React, { useState, useEffect, useRef } from "react";
import Axios from "../Services/Axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import PortfolioGrowthChart from "./PortfolioGrowthChart";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import FeatureTooltip from "../ui/featureTooltip";

interface Portfolio {
  balance: number;
  totalbalance: number;
  holdings: { ticker: string; quantity: number; current_price: number }[];
}

interface PortfolioProps {
  portfolioType: "personal" | "league";
  leagueId?: string;
  stocks: Record<string, { close_price: number } | null>;
}

const Portfolio: React.FC<PortfolioProps> = ({
  portfolioType,
  leagueId,
  stocks,
}) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [ticker, setTicker] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(0);
  const [amount, setAmount] = useState<string>("");
  const [transactionType, setTransactionType] = useState<string>("BUY");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fetchCalled = useRef(false);

  // Fetch portfolio data
  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const url =
        portfolioType === "league"
          ? `data/portfolio/?portfolio_type=league&league_id=${leagueId}`
          : `data/portfolio/?portfolio_type=personal`;

      const response = await Axios.get(url);
      setPortfolio(response.data);
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      setError("Failed to fetch portfolio data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ticker || !stocks[ticker]?.close_price || parseFloat(amount) <= 0) {
      setQuantity(0);
      return;
    }
    const pricePerShare = stocks[ticker]?.close_price || 0;
    setQuantity(parseFloat(amount) / pricePerShare);
  }, [amount, ticker, stocks]);

  // Handle transaction submission
  const handleTransaction = async () => {
    if (!ticker || quantity <= 0) {
      toast({
        title: "Please enter a valid ticker and quantity.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const pricePerShare = stocks[ticker]?.close_price || 0;
      if (pricePerShare <= 0) {
        toast({ title: "Invalid stock price.", variant: "destructive" });
        return;
      }

      const calculatedQuantity = parseFloat(
        (parseFloat(amount) / pricePerShare).toFixed(6)
      );

      const response = await Axios.post(`data/portfolio/`, {
        ticker,
        transaction_type: transactionType,
        quantity: calculatedQuantity,
        price_per_share: pricePerShare,
        portfolio_type: portfolioType,
        league_id: portfolioType === "league" ? leagueId : undefined,
      });

      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Transaction Successful",
          description: `${transactionType} ${calculatedQuantity.toFixed(
            6
          )} ${ticker}`,
          variant: "successfull",
        });
        fetchPortfolio();
      } else {
        toast({ title: "Transaction Failed", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error executing transaction:", error);
      toast({ title: "Transaction Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchCalled.current) {
      fetchCalled.current = true;
      fetchPortfolio();
    }
  }, []);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : portfolio ? (
            <>
              <div className="mb-4 p-4 border rounded-lg">
              <FeatureTooltip content="Your current cash balance and total balance.">
                <p className="text-lg font-semibold">
                  Cash Balance: $
                  {typeof portfolio.balance === "number"
                    ? portfolio.balance.toFixed(2)
                    : parseFloat(portfolio.balance || "0").toFixed(2)}
                </p>
                <p className="text-lg font-semibold">
                  Total Balance: ${portfolio?.totalbalance?.toFixed(2)}
                </p>
              </FeatureTooltip>
              </div>

              <FeatureTooltip content="Your current stock holdings and their value.">
              <h3 className="font-semibold mb-2">Holdings</h3>
              <div className="space-y-3">
                {portfolio.holdings.length > 0 ? (
                  portfolio.holdings.map((holding) => (
                    <Card key={holding.ticker}>
                      <CardContent>
                        <p>Ticker: {holding.ticker}</p>
                        <p>Quantity: {holding.quantity.toFixed(4)}</p>
                        <p>
                          Current Price: ${holding.current_price.toFixed(2)}
                        </p>
                        <p>
                          Value: $
                          {(holding.current_price * holding.quantity).toFixed(
                            2
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p>No holdings available.</p>
                )}
              </div>
              </FeatureTooltip>
            </>
          ) : (
            <p>No portfolio data available.</p>
          )}

          {/* Transaction Section */}
          <div className="mt-6 p-4 border rounded-lg">
            <FeatureTooltip content="Choose a stock, enter the amount you want to spend, and click 'Submit' to make a transaction.">
            <h3 className="font-semibold mb-2">Make a Transaction</h3>
            <div className="flex flex-col space-y-2">
              <Select onValueChange={(value) => setTicker(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a Stock" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(stocks).map((stockTicker) => (
                    <SelectItem key={stockTicker} value={stockTicker}>
                      {stockTicker}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Amount to Spend"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p>Shares: {quantity.toFixed(4)}</p>
              <div className="flex gap-2">
                <Button
                  className={
                    transactionType === "BUY"
                      ? "border-green-600 bg-green-600 text-white hover:bg-green-600 hover:text-white"
                      : "border-green-500 bg-white text-black hover:bg-green-600 hover:text-white"
                  }
                  onClick={() => setTransactionType("BUY")}
                >
                  Buy
                </Button>
                <Button
                  className={
                    transactionType === "SELL"
                      ? "border-red-600 bg-red-600 text-white hover:bg-red-600 hover:text-white"
                      : "border-red-500 bg-white text-black hover:bg-red-600 hover:text-white"
                  }
                  onClick={() => setTransactionType("SELL")}
                >
                  Sell
                </Button>
                <Button className="ml-auto" onClick={handleTransaction}>
                  Submit
                </Button>
              </div>
            </div>
            </FeatureTooltip>
          </div>
        </div>

        {/* ✅ Chart Section */}
        <div className="flex-1">
          <PortfolioGrowthChart
            portfolioType={portfolioType}
            leagueId={leagueId}
          />
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
