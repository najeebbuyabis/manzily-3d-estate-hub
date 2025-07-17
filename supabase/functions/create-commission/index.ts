import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-COMMISSION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
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
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { property_id, property_sale_price, commission_rate } = await req.json();
    
    if (!property_id || !property_sale_price || !commission_rate) {
      throw new Error("Missing required fields: property_id, property_sale_price, commission_rate");
    }

    const commission_amount = (property_sale_price * commission_rate) / 100;
    
    logStep("Creating commission entry", { 
      property_id, 
      property_sale_price, 
      commission_rate, 
      commission_amount 
    });

    const { data, error } = await supabaseClient
      .from("commission_logs")
      .insert({
        property_id,
        agent_id: user.id,
        amount: commission_amount,
        commission_rate,
        property_sale_price,
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      logStep("Database error", { error: error.message });
      throw new Error(`Database error: ${error.message}`);
    }

    logStep("Commission created successfully", { commissionId: data.id });

    return new Response(JSON.stringify({
      success: true,
      commission: data
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-commission", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});