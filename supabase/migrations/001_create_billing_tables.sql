-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,3) NOT NULL,
  price_yearly DECIMAL(10,3) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  max_listings INTEGER DEFAULT NULL,
  max_featured_listings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, unpaid
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- monthly, yearly
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT,
  amount DECIMAL(10,3) NOT NULL,
  currency TEXT DEFAULT 'KWD',
  type TEXT NOT NULL, -- subscription, featured_listing, lead_generation
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  description TEXT,
  invoice_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create commission_logs table
CREATE TABLE public.commission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,3) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, disputed
  property_sale_price DECIMAL(12,3) NOT NULL,
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_profiles table to extend auth.users
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'buyer', -- buyer, agent, agency, owner, admin
  company_name TEXT,
  license_number TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Subscription plans - readable by all authenticated users
CREATE POLICY "subscription_plans_select" ON public.subscription_plans
  FOR SELECT TO authenticated
  USING (true);

-- Subscriptions - users can only see their own
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_own" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Transactions - users can only see their own
CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_own" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Commission logs - agents can only see their own
CREATE POLICY "commission_logs_select_own" ON public.commission_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = agent_id);

-- User profiles - users can see their own and public info of others
CREATE POLICY "user_profiles_select_own" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "user_profiles_insert_own" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update_own" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, features, max_listings, max_featured_listings) VALUES
('Basic', 'Perfect for individual agents starting out', 25.000, 250.000, 
 '["Up to 10 property listings", "Basic property analytics", "Standard support", "Mobile app access"]', 
 10, 1),
('Pro', 'Ideal for established agents and small agencies', 75.000, 750.000,
 '["Up to 50 property listings", "Advanced analytics & reporting", "Priority support", "Featured listings", "Lead generation tools", "Custom branding"]',
 50, 5),
('Enterprise', 'For large agencies and property management companies', 200.000, 2000.000,
 '["Unlimited property listings", "Advanced analytics & reporting", "24/7 dedicated support", "Unlimited featured listings", "Advanced lead generation", "Custom branding", "API access", "White-label options"]',
 NULL, 999);