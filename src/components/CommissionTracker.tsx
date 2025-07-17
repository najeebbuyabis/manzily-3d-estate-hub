import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Plus,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

interface Commission {
  id: string;
  property_id: string;
  agent_id: string;
  amount: number;
  commission_rate: number;
  status: "pending" | "paid" | "disputed";
  property_sale_price: number;
  payment_date?: string;
  created_at: string;
  updated_at: string;
}

const CommissionTracker: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCommission, setNewCommission] = useState({
    property_id: "",
    property_sale_price: "",
    commission_rate: "3"
  });

  const fetchCommissions = async () => {
    if (!isAuthenticated || !user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("commissions")
        .select("*")
        .eq("agent_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCommissions((data as any) || []);
    } catch (error) {
      console.error("Error fetching commissions:", error);
      toast.error("Failed to load commission data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, [isAuthenticated, user]);

  const handleCreateCommission = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to create commission entries");
      return;
    }

    try {
      const response = await supabase.functions.invoke("create-commission", {
        body: {
          property_id: newCommission.property_id,
          property_sale_price: parseFloat(newCommission.property_sale_price),
          commission_rate: parseFloat(newCommission.commission_rate)
        }
      });

      if (response.error) throw response.error;

      toast.success("Commission entry created successfully!");
      setIsCreateModalOpen(false);
      setNewCommission({ property_id: "", property_sale_price: "", commission_rate: "3" });
      fetchCommissions();
    } catch (error) {
      console.error("Error creating commission:", error);
      toast.error("Failed to create commission entry");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "paid":
        return <Badge variant="default" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case "disputed":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Disputed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalEarnings = commissions.reduce((sum, c) => c.status === "paid" ? sum + c.amount : sum, 0);
  const pendingEarnings = commissions.reduce((sum, c) => c.status === "pending" ? sum + c.amount : sum, 0);
  const totalCommissions = commissions.length;

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Please log in to view commission tracking</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-3xl font-bold text-green-600">KD {totalEarnings.toFixed(3)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Earnings</p>
                <p className="text-3xl font-bold text-yellow-600">KD {pendingEarnings.toFixed(3)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Deals</p>
                <p className="text-3xl font-bold text-primary">{totalCommissions}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Commission History
            </CardTitle>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Commission
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Commission Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="property_id">Property ID</Label>
                    <Input
                      id="property_id"
                      value={newCommission.property_id}
                      onChange={(e) => setNewCommission({...newCommission, property_id: e.target.value})}
                      placeholder="Enter property ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sale_price">Property Sale Price (KD)</Label>
                    <Input
                      id="sale_price"
                      type="number"
                      value={newCommission.property_sale_price}
                      onChange={(e) => setNewCommission({...newCommission, property_sale_price: e.target.value})}
                      placeholder="e.g., 150000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                    <Select value={newCommission.commission_rate} onValueChange={(value) => setNewCommission({...newCommission, commission_rate: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1%</SelectItem>
                        <SelectItem value="2">2%</SelectItem>
                        <SelectItem value="3">3%</SelectItem>
                        <SelectItem value="4">4%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateCommission} className="w-full">
                    Create Commission Entry
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading commission data...</p>
            </div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No commission entries found</p>
              <p className="text-sm text-muted-foreground">Create your first commission entry to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {commissions.map((commission) => (
                <Card key={commission.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h4 className="font-semibold">Property #{commission.property_id}</h4>
                          {getStatusBadge(commission.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Sale Price:</span> KD {commission.property_sale_price.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Rate:</span> {commission.commission_rate}%
                          </div>
                          <div>
                            <span className="font-medium">Commission:</span> KD {commission.amount.toFixed(3)}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {new Date(commission.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionTracker;