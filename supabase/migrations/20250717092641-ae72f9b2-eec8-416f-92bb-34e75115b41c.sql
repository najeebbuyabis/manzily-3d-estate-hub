-- Create events table for property tracking
CREATE TABLE public.property_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  property_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('property_view', 'contact_agent_click', 'saved_property', 'visit_request', 'whatsapp_launch', 'deal_completion')),
  event_data JSONB,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.property_events ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Users can view their own events" 
ON public.property_events 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create events" 
ON public.property_events 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_property_events_property_id ON public.property_events(property_id);
CREATE INDEX idx_property_events_event_type ON public.property_events(event_type);
CREATE INDEX idx_property_events_created_at ON public.property_events(created_at);
CREATE INDEX idx_property_events_user_id ON public.property_events(user_id);

-- Create a view for event analytics
CREATE VIEW public.property_event_stats AS
SELECT 
  property_id,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  DATE_TRUNC('day', created_at) as event_date
FROM public.property_events
GROUP BY property_id, event_type, DATE_TRUNC('day', created_at);