-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create access requests table for customers to request access
CREATE TABLE public.access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL,
  full_name VARCHAR NOT NULL,
  phone VARCHAR,
  company_name VARCHAR,
  message TEXT,
  status VARCHAR NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on access_requests
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert access requests (public form)
CREATE POLICY "Anyone can submit access requests"
ON public.access_requests
FOR INSERT
WITH CHECK (true);

-- Only admins can view/update access requests
CREATE POLICY "Admins can view all access requests"
ON public.access_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update access requests"
ON public.access_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update trigger for access_requests
CREATE TRIGGER update_access_requests_updated_at
BEFORE UPDATE ON public.access_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update RLS policies for existing tables to require authentication
-- Only authenticated users can access the system

-- Guests table - admins and customers can view, only admins can modify
DROP POLICY IF EXISTS "Allow all operations on guests" ON public.guests;

CREATE POLICY "Authenticated users can view guests"
ON public.guests
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert guests"
ON public.guests
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update guests"
ON public.guests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete guests"
ON public.guests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Rooms table
DROP POLICY IF EXISTS "Allow all operations on rooms" ON public.rooms;

CREATE POLICY "Authenticated users can view rooms"
ON public.rooms
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert rooms"
ON public.rooms
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update rooms"
ON public.rooms
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete rooms"
ON public.rooms
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Reservations table
DROP POLICY IF EXISTS "Allow all operations on reservations" ON public.reservations;

CREATE POLICY "Authenticated users can view reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert reservations"
ON public.reservations
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reservations"
ON public.reservations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reservations"
ON public.reservations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Payments table
DROP POLICY IF EXISTS "Allow all operations on payments" ON public.payments;

CREATE POLICY "Authenticated users can view payments"
ON public.payments
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update payments"
ON public.payments
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete payments"
ON public.payments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Housekeeping tasks table
DROP POLICY IF EXISTS "Allow all operations on housekeeping_tasks" ON public.housekeeping_tasks;

CREATE POLICY "Authenticated users can view housekeeping tasks"
ON public.housekeeping_tasks
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert housekeeping tasks"
ON public.housekeeping_tasks
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update housekeeping tasks"
ON public.housekeeping_tasks
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete housekeeping tasks"
ON public.housekeeping_tasks
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Cash transactions table
DROP POLICY IF EXISTS "Allow all operations on cash_transactions" ON public.cash_transactions;

CREATE POLICY "Authenticated users can view cash transactions"
ON public.cash_transactions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert cash transactions"
ON public.cash_transactions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update cash transactions"
ON public.cash_transactions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete cash transactions"
ON public.cash_transactions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));