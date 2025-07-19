import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Check, Star, Crown, Building2, Zap, Shield, Eye, MessageSquare, Award, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface Plan {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  ads_limit: number | null;
  is_unlimited: boolean;
  is_monthly: boolean;
  features_en: string[];
  features_ar: string[];
  popular: boolean;
}

interface AddOn {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  icon: React.ComponentType<any>;
  monthly: boolean;
}

export const ManzillyPricingSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const addOns: AddOn[] = [
    {
      id: "whatsapp_proxy",
      name_en: "WhatsApp Proxy Lead Tracking",
      name_ar: "تتبع العملاء المحتملين عبر واتساب",
      description_en: "Track and manage leads through WhatsApp integration",
      description_ar: "تتبع وإدارة العملاء المحتملين من خلال تكامل واتساب",
      price: 5,
      icon: MessageSquare,
      monthly: true
    },
    {
      id: "3d_upload",
      name_en: "3D Upload for Listings",
      name_ar: "رفع ثلاثي الأبعاد للإعلانات",
      description_en: "Add immersive 3D tours to your property listings",
      description_ar: "إضافة جولات ثلاثية الأبعاد غامرة لقوائم العقارات",
      price: 10,
      icon: Eye,
      monthly: false
    },
    {
      id: "verified_badge",
      name_en: "Verified Agent Badge",
      name_ar: "شارة وكيل معتمد",
      description_en: "Display a verified badge on your profile and listings",
      description_ar: "عرض شارة معتمدة على ملفك الشخصي وإعلاناتك",
      price: 3,
      icon: Award,
      monthly: true
    }
  ];

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlanPurchase = async (planId: string) => {
    if (!user) {
      toast({
        title: isArabic ? "مطلوب تسجيل الدخول" : "Authentication Required",
        description: isArabic ? "يرجى تسجيل الدخول للاشتراك في خطة" : "Please sign in to subscribe to a plan",
        variant: "destructive"
      });
      return;
    }

    // TODO: Implement Tap Payments integration
    toast({
      title: isArabic ? "قريباً" : "Coming Soon",
      description: isArabic ? "سيتم دمج Tap Payments قريباً" : "Tap Payments integration coming soon"
    });
  };

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const calculateBundle = () => {
    if (selectedAddOns.length >= 2) {
      const total = selectedAddOns.reduce((sum, id) => {
        const addOn = addOns.find(a => a.id === id);
        return sum + (addOn?.price || 0);
      }, 0);
      return total * 0.85; // 15% discount
    }
    return selectedAddOns.reduce((sum, id) => {
      const addOn = addOns.find(a => a.id === id);
      return sum + (addOn?.price || 0);
    }, 0);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter': return Building2;
      case 'growth': return Zap;
      case 'power_agent': return Star;
      case 'unlimited_pro': return Crown;
      default: return Building2;
    }
  };

  const getPricePerAd = (plan: Plan) => {
    if (plan.is_unlimited || !plan.ads_limit) return null;
    return (plan.price / plan.ads_limit).toFixed(2);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <section className="py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            {isArabic ? "اشترك الآن" : "Subscribe Now"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {isArabic 
              ? "اختر الخطة المناسبة لأعمالك العقارية في الكويت وتفوق على البوشملان"
              : "Choose the perfect plan for your real estate business in Kuwait and outperform Bo Shamlān"
            }
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => {
            const IconComponent = getPlanIcon(plan.id);
            const pricePerAd = getPricePerAd(plan);
            
            return (
              <Card 
                key={plan.id}
                className={`relative transition-all duration-300 hover:shadow-card-hover border-border/50 ${
                  plan.popular ? 'ring-2 ring-secondary ring-offset-2 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-secondary text-secondary-foreground">
                    {isArabic ? "الأكثر شعبية" : "Most Popular"}
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">
                    {isArabic ? plan.name_ar : plan.name_en}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-primary">KD {plan.price}</span>
                    {plan.is_monthly && (
                      <span className="text-muted-foreground">
                        {isArabic ? "/شهر" : "/month"}
                      </span>
                    )}
                  </div>
                  {pricePerAd && (
                    <p className="text-sm text-secondary font-medium">
                      KD {pricePerAd} {isArabic ? "لكل إعلان" : "per ad"}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    {isArabic ? plan.description_ar : plan.description_en}
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {(isArabic ? plan.features_ar : plan.features_en).map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handlePlanPurchase(plan.id)}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' 
                        : 'bg-gradient-primary text-primary-foreground hover:opacity-90'
                    }`}
                    size="lg"
                  >
                    {isArabic ? "اشتري الآن" : "Buy Now"}
                  </Button>

                  {/* Payment Method Icons */}
                  <div className="flex justify-center gap-2 pt-2">
                    <div className="bg-muted rounded px-2 py-1 text-xs">KNET</div>
                    <div className="bg-muted rounded px-2 py-1 text-xs">Visa</div>
                    <div className="bg-muted rounded px-2 py-1 text-xs">MC</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add-ons Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            {isArabic ? "الإضافات والميزات" : "Add-ons & Features"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {addOns.map((addOn) => {
              const IconComponent = addOn.icon;
              const isSelected = selectedAddOns.includes(addOn.id);
              
              return (
                <Card 
                  key={addOn.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-primary border-primary' : 'hover:shadow-card-hover'
                  }`}
                  onClick={() => toggleAddOn(addOn.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">
                          {isArabic ? addOn.name_ar : addOn.name_en}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {isArabic ? addOn.description_ar : addOn.description_en}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">
                            KD {addOn.price}{addOn.monthly ? (isArabic ? "/شهر" : "/month") : (isArabic ? "/إعلان" : "/listing")}
                          </span>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bundle & Save */}
          {selectedAddOns.length >= 2 && (
            <Card className="bg-gradient-to-r from-secondary/20 to-secondary/10 border-secondary/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-secondary" />
                    <div>
                      <h4 className="font-semibold text-secondary">
                        {isArabic ? "احزم ووفر 15%" : "Bundle & Save 15%"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isArabic 
                          ? `تطبق على ${selectedAddOns.length} إضافات محددة`
                          : `Applied to ${selectedAddOns.length} selected add-ons`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground line-through">
                      KD {selectedAddOns.reduce((sum, id) => {
                        const addOn = addOns.find(a => a.id === id);
                        return sum + (addOn?.price || 0);
                      }, 0).toFixed(2)}
                    </div>
                    <div className="text-lg font-bold text-secondary">
                      KD {calculateBundle().toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Competitive Advantage */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            {isArabic ? "لماذا منزلي أفضل من البوشملان" : "Why Manzily is better than Bo Shamlān"}
          </h3>
          
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 font-semibold">
                        {isArabic ? "الميزات" : "Features"}
                      </th>
                      <th className="text-center py-3 font-semibold text-primary">
                        {isArabic ? "منزلي" : "Manzily"}
                      </th>
                      <th className="text-center py-3 font-semibold text-muted-foreground">
                        {isArabic ? "البوشملان" : "Bo Shamlān"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { 
                        feature_en: "3D Viewer", 
                        feature_ar: "عارض ثلاثي الأبعاد",
                        manzily: true, 
                        boshamlan: false 
                      },
                      { 
                        feature_en: "WhatsApp Lead Proxy", 
                        feature_ar: "واتساب بروكسي للعملاء",
                        manzily: true, 
                        boshamlan: false 
                      },
                      { 
                        feature_en: "Civil Number Verification", 
                        feature_ar: "التحقق من الرقم المدني",
                        manzily: true, 
                        boshamlan: false 
                      },
                      { 
                        feature_en: "Arabic UI", 
                        feature_ar: "واجهة باللغة العربية",
                        manzily: true, 
                        boshamlan: true 
                      },
                      { 
                        feature_en: "Free Plan", 
                        feature_ar: "خطة مجانية",
                        manzily: true, 
                        boshamlan: false 
                      }
                    ].map((row, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-4">
                          {isArabic ? row.feature_ar : row.feature_en}
                        </td>
                        <td className="text-center py-4">
                          {row.manzily ? (
                            <Check className="h-5 w-5 text-primary mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-4">
                          {row.boshamlan ? (
                            <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-destructive mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Freemium Notice */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <h4 className="font-semibold mb-2">
              {isArabic ? "ابدأ مجاناً" : "Start Free"}
            </h4>
            <p className="text-muted-foreground">
              {isArabic 
                ? "احصل على إعلان واحد مجاناً كل شهر. لا حاجة لبطاقة ائتمان."
                : "Get 1 free ad every month. No credit card required."
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};