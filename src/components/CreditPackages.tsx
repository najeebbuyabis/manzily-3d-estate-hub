import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Building2, Zap, Shield, Award, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserCredits } from "@/hooks/useUserCredits";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface CreditPackage {
  id: string;
  name_en: string;
  name_ar: string;
  type: string;
  price: number;
  credit_count: number | null;
  currency: string;
  duration_days: number | null;
  features_en: string[];
  features_ar: string[];
  description_en: string;
  description_ar: string;
  is_popular: boolean;
}

export const CreditPackages: React.FC = () => {
  const { user } = useAuth();
  const { userCredits, fetchUserCredits } = useUserCredits();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "فشل في تحميل الحزم" : "Failed to load packages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageData: CreditPackage) => {
    if (!user) {
      toast({
        title: isArabic ? "مطلوب تسجيل الدخول" : "Authentication Required",
        description: isArabic ? "يرجى تسجيل الدخول لشراء الحزمة" : "Please sign in to purchase package",
        variant: "destructive"
      });
      return;
    }

    setPurchaseLoading(packageData.id);

    try {
      // Create transaction record first
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: packageData.type,
          amount: packageData.price,
          credit_count: packageData.credit_count,
          expires_on: packageData.duration_days ? 
            new Date(Date.now() + packageData.duration_days * 24 * 60 * 60 * 1000).toISOString() : 
            null,
          currency: packageData.currency,
          package_details: {
            package_id: packageData.id,
            name_en: packageData.name_en,
            name_ar: packageData.name_ar,
            features_en: packageData.features_en,
            features_ar: packageData.features_ar
          }
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Call Tap payment function
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-tap-payment', {
        body: {
          amount: packageData.price,
          currency: packageData.currency,
          transaction_id: transaction.id,
          package_details: {
            name_en: packageData.name_en,
            name_ar: packageData.name_ar,
            type: packageData.type
          }
        }
      });

      if (paymentError) throw paymentError;

      if (paymentData?.payment_url) {
        // Redirect to Tap payment page
        window.location.href = paymentData.payment_url;
      } else {
        throw new Error('Payment URL not received');
      }

    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: isArabic ? "فشل في الدفع" : "Payment Failed",
        description: isArabic ? "حدث خطأ أثناء معالجة الدفع" : "An error occurred while processing payment",
        variant: "destructive"
      });
    } finally {
      setPurchaseLoading(null);
    }
  };

  const getPackageIcon = (type: string) => {
    switch (type) {
      case 'regular_ads': return Package;
      case 'premium_ads': return Star;
      case 'agent_package': return Shield;
      case 'developer_bundle': return Crown;
      default: return Building2;
    }
  };

  const getTierTitle = (type: string) => {
    switch (type) {
      case 'regular_ads': 
        return { en: '🌱 Regular Ads', ar: '🌱 إعلانات عادية' };
      case 'premium_ads': 
        return { en: '🎯 Premium Ads', ar: '🎯 إعلانات مميزة' };
      case 'agent_package': 
        return { en: '🏢 Agent Packages', ar: '🏢 حزم الوكلاء' };
      case 'developer_bundle': 
        return { en: '💼 Developer Bundle', ar: '💼 حزمة المطورين' };
      default: 
        return { en: 'Package', ar: 'حزمة' };
    }
  };

  const getButtonText = (type: string) => {
    switch (type) {
      case 'regular_ads': 
        return { en: 'Buy Now', ar: 'اشترِ الآن' };
      case 'premium_ads': 
        return { en: 'Upgrade to Premium', ar: 'ارفع مستوى إعلانك' };
      case 'agent_package': 
        return { en: 'Subscribe', ar: 'اشترك' };
      case 'developer_bundle': 
        return { en: 'Get Bundle', ar: 'احصل على الحزمة' };
      default: 
        return { en: 'Buy Now', ar: 'اشترِ الآن' };
    }
  };

  const groupedPackages = packages.reduce((acc, pkg) => {
    if (!acc[pkg.type]) acc[pkg.type] = [];
    acc[pkg.type].push(pkg);
    return acc;
  }, {} as Record<string, CreditPackage[]>);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">
          {isArabic ? "تحميل الحزم..." : "Loading packages..."}
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            {isArabic ? "حزم النقاط والاشتراكات" : "Credits & Subscription Packages"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {isArabic 
              ? "اختر الحزمة المناسبة لأعمالك العقارية وتفوق على البوشملان بأسعار أفضل وميزات أكثر"
              : "Choose the perfect package for your real estate business and outperform Bo Shamlān with better prices and more features"
            }
          </p>
          
          {/* Current Credits Display */}
          {user && userCredits && (
            <div className="mt-6 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
              <Zap className="h-4 w-4" />
              <span className="font-medium">
                {isArabic 
                  ? `نقاطك الحالية: ${userCredits.credits_remaining}`
                  : `Current Credits: ${userCredits.credits_remaining}`
                }
              </span>
            </div>
          )}
        </div>

        {/* Package Tiers */}
        {Object.entries(groupedPackages).map(([type, typePackages]) => {
          const tierTitle = getTierTitle(type);
          
          return (
            <div key={type} className="mb-16">
              <h3 className="text-2xl font-bold text-center mb-8 text-primary">
                {isArabic ? tierTitle.ar : tierTitle.en}
              </h3>
              
              <div className={`grid gap-6 ${
                typePackages.length === 1 ? 'max-w-md mx-auto' :
                typePackages.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {typePackages.map((pkg) => {
                  const IconComponent = getPackageIcon(pkg.type);
                  const buttonText = getButtonText(pkg.type);
                  const pricePerAd = pkg.credit_count ? (pkg.price / pkg.credit_count).toFixed(2) : null;
                  
                  return (
                    <Card 
                      key={pkg.id}
                      className={`relative transition-all duration-300 hover:shadow-card-hover border-border/50 ${
                        pkg.is_popular ? 'ring-2 ring-secondary ring-offset-2 scale-105' : ''
                      }`}
                    >
                      {pkg.is_popular && (
                        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-secondary text-secondary-foreground">
                          {isArabic ? "الأكثر شعبية" : "Most Popular"}
                        </Badge>
                      )}

                      <CardHeader className="text-center pb-4">
                        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                          <IconComponent className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <CardTitle className="text-xl">
                          {isArabic ? pkg.name_ar : pkg.name_en}
                        </CardTitle>
                        <div className="mt-4">
                          <span className="text-4xl font-bold text-primary">
                            {pkg.currency} {pkg.price}
                          </span>
                          {pkg.duration_days && (
                            <span className="text-muted-foreground text-sm block">
                              {isArabic 
                                ? `صالح لـ ${pkg.duration_days} يوم`
                                : `Valid for ${pkg.duration_days} days`
                              }
                            </span>
                          )}
                        </div>
                        {pricePerAd && (
                          <p className="text-sm text-secondary font-medium">
                            {pkg.currency} {pricePerAd} {isArabic ? "لكل إعلان" : "per ad"}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                          {isArabic ? pkg.description_ar : pkg.description_en}
                        </p>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        <ul className="space-y-3">
                          {(isArabic ? pkg.features_ar : pkg.features_en).map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <Check className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button 
                          onClick={() => handlePurchase(pkg)}
                          disabled={purchaseLoading === pkg.id}
                          className={`w-full ${
                            pkg.is_popular 
                              ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' 
                              : 'bg-gradient-primary text-primary-foreground hover:opacity-90'
                          }`}
                          size="lg"
                        >
                          {purchaseLoading === pkg.id ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              {isArabic ? "معالجة..." : "Processing..."}
                            </div>
                          ) : (
                            isArabic ? buttonText.ar : buttonText.en
                          )}
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
            </div>
          );
        })}

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
                        feature_en: "6 Ads for KD 18 (KD 3/Ad)", 
                        feature_ar: "6 إعلانات بـ 18 د.ك (3 د.ك/إعلان)",
                        manzily: true, 
                        boshamlan: false 
                      },
                      { 
                        feature_en: "Credits never expire", 
                        feature_ar: "النقاط لا تنتهي صلاحيتها",
                        manzily: true, 
                        boshamlan: false 
                      },
                      { 
                        feature_en: "Agent verification badge", 
                        feature_ar: "شارة التحقق للوكلاء",
                        manzily: true, 
                        boshamlan: false 
                      },
                      { 
                        feature_en: "Personal landing pages", 
                        feature_ar: "صفحات شخصية للوكلاء",
                        manzily: true, 
                        boshamlan: false 
                      },
                      { 
                        feature_en: "Developer 3D showcases", 
                        feature_ar: "عروض ثلاثية الأبعاد للمطورين",
                        manzily: true, 
                        boshamlan: false 
                      },
                      { 
                        feature_en: "Monthly free ad", 
                        feature_ar: "إعلان مجاني شهرياً",
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
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="text-center py-4">
                          {row.boshamlan ? (
                            <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="text-destructive">✗</span>
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