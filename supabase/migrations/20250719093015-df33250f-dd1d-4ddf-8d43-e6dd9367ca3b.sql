-- Create enhanced subscription and payment system for Manzily

-- Create subscription plans table with the new plans
CREATE TABLE public.subscription_plans (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  price DECIMAL NOT NULL,
  currency TEXT DEFAULT 'KWD',
  ads_limit INTEGER,
  is_unlimited BOOLEAN DEFAULT FALSE,
  is_monthly BOOLEAN DEFAULT FALSE,
  features_en TEXT[],
  features_ar TEXT[],
  popular BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table for tracking all purchases
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT,
  amount_paid DECIMAL NOT NULL,
  currency TEXT DEFAULT 'KWD',
  payment_method TEXT,
  payment_provider TEXT DEFAULT 'tap',
  payment_status TEXT DEFAULT 'pending',
  transaction_id TEXT,
  ads_purchased INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user credits table for tracking ad credits
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INTEGER DEFAULT 0,
  total_credits INTEGER DEFAULT 0,
  last_free_ad_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create add-ons table
CREATE TABLE public.subscription_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  addon_type TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  price DECIMAL NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_addons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view active subscription plans" ON public.subscription_plans
  FOR SELECT USING (active = true);

CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" ON public.user_credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own credits" ON public.user_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own addons" ON public.subscription_addons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own addons" ON public.subscription_addons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert the new subscription plans
INSERT INTO public.subscription_plans (id, name_en, name_ar, description_en, description_ar, price, ads_limit, features_en, features_ar, popular) VALUES
('starter', 'Starter', 'مبتدئ', '3 ads for KD 5', '3 إعلانات مقابل 5 د.ك', 5.00, 3, 
 ARRAY['3 property listings', 'Basic support', 'Mobile access', 'Email notifications'], 
 ARRAY['3 قوائم عقارية', 'دعم أساسي', 'وصول عبر الجوال', 'إشعارات البريد الإلكتروني'], 
 false),

('growth', 'Growth', 'نمو', '7 ads for KD 10', '7 إعلانات مقابل 10 د.ك', 10.00, 7, 
 ARRAY['7 property listings', 'Priority support', 'Mobile access', 'Email & SMS notifications', 'Analytics dashboard'], 
 ARRAY['7 قوائم عقارية', 'دعم أولوية', 'وصول عبر الجوال', 'إشعارات البريد الإلكتروني والرسائل النصية', 'لوحة التحليلات'], 
 false),

('power_agent', 'Power Agent', 'وكيل محترف', '25 ads for KD 25', '25 إعلان مقابل 25 د.ك', 25.00, 25, 
 ARRAY['25 property listings', 'Premium support', 'Mobile access', 'All notifications', 'Advanced analytics', 'Lead management', 'WhatsApp integration'], 
 ARRAY['25 قائمة عقارية', 'دعم مميز', 'وصول عبر الجوال', 'جميع الإشعارات', 'تحليلات متقدمة', 'إدارة العملاء المحتملين', 'تكامل واتساب'], 
 true),

('unlimited_pro', 'Unlimited Pro', 'غير محدود برو', 'Unlimited ads for KD 79/month', 'إعلانات غير محدودة مقابل 79 د.ك/شهر', 79.00, NULL, 
 ARRAY['Unlimited property listings', '24/7 premium support', 'Mobile access', 'All notifications', 'Advanced analytics', 'CRM integration', 'WhatsApp proxy', '3D viewer', 'Verified badge'], 
 ARRAY['قوائم عقارية غير محدودة', 'دعم مميز 24/7', 'وصول عبر الجوال', 'جميع الإشعارات', 'تحليلات متقدمة', 'تكامل CRM', 'واتساب بروكسي', 'عارض ثلاثي الأبعاد', 'شارة تحقق'], 
 false);

-- Update is_unlimited and is_monthly flags
UPDATE public.subscription_plans SET is_unlimited = true, is_monthly = true WHERE id = 'unlimited_pro';

-- Create function to automatically create user credits on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits_remaining, total_credits)
  VALUES (NEW.id, 1, 1); -- Free user gets 1 ad credit
  RETURN NEW;
END;
$$;

-- Create trigger for new user credits
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();