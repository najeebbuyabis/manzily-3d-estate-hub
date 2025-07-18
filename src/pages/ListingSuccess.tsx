import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, AlertCircle, Home, Building2 } from 'lucide-react';
import Header from '@/components/Header';

const ListingSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    property?: any;
    error?: string;
  }>({ success: false });

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setVerificationResult({ 
          success: false, 
          error: "No session ID provided" 
        });
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-listing-payment', {
          body: { sessionId }
        });

        if (error) throw error;

        setVerificationResult({ 
          success: true, 
          property: data.property 
        });

        toast({
          title: "Payment Successful!",
          description: "Your property listing has been published successfully.",
        });
      } catch (error) {
        console.error('Error verifying payment:', error);
        setVerificationResult({ 
          success: false, 
          error: error instanceof Error ? error.message : "Payment verification failed" 
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Verifying your payment...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            {verificationResult.success ? (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
                <CardDescription>
                  Your property listing has been published successfully.
                </CardDescription>
              </>
            ) : (
              <>
                <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
                <CardDescription>
                  {verificationResult.error || "There was an issue processing your payment."}
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {verificationResult.success && verificationResult.property && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="font-medium">Property Details</span>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Type:</span> {verificationResult.property.property_type}</p>
                  <p><span className="text-muted-foreground">Location:</span> {verificationResult.property.location}</p>
                  <p><span className="text-muted-foreground">Price:</span> {verificationResult.property.price} KWD</p>
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                className="flex-1"
              >
                View Listings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListingSuccess;