import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUpDown } from "lucide-react";

interface IncomePlaceholderProps {
  type: "breakdown" | "comparison";
}

export default function IncomePlaceholder({ type }: IncomePlaceholderProps) {
  return (
    <Card className="w-full h-full flex flex-col justify-center items-center text-center border border-dashed">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {type === "breakdown"
            ? "No Saved Tax Breakdowns Yet"
            : "Not Enough Salaries to Compare"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center items-center flex-grow">
        <div className="w-16 h-16 flex items-center justify-center rounded-full mb-4">
        {type === "breakdown"
            ? <Calculator className="w-16 h-16 text-green-500" />
            : <TrendingUpDown className="w-16 h-16 text-green-500" />}
        </div>
        <p className="text-muted-foreground">
          {type === "breakdown"
            ? "Tax can be complicated. Save different salary breakdowns to see how much tax you pay at different income levels."
            : "You need at least two saved salary breakdowns to compare their tax impact. Save another salary breakdown to get started."}
        </p>
      </CardContent>
    </Card>
  );
}
