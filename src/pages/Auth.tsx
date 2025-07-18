import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function Auth() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);

  // Redirect to home if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold ml-3">Manzily</span>
            </div>
            <CardTitle className="text-xl">Welcome to Manzily</CardTitle>
            <CardDescription className="text-sm">
              Your smart real estate platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthModal 
              open={isAuthModalOpen} 
              onOpenChange={setIsAuthModalOpen}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}