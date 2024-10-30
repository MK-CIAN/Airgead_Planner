// BudgetChart.tsx
import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
// Assuming useDrawingArea is not available, we will create a mock implementation
const useDrawingArea = () => ({
  width: 600,
  height: 400,
  left: 0,
  top: 0,
});

interface BudgetData {

  id: number;
  value: number;
  label: string;
  type: string;
}

interface BudgetChartProps {
  data: BudgetData[];
}

const size = {
  width: 600,
  height: 400,
};

const StyledText = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fontSize: 40,
}));

function PieCenterLabel({ children }: { children: React.ReactNode }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

const BudgetChart: React.FC<BudgetChartProps> = ({ data }) => {
  // When there's no data, display only the "€0.00" label with an empty pie chart
  if (data.length === 0) {
    return (
      <Box 
        sx={{
          margin: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <PieChart series={[{ data: [], innerRadius: 140 }]} {...size}>
          <PieCenterLabel> </PieCenterLabel>
        </PieChart>
      </Box>
    );
  }
  // Calculate totals for income and expenses
  const totalIncome = data
    .filter(item => item.type === 'income')
    .reduce((total, item) => total + item.value, 0);

  const totalExpenses = data
    .filter(item => item.type === 'expense')
    .reduce((total, item) => total + item.value, 0);
  // Add color property to each data point based on type
  console.log("Chart Data:", data)
  const chartData = data.map(item => ({
    ...item,
    color: item.type === 'income' ? 'rgba(6,170,19,0.8477591720281863)' : 'red', // Adjust based on your criteria
  }));

  // Calculate total budget (income - expenses)
  const totalBudget = totalIncome - totalExpenses;
  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative', // Positioning for absolute center label
        width: size.width,
        height: size.height,
        margin: 'auto',
      }}
    >
      <PieChart 
        series={[{ 
          data: chartData.map(item => ({ value: item.value, label: item.label, color: item.color })),
          innerRadius: 140 
        }]} 
        {...size}
      />
      <Box 
        sx={{
          position: 'absolute', // Position the label absolutely in the center
          top: '50%',
          left: '42.5%',
          transform: 'translate(-50%, -50%)', // Center the label
          fontSize: '50px',
        }}
      >
        <PieCenterLabel>€{totalBudget.toFixed(2)}</PieCenterLabel>
      </Box>
    </Box>
  );
};

export default BudgetChart;
