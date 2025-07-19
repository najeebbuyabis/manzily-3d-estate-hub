import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyOtpSignInRequest {
  mobile: string;
  password: string;
  otp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mobile, password, otp }: VerifyOtpSignInRequest = await req.json();

    if (!mobile || !password || !otp) {
      throw new Error('Mobile, password, and OTP are required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify OTP
    const { data: otpData, error: otpError } = await supabase
      .from('mobile_otps')
      .select('*')
      .eq('mobile', mobile)
      .eq('otp', otp)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpData) {
      throw new Error('Invalid or expired OTP');
    }

    // Find user by mobile number
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('phone', mobile)
      .single();

    if (profileError || !profileData) {
      throw new Error('User not found with this mobile number');
    }

    // Sign in with email and password (we need to get email first)
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profileData.user_id);
    
    if (authError || !authUser.user) {
      throw new Error('User authentication failed');
    }

    // Create a session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: authUser.user.email!,
    });

    if (sessionError) {
      throw new Error('Failed to create session');
    }

    // Mark OTP as verified
    await supabase
      .from('mobile_otps')
      .update({ verified: true })
      .eq('mobile', mobile)
      .eq('otp', otp);

    // Sign in the user programmatically
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: authUser.user.email!,
      password: password,
    });

    if (signInError) {
      throw new Error('Invalid password');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        session: signInData.session,
        user: signInData.user
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error in verify-otp-signin function:', error);
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