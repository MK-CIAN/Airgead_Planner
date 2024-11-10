import React, { useEffect, useState } from "react";
import Axios from "./Axios";
import StockChart from "./charts/StockChart";
import StockForm from "./forms/StockForm";
import dayjs from "dayjs";

interface StockData {
  date: string;
  close_price: number;
  open_price: number;
  high_price: number;
  low_price: number;
  adj_close_price: number;
  volume: number;
}

const StockSim: React.FC = () => {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ticker, setTicker] = useState<string>("META"); // Mutable ticker with setter

  const getStockData = async (ticker: string, startDate: string, endDate: string) => {
    try {
      const response = await Axios.get(`data/stocks/`, {
        params: { ticker, start_date: startDate, end_date: endDate },
      });
      const formattedData = response.data.map((entry: any) => ({
        ...entry,
        close_price: Number(entry.close_price),
        open_price: Number(entry.open_price),
        high_price: Number(entry.high_price),
        low_price: Number(entry.low_price),
        adj_close_price: Number(entry.adj_close_price),
        volume: Number(entry.volume),
        date: dayjs(entry.date), // Convert date to Dayjs for easier manipulation
      }));
      setStockData(formattedData); // Set the formatted data
    } catch (error) {
      console.error("Error fetching stock data:", error);
      throw error;
    }
  };

  useEffect(() => {
    const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString()
      .split("T")[0];
    const endDate = new Date().toISOString().split("T")[0];

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await getStockData(ticker, startDate, endDate);
      } catch (err) {
        setError("Failed to fetch stock data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]); // Re-fetch data when the ticker changes

  const handleTickerSubmit = (selectedTicker: string) => {
    setTicker(selectedTicker); // Update ticker, triggering a re-fetch in useEffect
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Stock Data Viewer</h1>
      <StockForm onSubmit={handleTickerSubmit} />
      {stockData.length > 0 ? (
        <StockChart data={stockData} ticker={ticker} />
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default StockSim;
