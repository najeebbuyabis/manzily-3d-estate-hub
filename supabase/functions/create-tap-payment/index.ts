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
    // Create Supabase client using anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    const requestBody = await req.json();
    const { amount, currency, transaction_id, package_details } = requestBody;

    if (!amount || !currency || !transaction_id) {
      throw new Error("Missing required payment parameters");
    }

    // Get Tap API secret key
    const tapSecretKey = Deno.env.get("TAP_SECRET_KEY");
    if (!tapSecretKey) {
      throw new Error("Tap API key not configured");
    }

    // Create payment with Tap Payments
    const tapPayment = {
      amount: amount,
      currency: currency,
      threeDSecure: true,
      save_card: false,
      description: `${package_details?.name_en || 'Manzily Package'} - ${package_details?.type || 'credit_package'}`,
      statement_descriptor: "MANZILY",
      metadata: {
        udf1: transaction_id,
        udf2: user.id,
        udf3: package_details?.type || 'unknown'
      },
      reference: {
        transaction: transaction_id,
        order: `ORDER-${Date.now()}`
      },
      receipt: {
        email: true,
        sms: false
      },
      customer: {
        first_name: user.user_metadata?.full_name?.split(' ')[0] || "Customer",
        last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || "",
        email: user.email,
        phone: {
          country_code: "965",
          number: user.user_metadata?.phone || ""
        }
      },
      merchant: {
        id: "" // Will be set by Tap based on API key
      },
      source: {
        id: "src_all" // Accept all payment sources
      },
      post: {
        url: `${req.headers.get("origin")}/payment-success`
      },
      redirect: {
        url: `${req.headers.get("origin")}/payment-success`
      }
    };

    // Make request to Tap Payments API
    const tapResponse = await fetch("https://api.tap.company/v2/charges", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tapSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tapPayment),
    });

    if (!tapResponse.ok) {
      const errorText = await tapResponse.text();
      console.error("Tap API Error:", errorText);
      throw new Error(`Tap Payment API error: ${tapResponse.status}`);
    }

    const tapResult = await tapResponse.json();

    if (tapResult.status !== "INITIATED") {
      throw new Error(`Payment initiation failed: ${tapResult.status}`);
    }

    // Update transaction with Tap payment ID
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { error: updateError } = await supabaseService
      .from("transactions")
      .update({
        tap_payment_id: tapResult.id,
        status: "pending"
      })
      .eq("id", transaction_id);

    if (updateError) {
      console.error("Error updating transaction:", updateError);
      // Continue anyway as payment was created successfully
    }

    return new Response(
      JSON.stringify({
        payment_url: tapResult.transaction.url,
        payment_id: tapResult.id,
        status: tapResult.status
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Payment creation failed",
        details: "Please check your payment details and try again"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});