import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const SubscriptionPlans: React.FC = () => {
  const { user, subscription } = useAuth();
  const { toast } = useToast();

  const plans = [
    {
      id: "basic",
      name: "Basic Agent",
      price: 29,
      currency: "KWD",
      icon: Building2,
      description: "Perfect for individual agents starting their career",
      features: [
        "List up to 5 properties",
        "Basic commission tracking",
        "Standard support",
        "Mobile app access",
        "Email notifications"
      ],
      popular: false
    },
    {
      id: "premium", 
      name: "Premium Agent",
      price: 79,
      currency: "KWD",
      icon: Star,
      description: "Best for growing agents and small teams",
      features: [
        "List up to 25 properties",
        "Advanced commission tracking",
        "Invoice generation",
        "Priority support",
        "Mobile app access",
        "Email & SMS notifications",
        "Analytics dashboard",
        "Lead management"
      ],
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 199,
      currency: "KWD", 
      icon: Crown,
      description: "For agencies and large teams",
      features: [
        "Unlimited properties",
        "Full commission management",
        "Advanced invoice generation",
        "24/7 dedicated support",
        "Mobile app access",
        "All notifications",
        "Advanced analytics",
        "CRM integration",
        "Team management",
        "White-label options",
        "API access"
      ],
      popular: false
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isCurrentPlan = (planId: string) => {
    if (!subscription) return false;
    return subscription.subscription_tier?.toLowerCase() === planId;
  };

  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan to grow your real estate business in Kuwait
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          const isPopular = plan.popular;
          const isCurrent = isCurrentPlan(plan.id);

          return (
            <Card 
              key={plan.id}
              className={`relative bg-gradient-card border-border/50 hover:shadow-card-hover transition-all duration-300 ${
                isPopular ? 'ring-2 ring-secondary ring-offset-2 scale-105' : ''
              } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            >
              {isPopular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-secondary text-secondary-foreground">
                  Most Popular
                </Badge>
              )}
              
              {isCurrent && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  Current Plan
                </Badge>
              )}

              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl text-foreground">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">{plan.currency} {plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrent}
                  className={`w-full ${
                    isPopular 
                      ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' 
                      : isCurrent
                      ? 'bg-muted text-muted-foreground'
                      : ''
                  }`}
                  size="lg"
                >
                  {isCurrent ? 'Current Plan' : `Subscribe to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground mb-4">
          All plans include a 14-day free trial. Cancel anytime.
        </p>
        {subscription?.subscribed && (
          <Button variant="outline" onClick={() => {
            // TODO: Implement customer portal
            toast({
              title: "Coming Soon",
              description: "Customer portal will be available soon"
            });
          }}>
            Manage Subscription
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
