// src/components/StockChart.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface StockData {
    date: string;
    close_price: number;
}

interface StockChartProps {
    data: StockData[];
    ticker: string;
}

const StockChart: React.FC<StockChartProps> = ({ data, ticker }) => {
    const dates = data.map((entry) => entry.date);
    const closePrices = data.map((entry) => entry.close_price);

    const chartData = {
        labels: dates,
        datasets: [
            {
                label: `${ticker} Close Price`,
                data: closePrices,
                borderColor: 'rgba(75,192,192,1)',
                fill: false,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: `${ticker} Stock Price Over Time` },
        },
    };

    return (
        <div>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default StockChart;
