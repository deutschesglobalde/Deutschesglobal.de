-- Create function to update account balance
CREATE OR REPLACE FUNCTION update_account_balance(account_id UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.bank_accounts 
  SET balance = balance + amount,
      updated_at = NOW()
  WHERE id = account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_account_balance(UUID, DECIMAL) TO authenticated;
