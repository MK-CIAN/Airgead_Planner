import { useState, useEffect, useRef } from "react";
import { TrendingUp } from "lucide-react";
import {
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Label,
} from "recharts";

import { CardFooter } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

type SavingsChartProps = {
  progress: number; // Percentage progress
};

const SavingsChart: React.FC<SavingsChartProps> = ({ progress }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ width: 300, height: 300 });

  useEffect(() => {
    const updateSize = () => {
      if (chartContainerRef.current) {
        const containerWidth = chartContainerRef.current.clientWidth;
        const containerHeight = chartContainerRef.current.clientHeight;
        const size = Math.min(containerWidth, containerHeight) * 0.9; // Scale dynamically
        setChartSize({ width: size, height: size });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const chartData = [{ progress: Math.round(progress), fill: "green" }];

  return (
    <div
      ref={chartContainerRef}
      className="flex flex-col items-center w-full h-full"
    >
      <div className="flex-grow flex items-center justify-center w-full h-full">
        <ChartContainer
          config={{}}
          className="w-full h-full flex justify-center items-center"
        >
          <RadialBarChart
            width={chartSize.width}
            height={chartSize.height}
            data={chartData}
            endAngle={(progress * 360) / 100}
            innerRadius={chartSize.width * 0.3} // Dynamically adjust inner radius
            outerRadius={chartSize.width * 0.55} // Dynamically adjust outer radius
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[chartSize.width * 0.35, chartSize.width * 0.25]} // Adjust polar grid dynamically
            />
            <RadialBar dataKey="progress" background />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (!viewBox) return null; // Ensure viewBox exists

                  // Estimate center using innerRadius and outerRadius
                  const cx = "cx" in viewBox ? viewBox.cx : chartSize.width / 2;
                  const cy =
                    "cy" in viewBox ? viewBox.cy : chartSize.height / 2;

                  return (
                    <text x={cx} y={cy ?? chartSize.height / 2} textAnchor="middle" dominantBaseline="middle">
                      {/* Ensure `cy` has a fallback before calculations */}
                      {(() => {
                        const safeCy = cy ?? chartSize.height / 2; // Default to center if undefined
                        const fontSize = Math.max(chartSize.width * 0.1, 16); // Dynamically scale font size
                        const labelOffset = fontSize * 0.5; // Adjust vertical spacing
                  
                        return (
                          <>
                            {/* Percentage Value */}
                            <tspan
                              x={cx}
                              y={safeCy - labelOffset * 0.8} // Move percentage higher
                              className="fill-foreground font-bold"
                              style={{ fontSize: `${fontSize}px` }}
                            >
                              {chartData[0].progress.toLocaleString() + "%"}
                            </tspan>
                  
                            {/* "Percent Saved" Label */}
                            <tspan
                              x={cx}
                              y={safeCy + labelOffset * 1.6} // Move "Percent Saved" much lower
                              className="fill-muted-foreground"
                              style={{ fontSize: `${fontSize * 0.5}px` }} // Slightly larger than before
                            >
                              Percent Saved
                            </tspan>
                          </>
                        );
                      })()}
                    </text>
                  );
                  
                  
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </div>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total Progress Towards Your Goal <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </div>
  );
};

export default SavingsChart;
