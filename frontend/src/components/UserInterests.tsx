import React, { useState } from 'react';
import { Box, Button, Typography, Card, CardContent } from '@mui/material';
import Axios from './Axios';

const questions = [
    {
        question: "Let’s start with debt – which ones are on your mind?",
        options: [
            { value: 'credit', label: 'Credit Card', icon: '💳' },
            { value: 'student', label: 'Student Loans', icon: '🎓' },
            { value: 'car', label: 'Car Loans', icon: '🚗' },
            { value: 'medical', label: 'Medical Debt', icon: '🏥' },
            { value: 'none', label: 'I don’t have debt right now' },
        ],
    },
    {
        question: "Are you saving or aspiring to save for any of these? Don't be afraid to dream big!",
        options: [
            { value: 'emergency', label: 'Emergency Fund', icon: '💰' },
            { value: 'home', label: 'New Home', icon: '🏠' },
            { value: 'retirement', label: 'Retirement', icon: '🏦' },
            { value: 'holiday', label: 'Hacation', icon: '🌴' },
            { value: 'investments', label: 'Investments', icon: '📈' },
            { value: 'car', label: 'New Car', icon: '🚗' },
            { value: 'none', label: 'I don’t have a current goal right now' },
        ],
    },
    {
        question: "How do you get around?",
        options: [
            { value: 'car', label: 'Car', icon: '🚗' },
            { value: 'bike', label: 'Bike', icon: '🚲' },
            { value: 'transit', label: 'Public Transit', icon: '🚇' },
            { value: 'walk', label: 'Walk', icon: '🚶' },
            { value: 'rideshare', label: 'Rideshare', icon: '🚕' },
        ],
    },
    {
        question: "What type of investing are you interested in?",
        options: [
            { value: 'stocks', label: 'Stocks', icon: '📈' },
            { value: 'bonds', label: 'Bonds', icon: '🏦' },
            { value: 'realestate', label: 'Real Estate', icon: '🏠' },
            { value: 'crypto', label: 'Cryptocurrency', icon: '🪙' },
            { value: 'etfs', label: 'ETFs', icon: '📊' },
            { value: 'index', label: 'Index Funds', icon: '📉' },
            { value: 'none', label: 'I’m not interested in investing right now' },
        ],
    },
];


const UserInterest = () => {
    const [step, setStep] = useState(0);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

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
                alert('Your interests have been saved successfully!');
            })
            .catch((error) => {
                console.error('Error saving interests:', error);
            });
    };

    return (
        <Box>
            {step < questions.length ? (
                <Box>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        {questions[step].question}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                        {questions[step].options.map((option) => (
                            <Card
                                key={option.value}
                                onClick={() => toggleOption(option.value)}
                                sx={{
                                    width: 150,
                                    cursor: 'pointer',
                                    border:
                                        selectedInterests.includes(option.value)
                                            ? '2px solid #0077FF'
                                            : '1px solid #ccc',
                                }}
                            >
                                <CardContent
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="h4">
                                        {option.icon}
                                    </Typography>
                                    <Typography variant="body1">
                                        {option.label}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                    <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={() => setStep(step + 1)}
                    >
                        Next
                    </Button>
                </Box>
            ) : (
                <Box>
                    <Typography variant="h5">Review Your Selections:</Typography>
                    <ul>
                        {selectedInterests.map((interest, index) => (
                            <li key={index}>{interest}</li>
                        ))}
                    </ul>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default UserInterest;
