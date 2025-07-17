import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import { AuthModal } from "@/components/auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Calendar, 
  ExternalLink, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Crown
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Billing() {
  const { user, subscription, checkSubscription } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for successful checkout
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
      toast({
        title: "Payment Successful!",
        description: "Your subscription has been activated.",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh subscription status
      setTimeout(() => {
        checkSubscription();
      }, 2000);
    }
  }, []);

  const handleManageSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshSubscription = async () => {
    setRefreshing(true);
    await checkSubscription();
    setRefreshing(false);
    toast({
      title: "Subscription Status Updated",
      description: "Your subscription information has been refreshed.",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-trust-dark mb-4">
              Billing & Subscriptions
            </h1>
            <p className="text-xl text-trust-light mb-8">
              Manage your subscription and billing information
            </p>
            
            <Alert className="max-w-md mx-auto mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sign In Required</AlertTitle>
              <AlertDescription>
                Please sign in to view your billing information and manage subscriptions.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={() => setAuthModalOpen(true)}
              size="lg"
              className="bg-trust-primary hover:bg-trust-primary/90 text-white shadow-trust-glow"
            >
              Sign In to Continue
            </Button>
          </div>
          
          <SubscriptionPlans />
          <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-trust-dark mb-4">
            Billing & Subscriptions
          </h1>
          <p className="text-xl text-trust-light mb-8">
            Manage your subscription and billing information
          </p>
        </div>

        {/* Current Subscription Status */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-trust-dark">
                    <CreditCard className="h-5 w-5" />
                    Current Subscription
                  </CardTitle>
                  <CardDescription>
                    Your current plan and billing information
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshSubscription}
                  disabled={refreshing}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Crown className="h-6 w-6 text-luxury-gold" />
                        <h3 className="text-2xl font-bold text-trust-dark">
                          {subscription.plan.name} Plan
                        </h3>
                        <Badge variant="secondary" className="bg-trust-primary/10 text-trust-primary">
                          {subscription.status}
                        </Badge>
                      </div>
                      <p className="text-trust-light">
                        {subscription.plan.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-trust-light">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Billing cycle: {subscription.billing_cycle}
                          </span>
                        </div>
                        {subscription.current_period_end && (
                          <div>
                            Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-trust-dark">
                        {subscription.billing_cycle === 'yearly' 
                          ? subscription.plan.price_yearly.toFixed(3)
                          : subscription.plan.price_monthly.toFixed(3)
                        }
                        <span className="text-lg text-trust-light ml-1">KWD</span>
                      </div>
                      <div className="text-sm text-trust-light">
                        per {subscription.billing_cycle === 'yearly' ? 'year' : 'month'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-trust-primary">
                        {subscription.plan.max_listings || '∞'}
                      </div>
                      <div className="text-sm text-trust-light">Property Listings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-trust-primary">
                        {subscription.plan.max_featured_listings}
                      </div>
                      <div className="text-sm text-trust-light">Featured Listings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-trust-primary">
                        ✓
                      </div>
                      <div className="text-sm text-trust-light">Priority Support</div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleManageSubscription}
                      disabled={loading}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {loading ? "Opening..." : "Manage Subscription"}
                    </Button>
                    {subscription.cancel_at_period_end && (
                      <Alert className="flex-1">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Subscription Cancelling</AlertTitle>
                        <AlertDescription>
                          Your subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Alert className="max-w-md mx-auto">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>No Active Subscription</AlertTitle>
                    <AlertDescription>
                      You're currently using the free plan. Choose a subscription below to unlock premium features.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subscription Plans */}
        <SubscriptionPlans />
      </div>
    </div>
  );
}