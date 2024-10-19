import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

// Define the prop types for BudgetChart
interface BudgetChartProps {
  data: {
    value: number;
    label: string;
  }[];
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
  return (
    <Box 
      sx={{
        margin: 'auto', // Center the chart
        display: 'flex', // Use flexbox
        justifyContent: 'center', // Center horizontally
        alignItems: 'center', // Center vertically
      }}
    >
        <PieChart series={[{ data, innerRadius: 140 }]} {...size}>
        <PieCenterLabel>Monthly Budget</PieCenterLabel>
        </PieChart>
    </Box>
  );
};

export default BudgetChart;