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
  fontSize: 20,
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
  // Add color property to each data point based on type
  console.log("Chart Data:", data)
  const chartData = data.map(item => ({
    ...item,
    color: item.type === 'income' ? 'green' : 'red', // Adjust based on your criteria
  }));
  return (
    <Box 
      sx={{
        margin: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
        <PieChart 
          series={[{ 
            data: chartData.map(item => ({ value: item.value, label: item.label, color: item.color })),
            innerRadius: 140 
          }]} 
          {...size}
        >
          <PieCenterLabel>Monthly Budget</PieCenterLabel>
        </PieChart>
    </Box>
  );
};

export default BudgetChart;
