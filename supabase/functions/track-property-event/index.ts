import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { propertyId, eventType, eventData } = await req.json();
    
    // Validate event type
    const validEventTypes = [
      'property_view',
      'contact_agent_click', 
      'saved_property',
      'visit_request',
      'whatsapp_launch',
      'deal_completion'
    ];

    if (!validEventTypes.includes(eventType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid event type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from auth header if available
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      userId = user?.id || null;
    }

    // Get client info
    const userAgent = req.headers.get('User-Agent') || '';
    const forwardedFor = req.headers.get('X-Forwarded-For');
    const realIp = req.headers.get('X-Real-IP');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || '';

    // Insert event
    const { error } = await supabase
      .from('property_events')
      .insert({
        user_id: userId,
        property_id: propertyId,
        event_type: eventType,
        event_data: eventData || {},
        user_agent: userAgent,
        ip_address: ipAddress || null
      });

    if (error) {
      console.error('Error inserting event:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to track event' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Tracked event: ${eventType} for property ${propertyId} by user ${userId || 'anonymous'}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in track-property-event function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});