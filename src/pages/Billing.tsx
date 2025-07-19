import React from "react";
import Header from "@/components/Header";
import { ManzillyPricingSection } from "@/components/ManzillyPricingSection";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Billing: React.FC = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Check for success/cancel parameters
  const isSuccess = window.location.pathname.includes('/success');
  const isCancel = window.location.pathname.includes('/cancel');

  React.useEffect(() => {
    if (isSuccess && user) {
      // Refresh subscription status after successful payment
      checkSubscription();
    }
  }, [isSuccess, user, checkSubscription]);

  const handleRefreshSubscription = async () => {
    setRefreshing(true);
    await checkSubscription();
    setRefreshing(false);
    toast({
      title: "Subscription Updated",
      description: "Your subscription status has been refreshed.",
    });
  };

  const renderStatusMessage = () => {
    if (isSuccess) {
      return (
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-green-800 text-lg">Payment Successful!</h3>
                <p className="text-green-600">
                  Thank you for your subscription. Your account has been activated.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (isCancel) {
      return (
        <Card className="mb-8 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-center justify-center">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="font-semibold text-orange-800 text-lg">Payment Cancelled</h3>
                <p className="text-orange-600">
                  Your payment was cancelled. You can try again anytime.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (subscription?.subscribed) {
      return (
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-blue-800 text-lg">Active Subscription</h3>
                  <p className="text-blue-600">
                    You are currently subscribed to the {subscription.subscription_tier} plan
                  </p>
                  {subscription.subscription_end && (
                    <p className="text-sm text-blue-500 mt-1">
                      Renews on {new Date(subscription.subscription_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
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
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">اشترك الآن / Subscribe Now</h1>
          <p className="text-muted-foreground">
            Choose the perfect plan for your real estate business in Kuwait and outperform Bo Shamlān
          </p>
        </div>

        {renderStatusMessage()}

        <ManzillyPricingSection />
      </div>
    </div>
  );
};

export default Billing;