-- Create mobile_otps table for OTP verification
CREATE TABLE public.mobile_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on mobile to allow upsert operations
CREATE UNIQUE INDEX idx_mobile_otps_mobile ON public.mobile_otps(mobile);

-- Enable RLS
ALTER TABLE public.mobile_otps ENABLE ROW LEVEL SECURITY;

-- Create policies for mobile_otps
CREATE POLICY "System can manage all OTPs" 
ON public.mobile_otps 
FOR ALL 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_mobile_otps_updated_at
BEFORE UPDATE ON public.mobile_otps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();