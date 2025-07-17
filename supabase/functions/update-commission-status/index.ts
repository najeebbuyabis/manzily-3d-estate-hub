import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPDATE-COMMISSION-STATUS] ${step}${detailsStr}`);
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

    // Check if user is admin (simplified check - in production, check user role)
    const { data: profile } = await supabaseClient
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Access denied: Admin privileges required");
    }

    const { commission_id, status, payment_date } = await req.json();
    
    if (!commission_id || !status) {
      throw new Error("Missing required fields: commission_id, status");
    }

    logStep("Updating commission status", { commission_id, status, payment_date });

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === "paid" && payment_date) {
      updateData.payment_date = payment_date;
    }

    const { data, error } = await supabaseClient
      .from("commission_logs")
      .update(updateData)
      .eq("id", commission_id)
      .select()
      .single();

    if (error) {
      logStep("Database error", { error: error.message });
      throw new Error(`Database error: ${error.message}`);
    }

    logStep("Commission status updated successfully", { commissionId: data.id, newStatus: status });

    return new Response(JSON.stringify({
      success: true,
      commission: data
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in update-commission-status", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});