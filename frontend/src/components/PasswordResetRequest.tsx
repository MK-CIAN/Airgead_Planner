import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import Axios from "./Axios";
import { toast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Validation Schema
const passwordResetSchema = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
});

interface PasswordResetForm {
  email: string;
}

const PasswordResetRequest = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<PasswordResetForm>({
    resolver: yupResolver(passwordResetSchema),
  });

  const submission: SubmitHandler<PasswordResetForm> = async (data) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await Axios.post("password_reset/", { email: data.email });
      setSuccessMessage("Password reset request sent! Check your email.");
      
      toast({
        title: "Success",
        description: "Check your email for the password reset link.",
        variant: "successfull",
      });

      setTimeout(() => navigate("/"), 3000);
    } catch (error: any) {
      console.error("Password Reset Error:", error.response?.data || error);
      setErrorMessage(error.response?.data?.detail || "Failed to send request.");
      
      toast({
        title: "Error",
        description: "Failed to send password reset request. Try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <Card className="w-full max-w-sm md:max-w-md lg:max-w-lg shadow-lg px-4 py-6">
        <CardHeader className="text-center text-xl font-semibold">
          Request Password Reset
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert variant="default">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(submission)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                {...register("email")}
                className={`border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Request Password Reset
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordResetRequest;
