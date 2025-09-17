-- Final database setup and optimizations

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add constraint to ensure positive balances for savings accounts
ALTER TABLE bank_accounts 
ADD CONSTRAINT check_savings_balance 
CHECK (account_type != 'savings' OR balance >= 0);

-- Add constraint to ensure transaction amounts are positive
ALTER TABLE transactions 
ADD CONSTRAINT check_positive_amount 
CHECK (amount > 0);

-- Update RLS policies to be more specific
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create transactions" ON transactions;
CREATE POLICY "Users can create transactions" ON transactions
FOR INSERT WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Add policy for admin users to manage all data
CREATE POLICY "Admin full access to transactions" ON transactions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

CREATE POLICY "Admin full access to profiles" ON profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

CREATE POLICY "Admin full access to bank_accounts" ON bank_accounts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Create a view for transaction summaries
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
  t.id,
  t.user_id,
  t.amount,
  t.transaction_type,
  t.status,
  t.description,
  t.created_at,
  t.processed_at,
  t.admin_notes,
  p.email,
  p.first_name,
  p.last_name,
  ba.account_number,
  ba.account_type
FROM transactions t
JOIN profiles p ON t.user_id = p.id
LEFT JOIN bank_accounts ba ON t.from_account_id = ba.id;

-- Grant access to the view
GRANT SELECT ON transaction_summary TO authenticated;
GRANT ALL ON transaction_summary TO service_role;
