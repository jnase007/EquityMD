-- Create states table for market data
CREATE TABLE IF NOT EXISTS states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    median_price INTEGER,
    sales_change FLOAT,
    months_supply FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial data for all 50 states
INSERT INTO states (name, median_price, sales_change, months_supply) VALUES
('California', 750000, -2.9, 3.0),
('Texas', 350000, 5.5, 2.8),
('New York', 450000, -6.2, 3.5),
('Florida', 400000, 1.0, 3.1),
('Georgia', 350000, -10.7, 4.0),
('North Carolina', 325000, 1.0, 3.0),
('Arizona', 375000, 16.2, 2.5),
('Colorado', 500000, 0.7, 3.0),
('Massachusetts', 600000, -0.8, 3.5),
('Illinois', 300000, -0.8, 4.0),
('Alabama', 250000, 2.0, 3.5),
('Alaska', 350000, 1.0, 3.0),
('Arkansas', 200000, 3.0, 3.5),
('Connecticut', 400000, -1.0, 3.5),
('Delaware', 300000, 1.5, 3.0),
('Hawaii', 700000, -2.0, 3.0),
('Idaho', 400000, 5.0, 2.8),
('Indiana', 250000, 2.5, 3.5),
('Iowa', 200000, 1.0, 4.0),
('Kansas', 225000, 1.5, 3.5),
('Kentucky', 225000, 2.0, 3.5),
('Louisiana', 200000, 1.0, 3.5),
('Maine', 300000, 1.5, 3.0),
('Maryland', 375000, -1.0, 3.5),
('Michigan', 250000, 1.0, 4.0),
('Minnesota', 300000, 0.5, 3.5),
('Mississippi', 200000, 2.0, 3.5),
('Missouri', 250000, 0.7, 3.5),
('Montana', 350000, 4.0, 2.8),
('Nebraska', 250000, 2.0, 3.5),
('Nevada', 400000, 3.0, 2.8),
('New Hampshire', 400000, 0.5, 3.5),
('New Jersey', 400000, -2.0, 3.5),
('New Mexico', 250000, 2.5, 3.0),
('North Dakota', 250000, 1.5, 3.5),
('Ohio', 225000, 1.0, 4.0),
('Oklahoma', 200000, 2.0, 3.5),
('Oregon', 400000, 3.0, 3.5),
('Pennsylvania', 300000, -1.0, 3.5),
('Rhode Island', 400000, 1.0, 3.0),
('South Carolina', 300000, 2.5, 3.0),
('South Dakota', 250000, 1.5, 3.5),
('Tennessee', 300000, 2.0, 3.0),
('Utah', 400000, 5.0, 2.8),
('Vermont', 300000, 1.0, 3.5),
('Virginia', 350000, 0.5, 3.5),
('Washington', 450000, 1.0, 3.0),
('West Virginia', 200000, 1.5, 3.5),
('Wisconsin', 275000, 1.0, 3.5),
('Wyoming', 300000, 2.0, 3.0);

-- Create indexes for better performance
CREATE INDEX idx_states_name ON states(name);
CREATE INDEX idx_states_median_price ON states(median_price);
CREATE INDEX idx_states_sales_change ON states(sales_change); 