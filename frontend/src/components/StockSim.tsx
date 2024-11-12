import React, { useEffect, useState } from "react";
import Axios from "./Axios";
import StockChart from "./charts/StockChart";
import { Button, Typography, Box, Card, CardContent } from "@mui/material";
import dayjs from "dayjs";

interface StockData {
  ticker: string;
  date: string;
  close_price: number;
  open_price: number;
  high_price: number;
  low_price: number;
  adj_close_price: number;
  volume: number;
}

const FAANG_TICKERS = ['META', 'AMZN', 'AAPL', 'NFLX', 'GOOGL'];

const StockSim: React.FC = () => {
  const [stocks, setStocks] = useState<Record<string, StockData | null>>({}); // Holds current day data for each stock
  const [expandedStockData, setExpandedStockData] = useState<StockData[] | null>(null); // Holds full data for expanded stock
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedLoading, setExpandedLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedStock, setExpandedStock] = useState<string | null>(null); // Tracks which stock is expanded

  // Fetch current day's data for each stock
  const fetchCurrentDayData = async (ticker: string) => {
    const today = "2024-11-11"
    try {
        const response = await Axios.get(`data/stocks/`, {
            params: { ticker, start_date: today, end_date: today },
        });

        // Check if data exists in the response
        if (response.data && response.data.length > 0) {
            const entry = response.data[0];
            return {
                ticker,
                close_price: Number(entry.close_price),
                open_price: Number(entry.open_price),
                high_price: Number(entry.high_price),
                low_price: Number(entry.low_price),
                adj_close_price: Number(entry.adj_close_price),
                volume: Number(entry.volume),
                date: dayjs(entry.date).format("YYYY-MM-DD"),
            };
        } else {
            console.warn(`No data found for ${ticker} on ${today}`);
            return null; // Return null if no data is found for today
        }
    } catch (error) {
        console.error(`Error fetching current day data for ${ticker}:`, error);
        throw error;
    }
  };

  // Fetch a full year of data for a selected stock
  const fetchYearlyData = async (ticker: string) => {
    setExpandedLoading(true);
    const startDate = "2023-11-11" //Hardcoding start date due to yfinance api limitations for now
    const endDate = "2024-11-11"

    try {
      const response = await Axios.get(`data/stocks/`, {
        params: { ticker, start_date: startDate, end_date: endDate },
      });
      const fullData = response.data.map((entry: any) => ({
        ticker,
        close_price: Number(entry.close_price),
        open_price: Number(entry.open_price),
        high_price: Number(entry.high_price),
        low_price: Number(entry.low_price),
        adj_close_price: Number(entry.adj_close_price),
        volume: Number(entry.volume),
        date: dayjs(entry.date).format("YYYY-MM-DD"),
      }));

      const latestData = stocks[ticker]; // Use the current day data already fetched
      if (latestData) {
        fullData.push(latestData);
      }
      setExpandedStockData(fullData); // Set expanded stock data for the chart
    } catch (error) {
      console.error(`Error fetching yearly data for ${ticker}:`, error);
      setError("Failed to load full data for expanded view.");
    } finally {
      setExpandedLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
        setLoading(true);
        try {
            const stockDataPromises = FAANG_TICKERS.map((ticker) => fetchCurrentDayData(ticker));
            const results = await Promise.all(stockDataPromises);
            const initialStocks = results.reduce((acc, data) => {
                if (data) { // Only add if data is not null
                    acc[data.ticker] = data;
                }
                return acc;
            }, {} as Record<string, StockData | null>);
            setStocks(initialStocks);
        } catch (error) {
            setError("Failed to load stock data.");
        } finally {
            setLoading(false);
        }
    };

    loadInitialData();
}, []);


  const handleViewMore = (ticker: string) => {
    if (ticker === expandedStock) {
      setExpandedStock(null); // Collapse if already expanded
      setExpandedStockData(null);
    } else {
      setExpandedStock(ticker); // Expand and fetch full data
      fetchYearlyData(ticker);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>FAANG Stocks Overview</h1>
      {expandedStock ? (
        // Full-screen expanded view for selected stock
        <Box display="flex" flexDirection="column" alignItems="center" p={4}>
          <Card style={{ width: "100%", maxWidth: 800 }}>
            <CardContent>
              {expandedStockData && expandedStockData.length > 0 && (
                <>
                  <Typography variant="h4" align="center">{expandedStock}</Typography>
                  <Typography>Close: ${expandedStockData[expandedStockData.length - 1].close_price.toFixed(2)}</Typography>
                  <Typography>Open: ${expandedStockData[expandedStockData.length - 1].open_price.toFixed(2)}</Typography>
                  <Typography>High: ${expandedStockData[expandedStockData.length - 1].high_price.toFixed(2)}</Typography>
                  <Typography>Low: ${expandedStockData[expandedStockData.length - 1].low_price.toFixed(2)}</Typography>
                  <Typography>Volume: {expandedStockData[expandedStockData.length - 1].volume.toLocaleString()}</Typography>
                  {expandedLoading ? (
                    <p>Loading chart data...</p>
                  ) : (
                    <Box mt={2}>
                      <StockChart data={expandedStockData} ticker={expandedStock} />
                    </Box>
                  )}
                </>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleViewMore(expandedStock)}
                style={{ marginTop: "10px" }}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </Box>
      ) : (
        // Grid view for all stocks when no stock is expanded
        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={3}>
          {Object.values(stocks).map((stockData) => (
            stockData && (
              <Card key={stockData.ticker}>
                <CardContent>
                  <Typography variant="h6" align="center">{stockData.ticker}</Typography>
                  <Typography>Close: ${stockData.close_price.toFixed(2)}</Typography>
                  <Typography>Open: ${stockData.open_price.toFixed(2)}</Typography>
                  <Typography>High: ${stockData.high_price.toFixed(2)}</Typography>
                  <Typography>Low: ${stockData.low_price.toFixed(2)}</Typography>
                  <Typography>Volume: {stockData.volume.toLocaleString()}</Typography>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleViewMore(stockData.ticker)}
                    style={{ marginTop: "10px" }}
                  >
                    View More
                  </Button>
                </CardContent>
              </Card>
            )
          ))}
        </Box>
      )}
    </div>
  );
};

export default StockSim;
