import React, { useEffect, useState } from "react";
import Axios from "../Axios";
import { Line } from "react-chartjs-2";
import "../../App.css";

const PortfolioGrowthChart: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await Axios.get(`data/portfolio/history/`);
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch portfolio history:", error);
      }
    };

    fetchHistory();
  }, []);

  const data = {
    labels: history.map((entry) => entry.timestamp), // X-axis: timestamps
    datasets: [
      {
        // No label for the dataset
        data: history.map((entry) => entry.total_value), // Y-axis: portfolio value
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.2)",
        fill: false,
        pointHoverRadius: 8,
        pointBackgroundColor: "green",
      },
    ],
  };

  const options = {
    responsive: true, // Ensure the chart is responsive
    maintainAspectRatio: false, // Disable aspect ratio for custom sizing
    plugins: {
      legend: {
        display: false, // Disable the legend
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const labelIndex = context.dataIndex;
            const transactionLabel = history[labelIndex]?.transaction_label;
            return transactionLabel || `Value: $${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
        ticks: {
          callback: function (value: any, index: any) {
            // Directly format `entry.timestamp` into YYYY-MM-DD
            const timestamp = history[index]?.timestamp;
            return timestamp ? timestamp.split("T")[0] : ""; // Shortened date format (YYYY-MM-DD)
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Portfolio Value ($)",
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <Line data={data} options={options} />
    </div>
  );
};

export default PortfolioGrowthChart;
