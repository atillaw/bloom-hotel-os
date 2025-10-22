-- Create access keys table for customer access management
CREATE TABLE public.access_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_key VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  company_name VARCHAR(255),
  notes TEXT,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.access_keys ENABLE ROW LEVEL SECURITY;

-- Only admins can manage access keys
CREATE POLICY "Admins can view all access keys"
  ON public.access_keys FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert access keys"
  ON public.access_keys FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update access keys"
  ON public.access_keys FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete access keys"
  ON public.access_keys FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Public can check if a key is valid (for login)
CREATE POLICY "Anyone can validate unused keys"
  ON public.access_keys FOR SELECT
  USING (is_used = false);

-- Trigger for updated_at
CREATE TRIGGER update_access_keys_updated_at
  BEFORE UPDATE ON public.access_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert admin user role (user must be created first via Supabase Auth)
-- This will be handled in the application code