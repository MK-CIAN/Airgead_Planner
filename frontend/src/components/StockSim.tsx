import React, { useEffect, useState } from "react";
import Axios from "./Axios";
import StockChart from "./charts/StockChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "dayjs";
import Portfolio from "./Portfolio";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StockData {
  previous_close: any;
  ticker: string;
  date: string;
  close_price: number;
  open_price: number;
  high_price: number;
  low_price: number;
  adj_close_price?: number;
  volume: number;
}

const STOCK_CATEGORIES = {
  FAANG: ["META", "AMZN", "AAPL", "NFLX", "GOOGL"],
  Crypto: ["BTC-USD", "ETH-USD", "DOGE-USD"],
  Tech: ["TSLA", "MSFT", "NVDA"],
};

const StockSim: React.FC = () => {
  const [stocks, setStocks] = useState<Record<string, StockData | null>>({});
  const [expandedStockData, setExpandedStockData] = useState<StockData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedLoading, setExpandedLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedStock, setExpandedStock] = useState<string | null>(null);
  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

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

  const fetchPreviousDayData = async (ticker: string) => {
    try {
      const response = await Axios.get(`data/stocks/`, {
        params: { ticker, start_date: yesterday, end_date: yesterday },
      });
      if (response.data.length > 0) {
        return Number(response.data[0].close_price);
      }
      return null;
    } catch (error) {
      console.error(`Error fetching previous day's data for ${ticker}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const stockTickers = [...STOCK_CATEGORIES.FAANG, ...STOCK_CATEGORIES.Crypto, ...STOCK_CATEGORIES.Tech];

        const stockDataPromises = stockTickers.map(async (ticker) => {
          const currentData = await fetchCurrentDayData(ticker);
          const previousClose = await fetchPreviousDayData(ticker);

          return currentData ? { ...currentData, previous_close: previousClose } : null;
        });
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
      <h1 className="text-center text-3xl font-bold">Stock Market Simulator</h1>
      <Portfolio stocks={stocks} />
  
      {expandedStock ? (
        <div className="flex flex-col items-center p-4">
          <Card className="w-full max-w-3xl lg:w-3/4 xl:w-2/3 max-w-screen-lg">
            <CardContent>
              {expandedStockData ? (
                <>
                  <h2 className="text-center text-2xl font-semibold">{expandedStock}</h2>
                  <div className="flex justify-center">
                    <img
                      src={`/static/${expandedStock}.png`}
                      alt={expandedStock}
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                  {expandedStockData.length > 0 && (
                    <>
                      <h4>Close: ${expandedStockData.at(-1)?.close_price.toFixed(2)}</h4>
                      <h4>Open: ${expandedStockData.at(-1)?.open_price.toFixed(2)}</h4>
                      <h4>High: ${expandedStockData.at(-1)?.high_price.toFixed(2)}</h4>
                      <h4>Low: ${expandedStockData.at(-1)?.low_price.toFixed(2)}</h4>
                      <h4>Volume: {expandedStockData.at(-1)?.volume.toLocaleString()}</h4>
                      {expandedLoading ? (
                        <Skeleton className="h-40 w-full mt-4" />
                      ) : (
                        <StockChart data={expandedStockData} ticker={expandedStock} />
                      )}
                    </>
                  )}
                  <Button
                    variant="destructive"
                    className="mt-4 w-full"
                    onClick={() => handleViewMore(expandedStock)}
                  >
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
        Object.entries(STOCK_CATEGORIES).map(([category, tickers]) => (
          <div key={category}>
            <h2 className="text-xl font-semibold mt-6">{category} Stocks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickers.map((ticker) => {
                const stock = stocks[ticker];
                if (!stock) return null;
                const change = stock.previous_close
                  ? ((stock.close_price - stock.previous_close) / stock.previous_close) * 100
                  : null;
  
                return (
                  <Card key={ticker}>
                    <CardContent>
                      <img
                        src={`/static/${ticker}.png`}
                        alt={ticker}
                        className="w-20 h-20 object-contain mx-auto"
                      />
                      <h4 className="text-center">{ticker}</h4>
                      <h4>Current Price: ${stock.close_price.toFixed(2)}</h4>
                      <p className={change && change >= 0 ? "text-green-600" : "text-red-600"}>
                        Daily Change: {change?.toFixed(2)}%{" "}
                        {change && (change >= 0 ? <TrendingUp /> : <TrendingDown />)}
                      </p>
                      <Button className="mt-4 w-full" onClick={() => handleViewMore(ticker)}>
                        View More
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
  
};

export default StockSim;
