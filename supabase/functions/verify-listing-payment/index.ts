import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-LISTING-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Create service client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");

    logStep("Session ID received", { sessionId });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Session retrieved", { 
      status: session.payment_status, 
      metadata: session.metadata 
    });

    if (session.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }

    const propertyData = JSON.parse(session.metadata?.propertyData || '{}');
    const userId = session.metadata?.userId;

    if (!userId || !propertyData) {
      throw new Error("Invalid session metadata");
    }

    // Update payment status
    const { error: paymentUpdateError } = await supabaseService
      .from("listing_payments")
      .update({ 
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq("stripe_session_id", sessionId);

    if (paymentUpdateError) {
      logStep("Error updating payment status", { error: paymentUpdateError });
    }

    // Create the property listing
    const { data: property, error: propertyError } = await supabaseService
      .from('properties')
      .insert({
        agent_id: userId,
        property_type: propertyData.propertyType,
        listing_type: propertyData.listingType?.toLowerCase(),
        location: propertyData.location,
        price: parseFloat(propertyData.price || '0'),
        size: parseFloat(propertyData.size || '0'),
        size_unit: propertyData.sizeUnit || 'm²',
        bedrooms: parseInt(propertyData.bedrooms || '0'),
        bathrooms: parseInt(propertyData.bathrooms || '0'),
        features: propertyData.features || [],
        images: propertyData.images || [],
        tour_link: propertyData.tourLink,
        contact_info: propertyData.contactInfo,
        whatsapp_number: propertyData.whatsappNumber,
        civil_number: propertyData.civilNumber,
        status: propertyData.status || 'published'
      })
      .select()
      .single();

    if (propertyError) {
      logStep("Error creating property", { error: propertyError });
      throw propertyError;
    }

    // Update payment record with property ID
    await supabaseService
      .from("listing_payments")
      .update({ property_id: property.id })
      .eq("stripe_session_id", sessionId);

    logStep("Property created successfully", { propertyId: property.id });

    return new Response(JSON.stringify({ 
      success: true, 
      property: property 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-listing-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});