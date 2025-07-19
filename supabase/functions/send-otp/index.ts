import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendOtpRequest {
  mobile: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mobile }: SendOtpRequest = await req.json();

    if (!mobile) {
      throw new Error('Mobile number is required');
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in Supabase with expiration (5 minutes)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Store or update OTP
    const { error: otpError } = await supabase
      .from('mobile_otps')
      .upsert({
        mobile: mobile,
        otp: otp,
        expires_at: expiresAt.toISOString(),
        verified: false
      }, {
        onConflict: 'mobile'
      });

    if (otpError) {
      throw otpError;
    }

    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    // For now, we'll just log the OTP (in production, send SMS)
    console.log(`OTP for ${mobile}: ${otp}`);

    // In development, you might want to return the OTP for testing
    // Remove this in production!
    const isDevelopment = Deno.env.get('ENVIRONMENT') === 'development';

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully',
        ...(isDevelopment && { otp }) // Only include OTP in development
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error in send-otp function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);