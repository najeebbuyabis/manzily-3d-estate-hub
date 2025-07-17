import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  FileText, 
  Download, 
  Receipt, 
  Plus,
  Eye,
  Printer,
  Mail
} from "lucide-react";

interface InvoiceFormData {
  transaction_id: string;
  type: string;
  amount: string;
  currency: string;
  description: string;
  include_vat: boolean;
}

const InvoiceGenerator: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [formData, setFormData] = useState<InvoiceFormData>({
    transaction_id: "",
    type: "subscription",
    amount: "",
    currency: "KWD",
    description: "",
    include_vat: false
  });

  const handleGenerateInvoice = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to generate invoices");
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke("generate-invoice", {
        body: {
          transaction_id: formData.transaction_id || `TXN-${Date.now()}`,
          type: formData.type,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          description: formData.description,
          include_vat: formData.include_vat
        }
      });

      if (response.error) throw response.error;

      setGeneratedInvoice(response.data.invoice);
      toast.success("Invoice generated successfully!");
      setIsCreateModalOpen(false);
      
      // Reset form
      setFormData({
        transaction_id: "",
        type: "subscription",
        amount: "",
        currency: "KWD",
        description: "",
        include_vat: false
      });
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (invoice: any) => {
    if (invoice?.download_url) {
      window.open(invoice.download_url, '_blank');
    }
  };

  const handlePrintInvoice = (invoice: any) => {
    if (invoice?.download_url) {
      const printWindow = window.open(invoice.download_url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'subscription':
        return 'اشتراك / Subscription';
      case 'featured_listing':
        return 'إعلان مميز / Featured Listing';
      case 'commission':
        return 'عمولة / Commission';
      case 'lead_generation':
        return 'توليد عملاء / Lead Generation';
      default:
        return type;
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="text-xl font-semibold text-foreground">Access Required</h3>
            <p className="text-muted-foreground">Please log in to access invoice generation</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Invoice Generator</h2>
          <p className="text-muted-foreground">
            Generate bilingual invoices with Kuwaiti tax compliance
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate New Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="transaction_id">Transaction ID (Optional)</Label>
                <Input
                  id="transaction_id"
                  value={formData.transaction_id}
                  onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                  placeholder="Auto-generated if empty"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Service Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="featured_listing">Featured Listing</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                    <SelectItem value="lead_generation">Lead Generation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.001"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.000"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KWD">KWD</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Service description..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include_vat"
                  checked={formData.include_vat}
                  onCheckedChange={(checked) => setFormData({...formData, include_vat: checked as boolean})}
                />
                <Label htmlFor="include_vat">Include VAT (5%)</Label>
              </div>

              <Button 
                onClick={handleGenerateInvoice} 
                className="w-full"
                disabled={loading || !formData.amount || !formData.description}
              >
                {loading ? "Generating..." : "Generate Invoice"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Generated Invoice Display */}
      {generatedInvoice && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Generated Invoice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Invoice Number:</span>
                  <p className="font-mono">{generatedInvoice.invoice_number}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Type:</span>
                  <p>{getTypeLabel(formData.type)}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Amount:</span>
                  <p className="font-bold">{formData.currency} {formData.amount}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">VAT:</span>
                  <p>{formData.include_vat ? "5% Included" : "Not Applicable"}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadInvoice(generatedInvoice)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsPreviewModalOpen(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePrintInvoice(generatedInvoice)}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          {generatedInvoice && (
            <div className="border rounded-lg">
              <iframe
                src={generatedInvoice.download_url}
                className="w-full h-[600px] border-0"
                title="Invoice Preview"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Features Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Bilingual Format</h3>
            <p className="text-sm text-muted-foreground">
              Professional invoices in both Arabic and English
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Tax Compliant</h3>
            <p className="text-sm text-muted-foreground">
              Kuwaiti VAT standards with proper formatting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Multiple Formats</h3>
            <p className="text-sm text-muted-foreground">
              Download as HTML or print directly from browser
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceGenerator;