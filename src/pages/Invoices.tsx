import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import InvoiceGenerator from "@/components/InvoiceGenerator";
import InvoiceHistory from "@/components/InvoiceHistory";
import { useAuth } from "@/hooks/useAuth";
import { FileText, History, Plus } from "lucide-react";

const Invoices: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("generate");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Invoice Management</h1>
          <p className="text-muted-foreground">
            Generate and manage bilingual invoices with Kuwaiti tax compliance
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Generate Invoice
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Invoice History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <InvoiceGenerator />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <InvoiceHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Invoices;