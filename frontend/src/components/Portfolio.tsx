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
import PortfolioGrowthChart from "./charts/PortfolioGrowthChart";

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

  const handleTransaction = async () => {
    if (!ticker || quantity <= 0) {
      alert("Please enter a valid ticker and quantity.");
      return;
    }

    try {
      setLoading(true);
      const response = await Axios.post(`data/portfolio/`, {
        ticker,
        transaction_type: transactionType,
        quantity,
        price_per_share: stocks[ticker]?.close_price || 0,
      });
      alert("Transaction successful!");
      fetchPortfolio();
    } catch (error) {
      console.error("Error executing transaction:", error);
      alert("Transaction failed!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  return (
    <Box>
      {/* Headings Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Your Portfolio</Typography>
        <Box className="chart-header-container">
          <Typography variant="h4" className="chart-header">Portfolio Growth</Typography>
        </Box>
      </Box>
  
      {/* Main Content: Holdings and Chart */}
      <Box display="flex" className="main-content">
        {/* Holdings Section */}
        <Box className="holdings-section">
          {loading ? (
            <Typography>Loading portfolio...</Typography>
          ) : error ? (
            <Typography className="error-message">{error}</Typography>
          ) : portfolio ? (
            <>
              <Typography variant="h6">
                Cash Balance: $
                {typeof portfolio.balance === "number"
                  ? portfolio.balance.toFixed(2)
                  : parseFloat(portfolio.balance || "0").toFixed(2)}
              </Typography>
              <Typography variant="h6">Holdings:</Typography>
              <Box className="holdings-scrollable">
                {portfolio.holdings && portfolio.holdings.length > 0 ? (
                  portfolio.holdings.map((holding) => {
                    const stockPrice = stocks[holding.ticker]?.close_price || 0;
                    const holdingValue = stockPrice * holding.quantity;
  
                    return (
                      <Card key={holding.ticker} className="holding-card">
                        <CardContent>
                          <Typography>Ticker: {holding.ticker}</Typography>
                          <Typography>Quantity: {holding.quantity}</Typography>
                          <Typography>Value: ${holdingValue.toFixed(2)}</Typography>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Typography>No holdings available.</Typography>
                )}
              </Box>
            </>
          ) : (
            <Typography>No portfolio data available.</Typography>
          )}
          <Box className="transaction-section">
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
  
        {/* Chart Section */}
        <Box className="chart-section">
          <PortfolioGrowthChart />
        </Box>
      </Box>
    </Box>
  );
};

export default Portfolio;
