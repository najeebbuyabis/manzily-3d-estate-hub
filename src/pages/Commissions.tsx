import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import CommissionTracker from "@/components/CommissionTracker";
import AdminCommissionDashboard from "@/components/AdminCommissionDashboard";
import { useAuth } from "@/hooks/useAuth";
import { DollarSign, Shield } from "lucide-react";

const Commissions: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("tracker");

  // In a real app, you'd check the user's role from the database
  const isAdmin = false; // This should be checked against user profile

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Commission Management</h1>
          <p className="text-muted-foreground">
            Track and manage your real estate commission earnings
          </p>
        </div>

        {!isAuthenticated ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <DollarSign className="h-16 w-16 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-semibold text-foreground">Access Required</h3>
                <p className="text-muted-foreground">Please log in to access commission tracking</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="tracker" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                My Commissions
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin Panel
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tracker" className="space-y-6">
              <CommissionTracker />
            </TabsContent>

            <TabsContent value="admin" className="space-y-6">
              <AdminCommissionDashboard />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Commissions;