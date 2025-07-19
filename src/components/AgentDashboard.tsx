import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  Eye, 
  MessageSquare, 
  AlertTriangle,
  ArrowUpRight,
  Phone,
  Mail
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface UserCredits {
  credits_remaining: number;
  total_credits: number;
  last_free_ad_date: string | null;
}

interface Lead {
  id: string;
  property_id: string;
  contact_name: string;
  contact_method: string;
  contact_value: string;
  created_at: string;
}

export const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user credits
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (creditsError && creditsError.code !== 'PGRST116') {
        throw creditsError;
      }

      setUserCredits(creditsData);

      // Mock recent leads data (replace with actual query when leads table is implemented)
      setRecentLeads([
        {
          id: '1',
          property_id: 'prop1',
          contact_name: 'Ahmed Al-Mansouri',
          contact_method: 'whatsapp',
          contact_value: '+96599123456',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          property_id: 'prop2',
          contact_name: 'Fatima Al-Sabah',
          contact_method: 'email',
          contact_value: 'fatima@example.com',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canPostFreeAd = () => {
    if (!userCredits?.last_free_ad_date) return true;
    
    const lastAdDate = new Date(userCredits.last_free_ad_date);
    const now = new Date();
    const daysSinceLastAd = (now.getTime() - lastAdDate.getTime()) / (1000 * 3600 * 24);
    
    return daysSinceLastAd >= 30; // Allow one free ad per month
  };

  const getCreditsColor = () => {
    if (!userCredits) return "bg-muted";
    const remaining = userCredits.credits_remaining;
    if (remaining <= 1) return "bg-destructive";
    if (remaining <= 3) return "bg-yellow-500";
    return "bg-primary";
  };

  const shouldShowUpgradePrompt = () => {
    return !userCredits || userCredits.credits_remaining <= 3;
  };

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Credits Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              {isArabic ? "أرصدة الإعلانات" : "Ad Credits"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">
                  {userCredits?.credits_remaining || 0}
                </span>
                <Badge variant={userCredits?.credits_remaining && userCredits.credits_remaining > 3 ? "default" : "destructive"}>
                  {isArabic ? "متبقية" : "Remaining"}
                </Badge>
              </div>
              
              {userCredits && (
                <Progress 
                  value={(userCredits.credits_remaining / userCredits.total_credits) * 100} 
                  className="h-2"
                />
              )}
              
              <p className="text-sm text-muted-foreground">
                {isArabic 
                  ? `من أصل ${userCredits?.total_credits || 0} إعلان`
                  : `out of ${userCredits?.total_credits || 0} total ads`
                }
              </p>

              {canPostFreeAd() && (
                <Badge variant="secondary" className="text-xs">
                  {isArabic ? "إعلان مجاني متاح هذا الشهر" : "Free ad available this month"}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5" />
              {isArabic ? "المشاهدات" : "Views"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <span className="text-3xl font-bold">1,234</span>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                +12% {isArabic ? "هذا الأسبوع" : "this week"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              {isArabic ? "العملاء المحتملون" : "Leads"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <span className="text-3xl font-bold">{recentLeads.length}</span>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "هذا الشهر" : "this month"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Prompt */}
      {shouldShowUpgradePrompt() && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  {isArabic ? "أرصدتك منخفضة!" : "Your credits are running low!"}
                </h3>
                <p className="text-yellow-700 mb-4">
                  {isArabic 
                    ? "لديك أقل من 3 إعلانات متبقية. قم بالترقية للحصول على المزيد من الإعلانات والوصول إلى المزيد من العملاء المحتملين."
                    : "You have less than 3 ads remaining. Upgrade to get more ads and reach more potential clients."
                  }
                </p>
                <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
                  <Link to="/billing">
                    {isArabic ? "ترقية الآن" : "Upgrade Now"}
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">
            {isArabic ? "أحدث العملاء المحتملين" : "Recent Leads"}
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/billing">
              {isArabic ? "احصل على المزيد" : "Get More Leads"}
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentLeads.length > 0 ? (
            <div className="space-y-4">
              {recentLeads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {lead.contact_method === 'whatsapp' ? (
                        <MessageSquare className="h-5 w-5 text-primary" />
                      ) : lead.contact_method === 'email' ? (
                        <Mail className="h-5 w-5 text-primary" />
                      ) : (
                        <Phone className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{lead.contact_name}</p>
                      <p className="text-sm text-muted-foreground">{lead.contact_value}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {lead.contact_method}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {isArabic ? "لا توجد عملاء محتملون بعد" : "No leads yet"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {isArabic 
                  ? "ابدأ بنشر إعلاناتك للحصول على عملاء محتملين"
                  : "Start posting your listings to get leads"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button asChild size="lg" className="h-auto p-6">
          <Link to="/property-intake">
            <div className="text-center">
              <div className="font-semibold mb-1">
                {isArabic ? "إضافة إعلان جديد" : "Add New Listing"}
              </div>
              <div className="text-sm opacity-80">
                {userCredits?.credits_remaining || 0} {isArabic ? "إعلانات متبقية" : "ads remaining"}
              </div>
            </div>
          </Link>
        </Button>

        <Button asChild variant="outline" size="lg" className="h-auto p-6">
          <Link to="/billing">
            <div className="text-center">
              <div className="font-semibold mb-1">
                {isArabic ? "ترقية الخطة" : "Upgrade Plan"}
              </div>
              <div className="text-sm opacity-80">
                {isArabic ? "احصل على المزيد من الإعلانات" : "Get more ads"}
              </div>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  );
};