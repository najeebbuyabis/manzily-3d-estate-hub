import React from "react";
import Header from "@/components/Header";
import { AgentDashboard } from "@/components/AgentDashboard";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Agent Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your listings, track performance, and grow your business
          </p>
        </div>

        <AgentDashboard />
      </div>
    </div>
  );
};

export default Dashboard;