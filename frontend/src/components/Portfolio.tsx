import React, { useState, useEffect } from "react";
import Axios from "./Axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import PortfolioGrowthChart from "./charts/PortfolioGrowthChart";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface Portfolio {
  balance: number;
  totalbalance: number;
  holdings: { ticker: string; quantity: number; current_price: number }[];
}

interface PortfolioProps {
  stocks: Record<string, { close_price: number } | null>;
}

const Portfolio: React.FC<PortfolioProps> = ({ stocks }) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [ticker, setTicker] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(0);
  const [amount, setAmount] = useState<string>(""); 
  const [transactionType, setTransactionType] = useState<string>("BUY");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await Axios.get(`data/portfolio/`);
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
  }, [amount, ticker]);


  const handleTransaction = async () => {
    if (!ticker || quantity <= 0) {
      toast({ title: "Please enter a valid ticker and quantity.", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);

    const pricePerShare = stocks[ticker]?.close_price || 0;
    if (pricePerShare <= 0) {
      toast({ title: "Invalid stock price.", variant: "destructive" });
      return;
    }

    const calculatedQuantity = parseFloat((parseFloat(amount) / pricePerShare).toFixed(6)); // ✅ Ensure it's a valid float

    const response = await Axios.post(`data/portfolio/`, {
      ticker,
      transaction_type: transactionType,
      quantity: calculatedQuantity, // ✅ Send decimal quantity
      price_per_share: pricePerShare,
    });

    if (response.status === 200 || response.status === 201) {
      toast({ title: "Transaction Successful", description: `${transactionType} ${calculatedQuantity.toFixed(6)} ${ticker}`, variant: "successfull" });
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
    fetchPortfolio();
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
                <p className="text-lg font-semibold">Cash Balance: ${typeof portfolio.balance === "number"
                  ? portfolio.balance.toFixed(2)
                  : parseFloat(portfolio.balance || "0").toFixed(2)}</p>
                <p className="text-lg font-semibold">Total Balance: ${portfolio?.totalbalance?.toFixed(2)}</p>
              </div>

              <h3 className="font-semibold mb-2">Holdings</h3>
              <div className="space-y-3">
                {portfolio.holdings.length > 0 ? (
                  portfolio.holdings.map((holding) => (
                    <Card key={holding.ticker}>
                      <CardContent>
                        <p>Ticker: {holding.ticker}</p>
                        <p>Quantity: {holding.quantity.toFixed(6)}</p>
                        <p>Current Price: ${holding.current_price.toFixed(2)}</p>
                        <p>Value: ${(holding.current_price * holding.quantity).toFixed(2)}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p>No holdings available.</p>
                )}
              </div>
            </>
          ) : (
            <p>No portfolio data available.</p>
          )}

          {/* Transaction Section */}
          <div className="mt-6 p-4 border rounded-lg">
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
              <Input placeholder="Amount to Spend" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <p>Shares: {quantity.toFixed(6)}</p>
              <div className="flex gap-2">
                <Button variant={transactionType === "BUY" ? "default" : "outline"} onClick={() => setTransactionType("BUY")}>
                  Buy
                </Button>
                <Button variant={transactionType === "SELL" ? "default" : "outline"} onClick={() => setTransactionType("SELL")}>
                  Sell
                </Button>
                <Button className="ml-auto" onClick={handleTransaction}>
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Chart Section */}
        <div className="flex-1">
          <PortfolioGrowthChart />
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
