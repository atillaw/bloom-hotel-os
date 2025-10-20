-- Create cash_transactions table for billing
CREATE TABLE IF NOT EXISTS public.cash_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL,
  category VARCHAR NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for cash_transactions
CREATE POLICY "Allow all operations on cash_transactions" 
ON public.cash_transactions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_cash_transactions_updated_at
BEFORE UPDATE ON public.cash_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();