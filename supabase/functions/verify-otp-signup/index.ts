import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyOtpSignUpRequest {
  mobile: string;
  password: string;
  otp: string;
  fullName: string;
  role: string;
  companyName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mobile, password, otp, fullName, role, companyName }: VerifyOtpSignUpRequest = await req.json();

    if (!mobile || !password || !otp || !fullName || !role) {
      throw new Error('Mobile, password, OTP, full name, and role are required');
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

    // Check if user already exists with this mobile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('phone', mobile)
      .single();

    if (existingProfile) {
      throw new Error('User already exists with this mobile number');
    }

    // Create a dummy email using mobile number
    const email = `${mobile}@manzily.app`;

    // Create user account
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm since we verified via OTP
      user_metadata: {
        full_name: fullName,
        mobile: mobile,
        role: role,
        company_name: companyName,
      }
    });

    if (signUpError || !signUpData.user) {
      throw new Error('Failed to create user account');
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: signUpData.user.id,
        full_name: fullName,
        phone: mobile,
        role: role,
        company_name: companyName || null,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't throw here, user is already created
    }

    // Mark OTP as verified
    await supabase
      .from('mobile_otps')
      .update({ verified: true })
      .eq('mobile', mobile)
      .eq('otp', otp);

    // Sign in the user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (signInError) {
      throw new Error('Account created but sign-in failed');
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
    console.error('Error in verify-otp-signup function:', error);
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