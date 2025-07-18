import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check for existing subscription in subscribers table (includes free plans)
    const { data: subscriberData } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subscriberData) {
      logStep("Found subscriber record", { 
        subscribed: subscriberData.subscribed,
        tier: subscriberData.subscription_tier 
      });

      // If it's a free plan, return immediately
      if (subscriberData.subscription_tier === "free") {
        return new Response(JSON.stringify({
          subscribed: true,
          subscription_tier: "free",
          subscription_end: null,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // For paid plans, verify with Stripe
      if (subscriberData.stripe_customer_id && subscriberData.subscribed) {
        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
          apiVersion: "2023-10-16",
        });

        try {
          const customers = await stripe.customers.list({ 
            email: user.email, 
            limit: 1 
          });
          
          if (customers.data.length > 0) {
            const subscriptions = await stripe.subscriptions.list({
              customer: customers.data[0].id,
              status: "active",
              limit: 1,
            });

            const hasActiveSub = subscriptions.data.length > 0;
            let subscriptionTier = subscriberData.subscription_tier;
            let subscriptionEnd = subscriberData.subscription_end;

            if (hasActiveSub) {
              const subscription = subscriptions.data[0];
              subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
              
              // Update subscription data
              await supabaseClient
                .from("subscribers")
                .update({
                  subscribed: true,
                  subscription_end: subscriptionEnd,
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", user.id);

              return new Response(JSON.stringify({
                subscribed: true,
                subscription_tier: subscriptionTier,
                subscription_end: subscriptionEnd,
              }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              });
            } else {
              // No active subscription, update database
              await supabaseClient
                .from("subscribers")
                .update({
                  subscribed: false,
                  subscription_tier: "free",
                  subscription_end: null,
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", user.id);
            }
          }
        } catch (stripeError) {
          logStep("Stripe verification failed", { error: stripeError });
          // If Stripe fails, default to free plan
          await supabaseClient
            .from("subscribers")
            .update({
              subscribed: true,
              subscription_tier: "free",
              subscription_end: null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);

          return new Response(JSON.stringify({
            subscribed: true,
            subscription_tier: "free",
            subscription_end: null,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
    }

    // No subscription found, create free plan by default
    await supabaseClient
      .from("subscribers")
      .upsert({
        user_id: user.id,
        email: user.email,
        subscribed: true,
        subscription_tier: "free",
        stripe_customer_id: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'email'
      });

    logStep("Created default free subscription");
    return new Response(JSON.stringify({
      subscribed: true,
      subscription_tier: "free", 
      subscription_end: null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});