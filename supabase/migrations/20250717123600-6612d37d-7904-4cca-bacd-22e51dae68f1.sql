-- Add moderation fields to properties table
ALTER TABLE public.properties 
ADD COLUMN moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'needs_review')),
ADD COLUMN moderation_notes TEXT,
ADD COLUMN moderated_by UUID REFERENCES auth.users(id),
ADD COLUMN moderated_at TIMESTAMP WITH TIME ZONE;

-- Create property moderation messages table
CREATE TABLE public.property_moderation_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('info_request', 'rejection_reason', 'approval_note')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on moderation messages
ALTER TABLE public.property_moderation_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for moderation messages
CREATE POLICY "Admins can view all moderation messages" 
ON public.property_moderation_messages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Agents can view their own moderation messages" 
ON public.property_moderation_messages 
FOR SELECT 
USING (auth.uid() = agent_id);

CREATE POLICY "Admins can create moderation messages" 
ON public.property_moderation_messages 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Update properties policies to allow admin access
CREATE POLICY "Admins can view all properties" 
ON public.properties 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can update all properties" 
ON public.properties 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create function to check for duplicate civil numbers
CREATE OR REPLACE FUNCTION public.check_duplicate_civil_number(
  civil_num TEXT,
  property_id UUID DEFAULT NULL
)
RETURNS TABLE (
  duplicate_count BIGINT,
  existing_properties JSON
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as duplicate_count,
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', p.id,
          'title', 'Property in ' || p.location,
          'location', p.location,
          'price', p.price,
          'agent_id', p.agent_id,
          'status', p.status
        )
      ) FILTER (WHERE p.id IS NOT NULL),
      '[]'::JSON
    ) as existing_properties
  FROM public.properties p
  WHERE p.civil_number = civil_num
    AND (property_id IS NULL OR p.id != property_id)
    AND p.civil_number IS NOT NULL 
    AND p.civil_number != '';
END;
$$;