import React, { useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, Typography } from '@mui/material';
import Axios from './Axios';

const interestsList = [
    'stock', 'market', 'investment', 'finance', 'economy', 
    'health', 'money', 'insurance', 'taxes', 'credit'
];

const UserInterest = () => {
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [step, setStep] = useState<number>(0);

    const handleCheckboxChange = (interest: string) => {
        setSelectedInterests((prev) =>
            prev.includes(interest) 
            ? prev.filter((i) => i !== interest) 
            : [...prev, interest]
        );
    };

    const handleSubmit = () => {
        Axios.post(`data/interests/`, { interests: selectedInterests })
            .then(() => {
                alert('Interests saved successfully!');
            })
            .catch((error) => {
                console.error('Error saving interests', error);
            });
    };

    return (
        <Box>
            {step < interestsList.length ? (
                <Box>
                    <Typography variant="h6">
                        Select your interest: {interestsList[step]}
                    </Typography>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={selectedInterests.includes(interestsList[step])}
                                onChange={() => handleCheckboxChange(interestsList[step])}
                            />
                        }
                        label={interestsList[step]}
                    />
                    <Button onClick={() => setStep(step + 1)}>Next</Button>
                </Box>
            ) : (
                <Box>
                    <Typography variant="h6">Review Your Interests</Typography>
                    <ul>
                        {selectedInterests.map((interest, idx) => (
                            <li key={idx}>{interest}</li>
                        ))}
                    </ul>
                    <Button onClick={handleSubmit}>Submit</Button>
                </Box>
            )}
        </Box>
    );
};

export default UserInterest;
