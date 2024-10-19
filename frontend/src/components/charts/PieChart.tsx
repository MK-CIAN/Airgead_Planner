import { PieChart } from '@mui/x-charts/PieChart';
import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

interface BranchData {
  id: string;       // The unique identifier for each branch
  total_sales: string; // The total sales value as a string
}

interface ChartData {
  id: string;      // Unique id for the chart slice
  value: number;   // Sales value for the chart slice
  label: string;   // Label for the chart slice
}

export default function MyPieChart({ myData }: { myData: BranchData[] }) {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Transform incoming data to the format expected by PieChart
    const transformedData = myData.map(branch => ({
      id: branch.id, // Use the branch id
      value: parseFloat(branch.total_sales), // Convert string sales to float
      label: `Branch ${branch.id}`, // Create a label for the branch
    }));
    
    setChartData(transformedData); // Update state with transformed data
  }, [myData]);

  return (
    <Box 
      sx={{
        display: 'flex', // Use flexbox
        justifyContent: 'center', // Center horizontally
        alignItems: 'center', // Center vertically
        height: '30vh', // Full viewport height (adjust as needed)
        margin: '5%', // Center the chart
      }}
    >
      <PieChart
        series={[
          {
            data: chartData, // Use the transformed chart data
          },
        ]}
        width={400}
        height={200} // Make it square for symmetry
      />
    </Box>
  );
}
