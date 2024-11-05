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

// Register necessary Chart.js components
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
  totalInterest: number;
  loanBalance: number;
}

const LoanChart: React.FC<LoanChartProps> = ({ repaymentSchedule, totalInterest, loanBalance }) => {
  const lineChartData = {
    labels: repaymentSchedule.map((_, index) => `Month ${index + 1}`),
    datasets: [
      {
        label: 'Remaining Loan Balance',
        data: repaymentSchedule,
        fill: false,
        borderColor: 'blue',
      },
    ],
  };

  return (
    <div>
      {/* Line Chart for Repayment Schedule */}
      <div style={{ marginBottom: '20px' }}>
        <Line data={lineChartData} options={{ responsive: true }} />
      </div>

      {/* Donut Chart for Principal vs. Interest */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <DonutChart principal={loanBalance} interest={totalInterest} />
      </div>
    </div>
  );
};

export default LoanChart;
