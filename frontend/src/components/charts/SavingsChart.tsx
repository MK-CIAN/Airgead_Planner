// SavingsChart.tsx
import React from 'react';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { Box, Typography } from '@mui/material';

interface SavingsChartProps {
  progress: number;
}

const SavingsChart: React.FC<SavingsChartProps> = ({ progress }) => {
  return (
    <Box position="relative" display="inline-flex">
      <Gauge
        width={200}
        height={200}
        value={progress}  // Setting the gauge's value to the progress percentage
        cornerRadius="50%"
        sx={{
          [`& .${gaugeClasses.valueText}`]: {
            display: 'none', 
          },
          [`& .${gaugeClasses.valueArc}`]: {
            fill: 'rgba(6,170,19,0.8477591720281863)',  // Color for the progress arc
          },
          [`& .${gaugeClasses.referenceArc}`]: {
            fill: '#cccccc',
          },
        }}
      />
      {/* Overlay Text for Percentage */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        component="div"  // Explicitly specify component to satisfy TypeScript
      >
        <Typography variant="h5" component="span" fontSize={40} fontWeight="bold">
          {Math.round(progress)}%
        </Typography>
      </Box>
    </Box>
  );
};

export default SavingsChart;
