import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import Axios from "../Services/Axios";
import { TypewriterEffectSmooth } from "../ui/typewriter-effect";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  email: string;
  username: string;
  password: string;
  password2: string;
}

// Validation Schemas
const loginSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

const registerSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[!@#$%&*(),.?":;{}|<>+]/,
      "Password must contain at least one special character"
    ),
  password2: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [currentSentence, setCurrentSentence] = useState(0);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forms: Separate `useForm` instances for Login and Register
  const {
    handleSubmit: handleLogin,
    register: registerLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>({ resolver: yupResolver(loginSchema) });

  const {
    handleSubmit: handleRegister,
    register: registerRegister,
    formState: { errors: registerErrors },
  } = useForm<RegisterForm>({ resolver: yupResolver(registerSchema) });

  // Sentences for Typewriter Effect
  const sentences = [
    [
      { text: "Take" },
      { text: "control" },
      { text: "of" },
      { text: "your" },
      { text: "finances", className: "text-green-500" },
      { text: "with" },
      { text: "AirgeadPlanner.", className: "text-green-600" },
    ],
    [
      { text: "Learn" },
      { text: "how" },
      { text: "to" },
      { text: "budget", className: "text-green-500" },
      { text: "with" },
      { text: "AirgeadPlanner.", className: "text-green-600" },
    ],
    [
      { text: "Achieve" },
      { text: "your" },
      { text: "financial" },
      { text: "goals", className: "text-green-500" },
      { text: "with" },
      { text: "AirgeadPlanner.", className: "text-green-600" },
    ],
  ];

  // Cycle sentences every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSentence((prev) => (prev + 1) % sentences.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Login Submission
  const loginSubmission: SubmitHandler<LoginForm> = async (data) => {
    setErrorMessage(null);
    try {
      // 🔑 Authenticate the user
      const response = await Axios.post("login/", {
        email: data.email,
        password: data.password,
      });

      const token = response.data.token;
      localStorage.setItem("Token", token);

      const interestResponse = await Axios.get("data/interests/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const interests = interestResponse.data.interests;

      if (!interests || interests.length === 0) {
        navigate("/userinterests");
      } else {
        navigate("/home");
      }
    } catch (error: any) {
      console.error("Login Error:", error.response?.data || error);

      // Handle specific API errors
      const errorDetail =
        error.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      setErrorMessage(errorDetail);

      // Show toast notification for errors
      toast({
        title: "Login Error",
        description: errorDetail,
        variant: "destructive",
      });
    }
  };

  // Registering Submission
  const registerSubmission: SubmitHandler<RegisterForm> = async (data) => {
    setErrorMessage(null);
    try {
      await Axios.post("register/", {
        email: data.email,
        username: data.username,
        password: data.password,
        password2: data.password2,
      });
  
      toast({
        title: "Registration Successful!",
        description: "Logging you in now...",
        variant: "successfull",
      });
  
      // Automatically logging the user in
      const loginResponse = await Axios.post("login/", {
        email: data.email,
        password: data.password,
      });
  
      const token = loginResponse.data.token;
      localStorage.setItem("Token", token);
  
      // Fetching user interests to determine next page
      const interestResponse = await Axios.get("data/interests/", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const interests = interestResponse.data.interests;
  
      if (!interests || interests.length === 0) {
        navigate("/userinterests");
      } else {
        navigate("/home");
      }
  
    } catch (error: any) {
      console.error("Registration/Login Error:", error.response?.data || error);
  
      // Handle specific API errors
      if (error.response?.data) {
        const backendErrors = error.response.data;
        let errorMessages = [];
        for (const field in backendErrors) {
          if (Array.isArray(backendErrors[field])) {
            errorMessages.push(`${field}: ${backendErrors[field].join(', ')}`);
          } else if (typeof backendErrors[field] === 'string') {
            errorMessages.push(`${field}: ${backendErrors[field]}`);
          }
        }
  
        const formattedMessage = errorMessages.join('\n');
        setErrorMessage(formattedMessage || "Registration failed. Please check your inputs.");
      } else {
        setErrorMessage("Registration failed. Please check your inputs.");
      }
  
      toast({
        title: "Registration Error",
        description: errorMessage || "Registration failed. Please try again.",
        variant: "destructive",
      });
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight sm:leading-snug">
        <TypewriterEffectSmooth
          key={currentSentence}
          words={sentences[currentSentence]}
        />
      </div>

      {/* Toggle Login / Signup */}
      <div className="flex space-x-4 my-6">
        <Button
          onClick={() => {
            setIsLogin(true);
            setErrorMessage(null);
          }}
          className={`w-40 h-10 rounded-xl border-2 text-sm ${
            isLogin
              ? "border-green-600 bg-green-600 text-white hover:bg-green-600 hover:text-white"
              : "border-green-500 bg-white text-black hover:bg-green-600 hover:text-white"
          }`}
        >
          Login
        </Button>
        <Button
          onClick={() => {
            setIsLogin(false);
            setErrorMessage(null);
          }}
          className={`w-40 h-10 rounded-xl border-2 text-sm ${
            !isLogin
              ? "border-green-600 bg-green-600 text-white hover:bg-green-600 hover:text-white"
              : "border-green-500 bg-white text-black hover:bg-green-600 hover:text-white"
          }`}
        >
          Signup
        </Button>
      </div>

      {/* Authentication Card */}
      <Card className="w-full max-w-sm md:max-w-md lg:max-w-lg shadow-lg px-4 py-6">
        <CardHeader className="text-center text-xl font-semibold">
          {isLogin ? "Login" : "Register an Account"}
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription className="whitespace-pre-line">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin(loginSubmission)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  {...registerLogin("email")}
                  className={`border ${
                    loginErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {loginErrors.email && (
                  <p className="text-red-500 text-sm">
                    {loginErrors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  {...registerLogin("password")}
                  className={`border ${
                    loginErrors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {loginErrors.password && (
                  <p className="text-red-500 text-sm">
                    {loginErrors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                Login
              </Button>
              <Link to="/request/password_reset">
                Forgot your password? Reset here
              </Link>
            </form>
          ) : (
            <form
              onSubmit={handleRegister(registerSubmission)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  {...registerRegister("email")}
                  className={`border ${
                    registerErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {registerErrors.email && (
                  <p className="text-red-500 text-sm">
                    {registerErrors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  id="username"
                  {...registerRegister("username")}
                  className={`border ${
                    registerErrors.username ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {registerErrors.username && (
                  <p className="text-red-500 text-sm">
                    {registerErrors.username.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="register-password"
                  autoComplete="new-password"
                  {...registerRegister("password")}
                  className={`border ${
                    registerErrors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {registerErrors.password && (
                  <p className="text-red-500 text-sm">
                    {registerErrors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password2">Confirm Password</Label>
                <Input
                  type="password"
                  id="register-password2"
                  autoComplete="new-password"
                  {...registerRegister("password2")}
                  className={`border ${
                    registerErrors.password2 ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {registerErrors.password2 && (
                  <p className="text-red-500 text-sm">
                    {registerErrors.password2.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                Register
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;