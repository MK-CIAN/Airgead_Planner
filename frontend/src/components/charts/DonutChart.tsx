// DonutChart.tsx
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface DonutChartProps {
  principal: number;
  interest: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ principal, interest }) => {
  const theme = useTheme();
  const total = principal + interest;
  const principalPercentage = total > 0 ? (principal / total) * 100 : 0;
  const interestPercentage = 100 - principalPercentage;

  return (
    <Box
      sx={{
        position: 'relative',
        width: 200,
        height: 200,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="18"
          cy="18"
          r="15.915"
          fill="none"
          stroke={theme.palette.success.main}
          strokeWidth="3.8"
        />
        <circle
          cx="18"
          cy="18"
          r="15.915"
          fill="none"
          stroke={theme.palette.success.main}
          strokeWidth="3.8"
          strokeDasharray={`${principalPercentage} ${100 - principalPercentage}`}
          strokeDashoffset="25"
        />
        <circle
          cx="18"
          cy="18"
          r="15.915"
          fill="none"
          stroke={theme.palette.error.main}
          strokeWidth="3.8"
          strokeDasharray={`${interestPercentage} ${100 - interestPercentage}`}
          strokeDashoffset={25 + principalPercentage}
        />
      </svg>

      {/* Center Label */}
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">{Math.round(principalPercentage)}%</Typography>
        <Typography variant="caption" color="textSecondary">
          Principal
        </Typography>
        <Typography variant="caption" color="textSecondary">
          vs. Interest
        </Typography>
      </Box>
    </Box>
  );
};

export default DonutChart;
