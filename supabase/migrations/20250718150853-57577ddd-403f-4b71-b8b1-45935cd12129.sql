-- Create listing fee settings table
CREATE TABLE public.listing_fee_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fee_amount NUMERIC NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'KWD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create listing payments table to track property listing payments
CREATE TABLE public.listing_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KWD',
  stripe_session_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.listing_fee_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for listing_fee_settings (only admins can manage)
CREATE POLICY "Admins can manage listing fee settings" 
ON public.listing_fee_settings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Everyone can view listing fee settings" 
ON public.listing_fee_settings 
FOR SELECT 
USING (true);

-- RLS policies for listing_payments
CREATE POLICY "Agents can view their own listing payments" 
ON public.listing_payments 
FOR SELECT 
USING (auth.uid() = agent_id);

CREATE POLICY "Agents can create their own listing payments" 
ON public.listing_payments 
FOR INSERT 
WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "System can update listing payments" 
ON public.listing_payments 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can view all listing payments" 
ON public.listing_payments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_listing_fee_settings_updated_at
BEFORE UPDATE ON public.listing_fee_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listing_payments_updated_at
BEFORE UPDATE ON public.listing_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default listing fee setting
INSERT INTO public.listing_fee_settings (fee_amount, currency, is_active) 
VALUES (5.00, 'KWD', true);