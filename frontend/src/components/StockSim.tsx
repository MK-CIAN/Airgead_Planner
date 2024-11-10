import React, { useEffect, useState } from "react";
import Axios from "./Axios";
import StockChart from "./charts/StockChart";
import dayjs from "dayjs";

interface StockData {
  date: string;
  close_price: number;
}

const StockSim: React.FC = () => {
  const [stockData, setStockData] = React.useState<StockData[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [ticker] = useState<string>("META");

  const getStockData = (ticker: string, startDate: string, endDate: string) => {
    Axios.get(`data/stocks/`, {
        params: { ticker, start_date: startDate, end_date: endDate }
    })
    .then((response) => {
        // Format the response data to make it more manageable
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
        setStockData(formattedData);  // Use your state setter function here
    })
    .catch((error) => {
        console.error("Error fetching stock data:", error);
    });
};


  useEffect(() => {
    // Define the date range (last year)
    const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    // Fetch data when component mounts
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            await getStockData(ticker, startDate, endDate);
        } catch (err) {
            setError('Failed to fetch stock data.');
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, [ticker]);

// Render loading, error, or the stock chart
if (loading) return <p>Loading...</p>;
if (error) return <p>{error}</p>;

return (
    <div>
        <h1>Stock Data Viewer</h1>
        {stockData.length > 0 ? (
            <StockChart data={stockData} ticker={ticker} />
        ) : (
            <p>No data available</p>
        )}
    </div>
);
};

export default StockSim;
