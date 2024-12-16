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
    labels: history.map((entry) => new Date(entry.timestamp).toLocaleDateString()), // X-axis: date labels
    datasets: [
      {
        data: history.map((entry) => entry.total_value), // Portfolio value line
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.2)",
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: history.map((entry) =>
          entry.transaction_label ? "green" : "blue" // Highlight transaction points
        ),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const labelIndex = context.dataIndex;
            const transactionLabel = history[labelIndex]?.transaction_label;
            return transactionLabel || `Value: $${context.raw}`;
          },
        },
      },
      legend: {
        display: false, // Disable legend
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
        ticks: {
          maxRotation: 0, // Prevent overlap
          autoSkip: true,
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
