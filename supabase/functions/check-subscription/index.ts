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

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check for existing subscription in Supabase
    const { data: existingSubscription } = await supabaseClient
      .from("subscriptions")
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (existingSubscription && existingSubscription.stripe_subscription_id) {
      // Verify with Stripe
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          existingSubscription.stripe_subscription_id
        );

        const isActive = stripeSubscription.status === 'active';
        
        if (!isActive) {
          // Update subscription status in database
          await supabaseClient
            .from("subscriptions")
            .update({ 
              status: stripeSubscription.status,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingSubscription.id);
        }

        logStep("Subscription verified", { 
          subscriptionId: existingSubscription.id,
          status: stripeSubscription.status,
          planName: existingSubscription.subscription_plans?.name 
        });

        return new Response(JSON.stringify({
          subscribed: isActive,
          subscription: isActive ? {
            id: existingSubscription.id,
            plan: existingSubscription.subscription_plans,
            billing_cycle: existingSubscription.billing_cycle,
            current_period_end: existingSubscription.current_period_end,
            cancel_at_period_end: existingSubscription.cancel_at_period_end,
            status: stripeSubscription.status,
          } : null,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (stripeError) {
        logStep("Stripe verification failed", { error: stripeError });
        // If Stripe subscription doesn't exist, mark as inactive
        await supabaseClient
          .from("subscriptions")
          .update({ 
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSubscription.id);
      }
    }

    logStep("No active subscription found");
    return new Response(JSON.stringify({
      subscribed: false,
      subscription: null,
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