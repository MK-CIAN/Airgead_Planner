import { PieChart } from '@mui/x-charts/PieChart';
import { useEffect, useState } from 'react';
import { Box } from '@mui/material';

interface BranchData {
  id: string;       
  total_sales: string; 
}

interface ChartData {
  id: string;      
  value: number;   
  label: string;   
}

export default function MyPieChart({ myData }: { myData: BranchData[] }) {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Transforming the incoming data to the format expected by the material UI PieChart
    const transformedData = myData.map(branch => ({
      id: branch.id,
      value: parseFloat(branch.total_sales), 
      label: `Branch ${branch.id}`, 
    }));
    
    setChartData(transformedData);
  }, [myData]);

  return (
    <Box 
      sx={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '30vh', 
        margin: '5%',
      }}
    >
      <PieChart
        series={[
          {
            data: chartData,
          },
        ]}
        width={400}
        height={200}
      />
    </Box>
  );
}
