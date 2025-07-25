import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Billing from "./pages/Billing";
import Commissions from "./pages/Commissions";
import Invoices from "./pages/Invoices";
import PropertyDetail from "./pages/PropertyDetail";
import DeveloperShowcase from "./pages/DeveloperShowcase";
import AdminDevelopers from "./pages/AdminDevelopers";
import Admin from "./pages/Admin";
import Developers from "./pages/Developers";
import ListingSuccess from "./pages/ListingSuccess";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";

// Create queryClient with error boundary configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  // Add debugging to ensure React is properly available
  if (typeof React === 'undefined') {
    console.error('React is undefined in App component');
    return <div>React loading error - please refresh</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/billing/success" element={<Billing />} />
              <Route path="/billing/cancel" element={<Billing />} />
              <Route path="/commissions" element={<Commissions />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/developers" element={<Developers />} />
              <Route path="/developers/:slug" element={<DeveloperShowcase />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/developers" element={<AdminDevelopers />} />
              <Route path="/listing-success" element={<ListingSuccess />} />
              <Route path="/listing-cancelled" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
