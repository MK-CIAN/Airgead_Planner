// LoanChart.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import DonutChart from './DonutChart';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LoanChartProps {
  repaymentSchedule: number[];
  customRepaymentSchedule?: number[];
  totalInterest: number;
  loanBalance: number;
  isEditing: boolean;
}

const LoanChart: React.FC<LoanChartProps> = ({ repaymentSchedule, customRepaymentSchedule, totalInterest, loanBalance, isEditing }) => {
  const lineChartData = {
    labels: repaymentSchedule.map((_, index) => `Month ${index + 1}`),
    datasets: [
      {
        label: 'Original Repayment Schedule',
        data: repaymentSchedule,
        fill: false,
        borderColor: 'blue',
      },
      ...(isEditing && customRepaymentSchedule
        ? [
            {
              label: 'Custom Repayment Schedule',
              data: customRepaymentSchedule,
              fill: false,
              borderColor: 'red',
              borderDash: [5, 5],
            },
          ]
        : []),
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: isEditing && customRepaymentSchedule ? true : false, // Show legend only if custom schedule exists
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Remaining Loan Balance (€)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
    },
  };

  return (
    <div>
      {/* Line Chart for Repayment Schedule */}
      <div style={{ marginBottom: '20px',}}>
        <Line data={lineChartData} options={lineChartOptions} width={isEditing ? 800 : 400} height={isEditing ? 400 : 200} />
      </div>

      {/* Donut Chart for Principal vs. Interest */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <DonutChart principal={loanBalance} interest={totalInterest} />
      </div>
    </div>
  );
};

export default LoanChart;
