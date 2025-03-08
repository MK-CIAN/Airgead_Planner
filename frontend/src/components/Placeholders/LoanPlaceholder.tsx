import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Briefcase } from "lucide-react";

export default function LoanPlaceholder({ type = "calculated-loan" }) {
  return (
    <Card className="w-full h-full p-6 flex flex-col justify-center items-center text-center border border-dashed">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {type === "calculated-loan"
            ? "No Calculated Loans Yet"
            : "No Active Loans Yet"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center items-center flex-grow">
        <div className="w-16 h-16 flex items-center justify-center rounded-full mb-4">
          {type === "calculated-loan" ? (
            <Banknote className="w-16 h-16 text-green-500" />
          ) : (
            <Briefcase className="w-16 h-16 text-green-500" />
          )}
        </div>
        <p className="text-muted-foreground">
          {type === "calculated-loan"
            ? "Want to experiment with loans? Use the 'Calculate New Loan' button above to estimate loan repayment terms and to experment with custom payemnt schedules to see the difference in interest and repayment timelines."
            : "Have an active loan at the moment? Use the 'Add a Loan' button above to track your loan and monitor your repayments."}
        </p>
      </CardContent>
    </Card>
  );
}
