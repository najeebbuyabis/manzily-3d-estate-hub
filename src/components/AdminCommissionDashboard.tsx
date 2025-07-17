import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  Download,
  Edit
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
  user_profiles?: {
    company_name?: string;
    phone?: string;
  };
}

const AdminCommissionDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "",
    payment_date: ""
  });

  const fetchAllCommissions = async () => {
    if (!isAuthenticated || !user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from("commissions")
        .select(`
          *,
          profiles:agent_id (
            company_name,
            full_name,
            phone
          )
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

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
    fetchAllCommissions();
  }, [isAuthenticated, user, statusFilter]);

  const handleUpdateStatus = async () => {
    if (!selectedCommission) return;

    try {
      const response = await supabase.functions.invoke("update-commission-status", {
        body: {
          commission_id: selectedCommission.id,
          status: updateData.status,
          payment_date: updateData.payment_date || null
        }
      });

      if (response.error) throw response.error;

      toast.success("Commission status updated successfully!");
      setIsUpdateModalOpen(false);
      setSelectedCommission(null);
      setUpdateData({ status: "", payment_date: "" });
      fetchAllCommissions();
    } catch (error) {
      console.error("Error updating commission:", error);
      toast.error("Failed to update commission status");
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

  const totalCommissions = commissions.length;
  const totalAmount = commissions.reduce((sum, c) => sum + c.amount, 0);
  const paidAmount = commissions.reduce((sum, c) => c.status === "paid" ? sum + c.amount : sum, 0);
  const pendingAmount = commissions.reduce((sum, c) => c.status === "pending" ? sum + c.amount : sum, 0);

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Please log in to access admin dashboard</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Commissions</p>
                <p className="text-3xl font-bold text-primary">{totalCommissions}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-3xl font-bold text-foreground">KD {totalAmount.toFixed(3)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paid Out</p>
                <p className="text-3xl font-bold text-green-600">KD {paidAmount.toFixed(3)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">KD {pendingAmount.toFixed(3)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Commission List */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading commission data...</p>
            </div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No commission entries found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {commissions.map((commission) => (
                <Card key={commission.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-4">
                          <h4 className="font-semibold">Property #{commission.property_id}</h4>
                          {getStatusBadge(commission.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Agent ID:</span> {commission.agent_id.slice(0, 8)}...
                          </div>
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
                        {commission.payment_date && (
                          <div className="text-sm text-green-600">
                            <span className="font-medium">Paid on:</span> {new Date(commission.payment_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedCommission(commission);
                          setUpdateData({ status: commission.status, payment_date: commission.payment_date || "" });
                          setIsUpdateModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Status Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Commission Status</DialogTitle>
          </DialogHeader>
          {selectedCommission && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold">Property #{selectedCommission.property_id}</p>
                <p className="text-sm text-muted-foreground">Commission: KD {selectedCommission.amount.toFixed(3)}</p>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={updateData.status} onValueChange={(value) => setUpdateData({...updateData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {updateData.status === "paid" && (
                <div>
                  <Label htmlFor="payment_date">Payment Date</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={updateData.payment_date}
                    onChange={(e) => setUpdateData({...updateData, payment_date: e.target.value})}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleUpdateStatus} className="flex-1">
                  Update Status
                </Button>
                <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCommissionDashboard;