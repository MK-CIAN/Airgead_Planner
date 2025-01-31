import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface ActiveLoanFormProps {
  onSaveLoan: (data: {
    name: string;
    balance: number;
    interestRate: number;
    termLength: number;
    paymentDueDate: string;
  }) => void;
}

const ActiveLoanForm: React.FC<ActiveLoanFormProps> = ({ onSaveLoan }) => {
  const { control, handleSubmit, reset, setValue } = useForm();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const onSubmit = (data: any) => {
    onSaveLoan({
      name: data.name,
      balance: parseFloat(data.balance),
      interestRate: parseFloat(data.interestRate),
      termLength: parseInt(data.termLength, 10),
      paymentDueDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
    });
    reset();
    setSelectedDate(undefined);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Loan Name</Label>
        <Controller
          name="name"
          control={control}
          defaultValue=""
          render={({ field }) => <Input {...field} placeholder="Enter loan name" required />}
        />
      </div>
      <div>
        <Label htmlFor="balance">Loan Amount</Label>
        <Controller
          name="balance"
          control={control}
          defaultValue=""
          render={({ field }) => <Input {...field} type="number" placeholder="Enter loan amount" required />}
        />
      </div>
      <div>
        <Label htmlFor="interestRate">Interest Rate (APY)</Label>
        <Controller
          name="interestRate"
          control={control}
          defaultValue=""
          render={({ field }) => <Input {...field} type="number" placeholder="Enter interest rate" required />}
        />
      </div>
      <div>
        <Label htmlFor="termLength">Term Length (months)</Label>
        <Controller
          name="termLength"
          control={control}
          defaultValue=""
          render={({ field }) => <Input {...field} type="number" placeholder="Enter term length" required />}
        />
      </div>

      {/* ShadCN Calendar for Payment Due Date */}
      <div>
        <Label htmlFor="paymentDueDate">First Payment Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full">
              {selectedDate ? format(selectedDate, "PPP") : "Pick a Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                if (date) {
                  setValue("paymentDueDate", format(date, "yyyy-MM-dd"));
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button type="submit" className="w-full bg-blue-500 text-white">
        Save Loan
      </Button>
    </form>
  );
};

export default ActiveLoanForm;
