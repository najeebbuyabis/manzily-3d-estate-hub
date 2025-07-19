import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { payment_id } = requestBody;

    if (!payment_id) {
      throw new Error("Payment ID is required");
    }

    // Get Tap API secret key
    const tapSecretKey = Deno.env.get("TAP_SECRET_KEY");
    if (!tapSecretKey) {
      throw new Error("Tap API key not configured");
    }

    // Verify payment with Tap Payments API
    const tapResponse = await fetch(`https://api.tap.company/v2/charges/${payment_id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${tapSecretKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!tapResponse.ok) {
      throw new Error(`Tap Payment API error: ${tapResponse.status}`);
    }

    const paymentData = await tapResponse.json();

    // Create Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find transaction by tap_payment_id
    const { data: transaction, error: transactionError } = await supabaseService
      .from("transactions")
      .select("*")
      .eq("tap_payment_id", payment_id)
      .single();

    if (transactionError || !transaction) {
      throw new Error("Transaction not found");
    }

    if (paymentData.status === "CAPTURED") {
      // Payment successful - update transaction status
      const { error: updateError } = await supabaseService
        .from("transactions")
        .update({ status: "completed" })
        .eq("id", transaction.id);

      if (updateError) {
        console.error("Error updating transaction:", updateError);
      }

      // Add credits to user account if transaction has credit_count
      if (transaction.credit_count && transaction.credit_count > 0) {
        // Get current user credits
        const { data: userCredits, error: creditsError } = await supabaseService
          .from("user_credits")
          .select("*")
          .eq("user_id", transaction.user_id)
          .single();

        if (creditsError && creditsError.code !== 'PGRST116') {
          console.error("Error fetching user credits:", creditsError);
        }

        if (userCredits) {
          // Update existing credits
          const { error: updateCreditsError } = await supabaseService
            .from("user_credits")
            .update({
              credits_remaining: userCredits.credits_remaining + transaction.credit_count,
              total_credits: userCredits.total_credits + transaction.credit_count
            })
            .eq("user_id", transaction.user_id);

          if (updateCreditsError) {
            console.error("Error updating user credits:", updateCreditsError);
          }
        } else {
          // Create new credits record
          const { error: createCreditsError } = await supabaseService
            .from("user_credits")
            .insert({
              user_id: transaction.user_id,
              credits_remaining: transaction.credit_count,
              total_credits: transaction.credit_count
            });

          if (createCreditsError) {
            console.error("Error creating user credits:", createCreditsError);
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          payment_status: paymentData.status,
          transaction_id: transaction.id,
          credits_added: transaction.credit_count
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );

    } else if (paymentData.status === "FAILED" || paymentData.status === "DECLINED") {
      // Payment failed - update transaction status
      const { error: updateError } = await supabaseService
        .from("transactions")
        .update({ status: "failed" })
        .eq("id", transaction.id);

      if (updateError) {
        console.error("Error updating failed transaction:", updateError);
      }

      return new Response(
        JSON.stringify({
          success: false,
          payment_status: paymentData.status,
          message: "Payment was declined or failed"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );

    } else {
      // Payment still pending
      return new Response(
        JSON.stringify({
          success: false,
          payment_status: paymentData.status,
          message: "Payment is still being processed"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 202,
        }
      );
    }

  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Payment verification failed"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});