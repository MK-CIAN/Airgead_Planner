import React, { useEffect, useState } from "react";
import Axios from "./Axios";
import StockChart from "./charts/StockChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "dayjs";
import Portfolio from "./Portfolio";

interface StockData {
  ticker: string;
  date: string;
  close_price: number;
  open_price: number;
  high_price: number;
  low_price: number;
  adj_close_price?: number;
  volume: number;
}

const FAANG_TICKERS = ['META', 'AMZN', 'AAPL', 'NFLX', 'GOOGL', 'TSLA', 'MSFT', 'NVDA', 'BTC-USD', 'ETH-USD', 'DOGE-USD'];

const StockSim: React.FC = () => {
  const [stocks, setStocks] = useState<Record<string, StockData | null>>({});
  const [expandedStockData, setExpandedStockData] = useState<StockData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedLoading, setExpandedLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedStock, setExpandedStock] = useState<string | null>(null);
  const today = dayjs().format("YYYY-MM-DD");

  const fetchCurrentDayData = async (ticker: string) => {
    try {
      const response = await Axios.get(`data/stock-realtime`, {
        params: { ticker },
      });
  
      if (response.data) {
        return {
          ticker,
          close_price: Number(response.data.close_price),
          open_price: Number(response.data.open_price),
          high_price: Number(response.data.high_price),
          low_price: Number(response.data.low_price),
          volume: Number(response.data.volume),
          date: dayjs(response.data.timestamp).format("YYYY-MM-DD"),
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching real-time data for ${ticker}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const stockDataPromises = FAANG_TICKERS.map((ticker) => fetchCurrentDayData(ticker));
        const results = await Promise.all(stockDataPromises);
        const initialStocks = results.reduce((acc, data) => {
          if (data) acc[data.ticker] = data;
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
      setExpandedStock(null);
      setExpandedStockData(null);
    } else {
      setExpandedStock(ticker);
      fetchYearlyData(ticker);
    }
  };

  const fetchYearlyData = async (ticker: string) => {
    setExpandedLoading(true);
    const startDate = dayjs().subtract(1, "year").format("YYYY-MM-DD");

    try {
      const response = await Axios.get(`data/stocks/`, {
        params: { ticker, start_date: startDate, end_date: today },
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

      if (stocks[ticker]) fullData.push(stocks[ticker] as StockData);
      setExpandedStockData(fullData);
    } catch (error) {
      setError("Failed to load full data.");
    } finally {
      setExpandedLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-center text-3xl font-bold">
        Stock Market Simulator
      </h1>
      <Portfolio stocks={stocks} />
      {expandedStock ? (
        <div className="flex flex-col items-center p-4">
          <Card className="w-full max-w-xl">
            <CardContent>
              {expandedStockData ? (
                <>
                  <h2 className="text-center">{expandedStock}</h2>
                  {expandedStockData.length > 0 && (
                    <>
                      <h4> Close: ${expandedStockData.at(-1)?.close_price.toFixed(2)}</h4>
                      <h4>Open: ${expandedStockData.at(-1)?.open_price.toFixed(2)}</h4>
                      <h4>High: ${expandedStockData.at(-1)?.high_price.toFixed(2)}</h4>
                      <h4>Low: ${expandedStockData.at(-1)?.low_price.toFixed(2)}</h4>
                      <h4>Volume: {expandedStockData.at(-1)?.volume.toLocaleString()}</h4>
                      {expandedLoading ? (
                        <Skeleton className="h-40 w-full mt-4" />
                      ) : (
                        <div className="mt-4">
                          <StockChart data={expandedStockData} ticker={expandedStock} />
                        </div>
                      )}
                    </>
                  )}
                  <Button variant="destructive" className="mt-4 w-full" onClick={() => handleViewMore(expandedStock)}>
                    Close
                  </Button>
                </>
              ) : (
                <Skeleton className="h-40 w-full" />
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(stocks).map((stockData) => (
            stockData && (
              <Card key={stockData.ticker}>
                <CardContent>
                  <h4 className="text-center">{stockData.ticker}</h4>
                  <h4>Close: ${stockData.close_price.toFixed(2)}</h4>
                  <h4>Open: ${stockData.open_price.toFixed(2)}</h4>
                  <h4>High: ${stockData.high_price.toFixed(2)}</h4>
                  <h4>Low: ${stockData.low_price.toFixed(2)}</h4>
                  <h4>Volume: {stockData.volume.toLocaleString()}</h4>
                  <Button className="mt-4 w-full" onClick={() => handleViewMore(stockData.ticker)}>
                    View More
                  </Button>
                </CardContent>
              </Card>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default StockSim;
