import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-LISTING-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Create Supabase client using anon key for auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Create service client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { propertyData } = await req.json();
    if (!propertyData) throw new Error("Property data is required");
    
    logStep("Property data received", { propertyType: propertyData.propertyType });

    // Get current listing fee
    const { data: feeSettings, error: feeError } = await supabaseService
      .from("listing_fee_settings")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (feeError || !feeSettings) {
      throw new Error("No active listing fee settings found");
    }

    logStep("Fee settings retrieved", { amount: feeSettings.fee_amount, currency: feeSettings.currency });

    // If fee is 0, skip payment and create property directly
    if (feeSettings.fee_amount === 0) {
      logStep("Fee is 0, creating property directly");
      
      const { data: property, error: propertyError } = await supabaseService
        .from('properties')
        .insert({
          agent_id: user.id,
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

      if (propertyError) throw propertyError;
      
      return new Response(JSON.stringify({ 
        success: true, 
        property: property,
        noPaymentRequired: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session for listing fee
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: feeSettings.currency.toLowerCase(),
            product_data: { 
              name: `Property Listing Fee - ${propertyData.propertyType}`,
              description: `Listing fee for ${propertyData.propertyType} in ${propertyData.location}`
            },
            unit_amount: Math.round(feeSettings.fee_amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/listing-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/listing-cancelled`,
      metadata: {
        propertyData: JSON.stringify(propertyData),
        userId: user.id,
        feeAmount: feeSettings.fee_amount.toString(),
        currency: feeSettings.currency
      }
    });

    logStep("Checkout session created", { sessionId: session.id });

    // Create pending listing payment record
    const { error: paymentError } = await supabaseService
      .from("listing_payments")
      .insert({
        agent_id: user.id,
        amount: feeSettings.fee_amount,
        currency: feeSettings.currency,
        stripe_session_id: session.id,
        payment_status: 'pending'
      });

    if (paymentError) {
      logStep("Error creating payment record", { error: paymentError });
      throw paymentError;
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-listing-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});