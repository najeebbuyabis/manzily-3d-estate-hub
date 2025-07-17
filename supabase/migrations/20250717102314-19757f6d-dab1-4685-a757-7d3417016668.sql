-- Drop the existing view
DROP VIEW IF EXISTS public.property_event_stats;

-- Recreate the view without SECURITY DEFINER
CREATE VIEW public.property_event_stats AS
SELECT 
  property_id,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  DATE_TRUNC('day', created_at) as event_date
FROM public.property_events
GROUP BY property_id, event_type, DATE_TRUNC('day', created_at);

-- Set proper security settings for functions
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';