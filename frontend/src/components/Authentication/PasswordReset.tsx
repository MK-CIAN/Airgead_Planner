import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Axios from "../Services/Axios";
import { toast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Validation Schema for Password Reset
const passwordResetSchema = yup.object({
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Must contain at least one special character"
    ),
  password2: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

interface PasswordResetForm {
  password: string;
  password2: string;
}

const PasswordReset = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    // Resetting the error message before submission
    try {
      await Axios.post("password_reset/confirm/", {
        password: data.password,
        token: token,
      });

      setSuccessMessage("Your password has been successfully reset.");
      
      toast({
        title: "Success",
        description: "Your password was updated. Redirecting to login...",
        variant: "successfull",
      });

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error: any) {
      console.error("Password Reset Error:", error.response?.data || error);
      setErrorMessage(error.response?.data?.detail || "Password reset failed.");

      toast({
        title: "Error",
        description: "Password reset failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <Card className="w-full max-w-sm md:max-w-md lg:max-w-lg shadow-lg px-4 py-6">
        <CardHeader className="text-center text-xl font-semibold">
          Reset Password
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
              <Label htmlFor="password">New Password</Label>
              <Input
                type="password"
                id="password"
                {...register("password")}
                className={`border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password2">Confirm Password</Label>
              <Input
                type="password"
                id="password2"
                {...register("password2")}
                className={`border ${
                  errors.password2 ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.password2 && (
                <p className="text-red-500 text-sm">{errors.password2.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordReset;
