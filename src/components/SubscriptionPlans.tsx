import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Star, Zap, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_listings: number | null;
  max_featured_listings: number;
  popular?: boolean;
}

const defaultPlans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for individual agents starting out",
    price_monthly: 25,
    price_yearly: 250,
    features: [
      "Up to 10 property listings",
      "Basic property analytics",
      "Standard support",
      "Mobile app access"
    ],
    max_listings: 10,
    max_featured_listings: 1
  },
  {
    id: "pro",
    name: "Pro",
    description: "Ideal for established agents and small agencies",
    price_monthly: 75,
    price_yearly: 750,
    features: [
      "Up to 50 property listings",
      "Advanced analytics & reporting",
      "Priority support",
      "Featured listings",
      "Lead generation tools",
      "Custom branding"
    ],
    max_listings: 50,
    max_featured_listings: 5,
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large agencies and property management companies",
    price_monthly: 200,
    price_yearly: 2000,
    features: [
      "Unlimited property listings",
      "Advanced analytics & reporting",
      "24/7 dedicated support",
      "Unlimited featured listings",
      "Advanced lead generation",
      "Custom branding",
      "API access",
      "White-label options"
    ],
    max_listings: null,
    max_featured_listings: 999
  }
];

const planIcons = {
  Basic: <Zap className="h-6 w-6" />,
  Pro: <Star className="h-6 w-6" />,
  Enterprise: <Crown className="h-6 w-6" />
};

export function SubscriptionPlans() {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    setLoading(plan.id);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId: plan.id,
          billingCycle: isYearly ? 'yearly' : 'monthly'
        }
      });

      if (error) throw error;

      // Open Stripe checkout in new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-trust-dark mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-trust-light mb-8">
          Select the perfect plan for your real estate business
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm ${!isYearly ? 'text-trust-dark font-medium' : 'text-trust-light'}`}>
            Monthly
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-trust-primary"
          />
          <span className={`text-sm ${isYearly ? 'text-trust-dark font-medium' : 'text-trust-light'}`}>
            Yearly
          </span>
          {isYearly && (
            <Badge variant="secondary" className="bg-luxury-gold/10 text-luxury-gold border-luxury-gold/20">
              Save 17%
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {defaultPlans.map((plan) => {
          const price = isYearly ? plan.price_yearly : plan.price_monthly;
          const monthlyPrice = isYearly ? plan.price_yearly / 12 : plan.price_monthly;
          
          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 hover:shadow-luxury-soft ${
                plan.popular 
                  ? 'border-trust-primary shadow-trust-glow scale-105' 
                  : 'border-border hover:border-trust-primary/50'
              }`}
            >
              {plan.popular && (
                <Badge 
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-trust-primary text-white px-4 py-1"
                >
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto mb-4 p-3 rounded-full ${
                  plan.popular 
                    ? 'bg-trust-primary text-white' 
                    : 'bg-muted text-trust-primary'
                }`}>
                  {planIcons[plan.name as keyof typeof planIcons]}
                </div>
                <CardTitle className="text-2xl text-trust-dark">{plan.name}</CardTitle>
                <CardDescription className="text-trust-light">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center pb-6">
                <div className="mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-trust-dark">
                      {price.toFixed(3)}
                    </span>
                    <span className="text-lg text-trust-light">KWD</span>
                  </div>
                  <div className="text-sm text-trust-light">
                    {isYearly ? (
                      <>
                        <span className="line-through text-muted-foreground">
                          {(plan.price_monthly * 12).toFixed(3)} KWD/year
                        </span>
                        <span className="ml-2">billed yearly</span>
                      </>
                    ) : (
                      'per month'
                    )}
                  </div>
                  {isYearly && (
                    <div className="text-sm text-trust-primary font-medium">
                      {monthlyPrice.toFixed(3)} KWD/month
                    </div>
                  )}
                </div>

                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-trust-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-trust-light">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-trust-primary hover:bg-trust-primary/90 text-white shadow-trust-glow'
                      : 'bg-background border border-trust-primary text-trust-primary hover:bg-trust-primary hover:text-white'
                  }`}
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.id}
                >
                  {loading === plan.id ? (
                    "Processing..."
                  ) : (
                    `Get ${plan.name}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <p className="text-trust-light">
          All plans include a 14-day free trial. No credit card required.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Prices are in Kuwaiti Dinar (KWD). Cancel anytime.
        </p>
      </div>
    </div>
  );
}