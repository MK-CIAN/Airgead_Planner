import { useState } from "react";
import { motion } from "framer-motion"; // For animations
import { Card, CardContent } from "@/components/ui/card"; // Using shadcn card component
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Axios from "./Axios";
import { toast } from "@/hooks/use-toast";

const questions = [
  {
    question: "Let’s start with debt – which ones are on your mind?",
    options: [
      { value: "credit", label: "Credit Card", icon: "💳" },
      { value: "student", label: "Student Loans", icon: "🎓" },
      { value: "car", label: "Car Loans", icon: "🚗" },
      { value: "medical", label: "Medical Debt", icon: "🏥" },
      { value: "none", label: "I don’t have debt right now" },
    ],
  },
  {
    question: "Are you saving or aspiring to save for any of these? Don't be afraid to dream big!",
    options: [
      { value: "emergency", label: "Emergency Fund", icon: "💰" },
      { value: "home", label: "New Home", icon: "🏠" },
      { value: "retirement", label: "Retirement", icon: "🏦" },
      { value: "holiday", label: "Vacation", icon: "🌴" },
      { value: "investments", label: "Investments", icon: "📈" },
      { value: "none", label: "No current goals" },
    ],
  },
  {
    question: "How do you get around?",
    options: [
      { value: "car", label: "Car", icon: "🚗" },
      { value: "bike", label: "Bike", icon: "🚲" },
      { value: "transit", label: "Public Transit", icon: "🚇" },
      { value: "walk", label: "Walk", icon: "🚶" },
      { value: "rideshare", label: "Rideshare", icon: "🚕" },
    ],
  },
  {
    question: "What type of investing are you interested in?",
    options: [
      { value: "stocks", label: "Stocks", icon: "📈" },
      { value: "bonds", label: "Bonds", icon: "🏦" },
      { value: "crypto", label: "Cryptocurrency", icon: "🪙" },
      { value: "realestate", label: "Real Estate", icon: "🏠" },
      { value: "none", label: "Not interested in investing" },
    ],
  },
];

const UserInterest = () => {
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggleOption = (value: string) => {
    setSelectedInterests((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

    const handleSubmit = () => {
        Axios.post(`data/interests/`, { interests: selectedInterests })
            .then(() => {
                toast({
                    title: "Your Interest Saved Successfully!",
                  });
                  setTimeout(() => {
                    navigate(`/home`);
                  }, 1000);
            })
            .catch((error) => {
                console.error('Error saving interests:', error);
            });
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
          {questions.map((q, idx) => (
            <motion.div
              key={q.question}
              layoutId={`question-${idx}`}
              style={{
                scale: step === idx ? 1 : 0.9,
                zIndex: step === idx ? 1 : -1,
                opacity: step === idx ? 1 : 0,
              }}
              animate={{
                y: step === idx ? [0, 20, 0] : 0,
              }}
              className={`absolute w-full max-w-4xl transition-all duration-500 ${
                step === idx ? "visible" : "invisible"
              }`}
            >
              <Card className="border-4 border-green-600 shadow-xl bg-white px-4 sm:px-6">
                <CardContent>
                  <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    {questions[step].question}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {questions[step].options.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => toggleOption(option.value)}
                        className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedInterests.includes(option.value)
                            ? "border-green-500 bg-green-100"
                            : "border-gray-300 hover:border-green-500 hover:bg-green-50"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-5xl">{option.icon}</span>
                          <span className="mt-4 text-gray-700 font-medium text-lg">
                            {option.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between mt-8">
                {step > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
                    className="text-gray-700 border-gray-400 hover:bg-gray-200"
                  >
                    Previous
                  </Button>
                )}
                {step < questions.length - 1 ? (
                  <Button
                    onClick={() =>
                      setStep((prev) => Math.min(prev + 1, questions.length - 1))
                    }
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Submit
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      );                  
    };
    
    export default UserInterest;
    
