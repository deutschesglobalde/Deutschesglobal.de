-- Enable RLS and create policies for existing tables

-- Profiles table RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON profiles 
  FOR DELETE USING (auth.uid() = id);

-- Bank accounts table RLS
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bank_accounts_select_own" ON bank_accounts 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bank_accounts_insert_own" ON bank_accounts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bank_accounts_update_own" ON bank_accounts 
  FOR UPDATE USING (auth.uid() = user_id);

-- Transactions table RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select_own" ON transactions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_own" ON transactions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin users table (no RLS - handled by application logic)
-- Currency rates table (public read access)
CREATE POLICY "currency_rates_select_all" ON currency_rates 
  FOR SELECT TO authenticated USING (true);
