import React, { useState } from 'react';

interface StockFormProps {
    onSubmit: (ticker: string) => void;
}

const TickerForm: React.FC<StockFormProps> = ({ onSubmit }) => {
    const [selectedTicker, setSelectedTicker] = useState<string>('AAPL'); // Default to 'AAPL'

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTicker(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onSubmit(selectedTicker); // Pass the selected ticker to the parent component
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="ticker">Choose a FAANG ticker:</label>
            <select id="ticker" value={selectedTicker} onChange={handleChange}>
                <option value="AAPL">Apple (AAPL)</option>
                <option value="META">Meta (META)</option>
                <option value="AMZN">Amazon (AMZN)</option>
                <option value="NFLX">Netflix (NFLX)</option>
                <option value="GOOGL">Google (GOOGL)</option>
            </select>
            <button type="submit">Submit</button>
        </form>
    );
};

export default TickerForm;
