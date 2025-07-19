-- Create transactions table to track all purchases
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'regular_ads', 'premium_ads', 'agent_package', 'developer_bundle'
  amount NUMERIC NOT NULL,
  credit_count INTEGER,
  expires_on TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  tap_payment_id TEXT,
  currency TEXT DEFAULT 'KWD',
  package_details JSONB, -- Store package-specific details
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update transactions" 
ON public.transactions 
FOR UPDATE 
USING (true);

-- Create trigger for updating timestamps
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create credit_packages table for the 4-tier system
CREATE TABLE public.credit_packages (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  type TEXT NOT NULL, -- 'regular_ads', 'premium_ads', 'agent_package', 'developer_bundle'
  price NUMERIC NOT NULL,
  credit_count INTEGER,
  currency TEXT DEFAULT 'KWD',
  duration_days INTEGER, -- NULL for non-expiring credits
  features_en TEXT[],
  features_ar TEXT[],
  description_en TEXT,
  description_ar TEXT,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for credit_packages
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing active packages
CREATE POLICY "Everyone can view active credit packages" 
ON public.credit_packages 
FOR SELECT 
USING (is_active = true);

-- Add trigger for timestamps
CREATE TRIGGER update_credit_packages_updated_at
BEFORE UPDATE ON public.credit_packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the 4-tier credit packages as specified
INSERT INTO public.credit_packages (id, name_en, name_ar, type, price, credit_count, duration_days, features_en, features_ar, description_en, description_ar, is_popular, sort_order) VALUES
-- Regular Ads Tier
('regular_3_ads', 'Regular Ads - 3 Ads', 'إعلانات عادية - 3 إعلانات', 'regular_ads', 10.00, 3, NULL, 
 ARRAY['30-day ad duration', 'Free image gallery (up to 10 photos)', 'Credits never expire'], 
 ARRAY['مدة الإعلان 30 يوماً', 'معرض صور مجاني (حتى 10 صور)', 'النقاط لا تنتهي صلاحيتها'], 
 '3 Regular ads for 30 days each', '3 إعلانات عادية لمدة 30 يوماً لكل إعلان', 
 false, 1),

('regular_6_ads', 'Regular Ads - 6 Ads', 'إعلانات عادية - 6 إعلانات', 'regular_ads', 18.00, 6, NULL, 
 ARRAY['30-day ad duration', 'Free image gallery (up to 10 photos)', 'Credits never expire', 'Best value - KD 3/Ad'], 
 ARRAY['مدة الإعلان 30 يوماً', 'معرض صور مجاني (حتى 10 صور)', 'النقاط لا تنتهي صلاحيتها', 'أفضل قيمة - 3 د.ك/إعلان'], 
 '6 Regular ads - cheaper than Bo Shamlān', '6 إعلانات عادية - أرخص من البوشملان', 
 true, 2),

-- Premium Ads Tier  
('premium_1_ad', 'Premium Ad - 1 Ad', 'إعلان مميز - إعلان واحد', 'premium_ads', 10.00, 1, NULL, 
 ARRAY['Sticks on top for 7 days', 'Red highlight & Premium badge', 'AI title optimization'], 
 ARRAY['يظهر في المقدمة لمدة 7 أيام', 'تمييز أحمر وشارة مميز', 'تحسين العنوان بالذكاء الاصطناعي'], 
 'Featured placement with premium styling', 'موضع مميز مع تصميم راقي', 
 false, 3),

('premium_5_ads', 'Premium Ads - 5 Ads', 'إعلانات مميزة - 5 إعلانات', 'premium_ads', 45.00, 5, NULL, 
 ARRAY['Sticks on top for 7 days each', 'Red highlight & Premium badge', 'AI title optimization', '10% discount'], 
 ARRAY['يظهر في المقدمة لمدة 7 أيام لكل إعلان', 'تمييز أحمر وشارة مميز', 'تحسين العنوان بالذكاء الاصطناعي', 'خصم 10%'], 
 '5 Premium ads with 10% discount', '5 إعلانات مميزة مع خصم 10%', 
 false, 4),

-- Agent Packages Tier
('agent_30_ads', 'Agent Package - 30 Ads', 'حزمة الوكلاء - 30 إعلان', 'agent_package', 89.00, 30, 60, 
 ARRAY['30 ads for 2 months', 'Verified agent badge', 'Personal landing page', 'Auto-profile photo + WhatsApp', 'KD 2.96/ad vs 3.33'], 
 ARRAY['30 إعلان لمدة شهرين', 'شارة وكيل معتمد', 'صفحة شخصية', 'صورة تلقائية + واتساب', '2.96 د.ك/إعلان مقابل 3.33'], 
 'Perfect for growing agents', 'مثالي للوكلاء النامين', 
 true, 5),

('agent_90_ads', 'Agent Package - 90 Ads', 'حزمة الوكلاء - 90 إعلان', 'agent_package', 239.00, 90, 180, 
 ARRAY['90 ads for 6 months', 'Verified agent badge', 'Personal landing page', 'Auto-profile photo + WhatsApp', 'Bonus: 5% extra ads during promo', 'KD 2.65/ad'], 
 ARRAY['90 إعلان لمدة 6 أشهر', 'شارة وكيل معتمد', 'صفحة شخصية', 'صورة تلقائية + واتساب', 'مكافأة: 5% إعلانات إضافية', '2.65 د.ك/إعلان'], 
 'Best value for professional agents', 'أفضل قيمة للوكلاء المحترفين', 
 false, 6),

-- Developer Bundle Tier
('developer_bundle', 'Developer Bundle', 'حزمة المطورين', 'developer_bundle', 499.00, 50, 365, 
 ARRAY['50 premium listings/year', '3D project showcases', 'Advanced analytics', 'Priority support', 'Custom branding'], 
 ARRAY['50 إعلان مميز/السنة', 'عرض مشاريع ثلاثي الأبعاد', 'تحليلات متقدمة', 'دعم مميز', 'علامة تجارية مخصصة'], 
 'Complete solution for property developers', 'حل شامل لمطوري العقارات', 
 false, 7);