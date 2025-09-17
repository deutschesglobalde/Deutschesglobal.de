-- Add currency support to existing tables
ALTER TABLE bank_accounts 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'EUR';

-- Add currency to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'EUR';

-- Update existing records to have EUR as default currency
UPDATE bank_accounts SET currency = 'EUR' WHERE currency IS NULL;
UPDATE transactions SET currency = 'EUR' WHERE currency IS NULL;

-- Create currency exchange rates table for future use
CREATE TABLE IF NOT EXISTS currency_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(10, 6) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some basic exchange rates (these would be updated regularly in production)
INSERT INTO currency_rates (from_currency, to_currency, rate) VALUES
('EUR', 'USD', 1.08),
('USD', 'EUR', 0.93),
('EUR', 'GBP', 0.86),
('GBP', 'EUR', 1.16),
('EUR', 'CHF', 0.97),
('CHF', 'EUR', 1.03),
('EUR', 'JPY', 161.50),
('JPY', 'EUR', 0.0062)
ON CONFLICT DO NOTHING;

-- Create function to convert currency amounts
CREATE OR REPLACE FUNCTION convert_currency(
  amount DECIMAL,
  from_curr VARCHAR(3),
  to_curr VARCHAR(3)
) RETURNS DECIMAL AS $$
DECLARE
  conversion_rate DECIMAL;
BEGIN
  -- If same currency, return original amount
  IF from_curr = to_curr THEN
    RETURN amount;
  END IF;
  
  -- Get conversion rate
  SELECT rate INTO conversion_rate
  FROM currency_rates
  WHERE from_currency = from_curr AND to_currency = to_curr
  ORDER BY updated_at DESC
  LIMIT 1;
  
  -- If no direct rate found, try reverse rate
  IF conversion_rate IS NULL THEN
    SELECT (1.0 / rate) INTO conversion_rate
    FROM currency_rates
    WHERE from_currency = to_curr AND to_currency = from_curr
    ORDER BY updated_at DESC
    LIMIT 1;
  END IF;
  
  -- If still no rate found, return original amount
  IF conversion_rate IS NULL THEN
    RETURN amount;
  END IF;
  
  RETURN amount * conversion_rate;
END;
$$ LANGUAGE plpgsql;
