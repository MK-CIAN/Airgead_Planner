import * as React from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";

// Utility for dynamic chart sizing
const getChartSize = () => {
  const width = Math.min(window.innerWidth * 0.95, 500); // Use 95% of the screen width, max 500px
  const height = width; // Keep the chart square
  return { width, height };
};

// Styled text for the center label
const StyledText = styled("text")(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: "middle",
  dominantBaseline: "central",
  fontSize: 40,
}));

interface BudgetData {
  id: number;
  value: number;
  label: string;
  type: string;
}

interface BudgetChartProps {
  data: BudgetData[];
}

// Random colors for expenses
const expenseColors = [
  "#3357FF",
  "#FF33A8",
  "#8A2BE2",
  "#FFD700",
  "#FF8F33",
  "#DA70D6",
  "#7D33FF",
  "#FF1493",
  "#00CED1",
  "#9370DB",
];

// Function to generate a consistent random color for a label
const getColorForLabel = (label: string) => {
  // Create a hash value based on the label
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) % expenseColors.length;
  }

  // Use hash to randomly shuffle the array index
  return expenseColors[
    (hash + Math.floor(Math.random() * expenseColors.length)) %
      expenseColors.length
  ];
};

function PieCenterLabel({ children }: { children: React.ReactNode }) {
  return <StyledText>{children}</StyledText>;
}

const BudgetChart: React.FC<BudgetChartProps> = ({ data }) => {
  const [chartSize, setChartSize] = React.useState(getChartSize());

  // Handle window resizing
  React.useEffect(() => {
    const handleResize = () => setChartSize(getChartSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Memoize chart data for performance
  const chartData = React.useMemo(
    () =>
      data.map((item) => ({
        value: item.value,
        label: item.label,
        color:
          item.type === "debt"
            ? "red"
            : item.type === "expense"
            ? getColorForLabel(item.label) // Consistent random colors
            : "rgba(6,170,19,0.85)", // Green for income
      })),
    [data]
  );

  // Calculate total budget
  const totalBudget = React.useMemo(() => {
    const totalIncome = data
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.value, 0);
    const totalExpenses = data
      .filter((item) => item.type === "expense" || item.type === "debt")
      .reduce((sum, item) => sum + item.value, 0);
    return totalIncome - totalExpenses;
  }, [data]);

  // Handle no data case after Hooks
  if (data.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
        <PieChart series={[{ data: [], innerRadius: 80 }]} width={chartSize.width} height={chartSize.height} />
        <StyledText>No Data</StyledText>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: window.innerWidth < 600 ? "column" : "row", // Stack legend and chart on small screens
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        marginTop: 4,
      }}
    >
      {/* Pie Chart Section */}
      <Box sx={{ position: "relative", margin: "auto" }}>
        <PieChart
          series={[
            {
              data: chartData,
              innerRadius: chartSize.width < 400 ? 90 : 130,
              outerRadius: chartSize.width < 400 ? 130 : 170,
            },
          ]}
          slotProps={{
            legend: { hidden: true },
          }}
          {...chartSize}
        />
        {/* Center Label */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-75%, -50%)",
          }}
        >
          <PieCenterLabel>€{totalBudget.toFixed(2)}</PieCenterLabel>
        </Box>
      </Box>

      {/* Custom Legend Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 1,
        }}
      >
        {chartData.map((item, index) => (
          <Box
            key={index}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                backgroundColor: item.color,
                borderRadius: "3px",
              }}
            />
            <Typography variant="body2">{item.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default BudgetChart;
