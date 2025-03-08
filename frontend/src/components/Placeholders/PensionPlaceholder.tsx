import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

export default function PensionPlaceholder() {
  return (
    <Card className="w-full h-full flex flex-col justify-center items-center text-center border border-dashed">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          No Saved Projections Yet
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center items-center flex-grow">
        <div className="w-16 h-16 flex items-center justify-center rounded-full mb-4">
          <Calculator className="w-16 h-16 text-green-500" />
        </div>
        <p className="text-muted-foreground">
          Pensions are a complex topic. Start by calculating a pension projection to see how much you need to save for retirement, and save your projections for future reference.
        </p>
      </CardContent>
    </Card>
  );
}
