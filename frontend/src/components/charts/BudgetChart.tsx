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

// Predefined color palette for expenses
const expenseColors = [
  '#3357FF', // Bright blue
  '#FF33A8', // Magenta
  '#8A2BE2', // Blue-violet
  '#FFD700', // Gold
  '#FF8F33', // Orange
  '#DA70D6', // Orchid (purple-pink)
  '#7D33FF', // Deep purple
  '#FF1493', // Deep pink
  '#00CED1', // Dark turquoise
  '#9370DB'  // Medium purple
];


// Function to pick a random color from the predefined options
const getRandomExpenseColor = () => {
  const randomIndex = Math.floor(Math.random() * expenseColors.length);
  return expenseColors[randomIndex];
};

const BudgetChart: React.FC<BudgetChartProps> = ({ data }) => {
  // When there's no data, display an empty pie chart
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
  
  const totalDebt = data
  .filter(item => item.type === 'debt')
  .reduce((total, item) => total + item.value, 0);

  // Add color property to each data point based on type
  console.log("Chart Data:", data)
  const chartData = data.map(item => ({
    ...item,
    color: item.type === 'debt'
      ? 'red'
      : item.type === 'expense'
      ? getRandomExpenseColor() 
      : 'rgba(6,170,19,0.8477591720281863)', // Green for income or other types
  }));

  // Calculate total budget (income - expenses)
  const totalBudget = totalIncome - (totalExpenses + totalDebt);
  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        marginLeft: '27.5%',
      }}
    >
      {/* Container for the Pie Chart and Center Label */}
      <Box sx={{ position: 'relative', marginRight: '50px' }}>
      <PieChart 
          series={[{ 
            data: chartData.map(item => ({ value: item.value, label: item.label, color: item.color })),
            innerRadius: 140,
          }]} 
          slotProps={{
            legend: { hidden: true }  // Hide the built-in legend
          }}
          {...size}
        />
        <Box 
          sx={{
            position: 'absolute',
            top: '50%',
            left: '42.5%',
            transform: 'translate(-50%, -50%)',
            fontSize: '50px',
          }}
        >
          <PieCenterLabel>€{totalBudget.toFixed(2)}</PieCenterLabel>
        </Box>
      </Box>

      {/* Custom Legend Section */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start',
          minWidth: '150px', 
          
        }}
      >
        {chartData.map(item => (
          <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <Box 
              sx={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: item.color, 
                marginRight: '8px', 
                borderRadius: '3px'  
              }} 
            />
            <span style={{ fontSize: '16px' }}>{item.label}</span>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default BudgetChart;
