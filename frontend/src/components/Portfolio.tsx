import React, { useState, useEffect } from "react";
import Axios from "./Axios";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
} from "@mui/material";
import "../App.css";

interface Portfolio {
  balance: number;
  holdings: { ticker: string; quantity: number }[];
}

interface PortfolioProps {
  stocks: Record<string, { close_price: number } | null>; // Pass stocks from StockSim
}

const Portfolio: React.FC<PortfolioProps> = ({ stocks }) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [ticker, setTicker] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(0);
  const [transactionType, setTransactionType] = useState<string>("BUY");

  // Fetch portfolio data
  const fetchPortfolio = async () => {
    try {
      const response = await Axios.get(`data/portfolio/`);
      console.log("Portfolio API response:", response.data);
      setPortfolio(response.data);
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
    }
  };

  // Handle buy/sell transactions
  const handleTransaction = async () => {
    if (!ticker || quantity <= 0) {
      alert("Please enter a valid ticker and quantity.");
      return;
    }

    try {
      const response = await Axios.post(`data/portfolio/`, {
        ticker,
        transaction_type: transactionType,
        quantity,
        price_per_share: stocks[ticker]?.close_price || 0, // Use current stock price
      });
      setPortfolio(response.data);
      alert("Transaction successful!");
    } catch (error) {
      console.error("Error executing transaction:", error);
      alert("Transaction failed!");
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  return (
    <Box mb={4}>
      <Typography variant="h4">Your Portfolio</Typography>
      {portfolio ? (
        <div>
          <Typography variant="h6">
            Balance: $
            {typeof portfolio.balance === "number"
              ? portfolio.balance.toFixed(2)
              : parseFloat(portfolio.balance || "0").toFixed(2)}
          </Typography>
          <Typography variant="h6">Holdings:</Typography>
          <Box>
            {portfolio.holdings && portfolio.holdings.length > 0 ? (
              portfolio.holdings.map((holding) => (
                <Card key={holding.ticker} style={{ marginBottom: "10px" }}>
                  <CardContent>
                    <Typography>Ticker: {holding.ticker}</Typography>
                    <Typography>Quantity: {holding.quantity}</Typography>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography>No holdings available.</Typography>
            )}
          </Box>
        </div>
      ) : (
        <Typography>Loading portfolio...</Typography>
      )}
      <Box mt={4}>
        <Typography variant="h6">Make a Transaction</Typography>
        <TextField
          label="Ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
        />
        <TextField
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <div className="portfolio-buttons">
          <Button
            onClick={() => setTransactionType("BUY")}
            variant="contained"
            className={`portfolio-button ${
              transactionType === "BUY" ? "selected" : ""
            }`}
          >
            Buy
          </Button>
          <Button
            onClick={() => setTransactionType("SELL")}
            variant="contained"
            className={`portfolio-button ${
              transactionType === "SELL" ? "selected" : ""
            }`}
          >
            Sell
          </Button>
          <Button
            onClick={handleTransaction}
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </div>
      </Box>
    </Box>
  );
};

export default Portfolio;
