import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import AdminCommissionDashboard from "@/components/AdminCommissionDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Users, Building2, DollarSign, Settings, Plus, Pencil, Trash2, Shield, BarChart3 } from "lucide-react";
import DeveloperAssistant from "@/components/DeveloperAssistant";

interface Developer {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
}

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logo_url: "",
    website_url: "",
    phone: "",
    email: "",
    address: "",
    is_active: false,
    is_featured: false,
  });

  // Check if user is admin
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
    staleTime: 0, // Always fetch fresh data
  });

  const isAdmin = userProfile?.role === 'admin';

  // Show loading while checking admin status
  if (profileLoading && user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Checking permissions...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Placeholder subscription statistics (will be functional once TypeScript types are updated)
  const subscriptionStats = {
    totalSubscribed: 0,
    totalUsers: 0,
    tierCounts: {} as Record<string, number>
  };

  // Fetch developers
  const { data: developers, isLoading, refetch } = useQuery({
    queryKey: ["admin-developers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("developers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Developer[];
    },
    enabled: isAdmin,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      logo_url: "",
      website_url: "",
      phone: "",
      email: "",
      address: "",
      is_active: false,
      is_featured: false,
    });
    setSelectedDeveloper(null);
  };

  const handleEdit = (developer: Developer) => {
    setSelectedDeveloper(developer);
    setFormData({
      name: developer.name,
      slug: developer.slug,
      description: developer.description || "",
      logo_url: developer.logo_url || "",
      website_url: developer.website_url || "",
      phone: developer.phone || "",
      email: developer.email || "",
      address: developer.address || "",
      is_active: developer.is_active,
      is_featured: developer.is_featured,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedDeveloper) {
        // Update existing developer
        const { error } = await supabase
          .from("developers")
          .update(formData)
          .eq("id", selectedDeveloper.id);
        
        if (error) throw error;
        toast({ title: "Developer updated successfully" });
      } else {
        // Create new developer
        const { error } = await supabase
          .from("developers")
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: "Developer created successfully" });
      }
      
      refetch();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving developer:", error);
      toast({ 
        title: "Error", 
        description: "Failed to save developer",
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this developer?")) return;
    
    try {
      const { error } = await supabase
        .from("developers")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      refetch();
      toast({ title: "Developer deleted successfully" });
    } catch (error) {
      console.error("Error deleting developer:", error);
      toast({ 
        title: "Error", 
        description: "Failed to delete developer",
        variant: "destructive" 
      });
    }
  };

  // Show access denied for non-admin users after profile is loaded
  if (!isAdmin && userProfile && !profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Shield className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Access Denied</h3>
                <p className="text-muted-foreground">You need administrator privileges to access this page.</p>
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
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage all administrative features</p>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="developers" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Developers
              </TabsTrigger>
              <TabsTrigger value="commissions" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Commissions
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{subscriptionStats?.totalSubscribed || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      out of {subscriptionStats?.totalUsers || 0} total users
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Premium Subscribers</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {subscriptionStats?.tierCounts?.Premium || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Premium plan subscribers</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Basic Subscribers</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {subscriptionStats?.tierCounts?.Basic || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Basic plan subscribers</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Enterprise Subscribers</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {subscriptionStats?.tierCounts?.Enterprise || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Enterprise plan subscribers</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Breakdown</CardTitle>
                    <CardDescription>Current subscription tier distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(subscriptionStats?.tierCounts || {}).map(([tier, count]) => (
                        <div key={tier} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{tier}</Badge>
                          </div>
                          <div className="font-medium">{count} subscribers</div>
                        </div>
                      ))}
                      {Object.keys(subscriptionStats?.tierCounts || {}).length === 0 && (
                        <p className="text-muted-foreground text-center py-4">
                          No active subscriptions found
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Developer Statistics</CardTitle>
                    <CardDescription>Developer platform metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Total Developers</span>
                        <Badge variant="secondary">{developers?.length || 0}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Active Developers</span>
                        <Badge variant="default">{developers?.filter(d => d.is_active).length || 0}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Featured Developers</span>
                        <Badge variant="outline">{developers?.filter(d => d.is_featured).length || 0}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="developers" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Manage Developers</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Developer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedDeveloper ? "Edit Developer" : "Add New Developer"}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedDeveloper 
                          ? "Update the developer information below." 
                          : "Fill in the details to add a new developer."
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="slug">Slug *</Label>
                          <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="logo_url">Logo URL</Label>
                          <Input
                            id="logo_url"
                            type="url"
                            value={formData.logo_url}
                            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website_url">Website URL</Label>
                          <Input
                            id="website_url"
                            type="url"
                            value={formData.website_url}
                            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                          />
                          <Label htmlFor="is_active">Active</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_featured"
                            checked={formData.is_featured}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                          />
                          <Label htmlFor="is_featured">Featured</Label>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                          {selectedDeveloper ? "Update Developer" : "Add Developer"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            Loading developers...
                          </TableCell>
                        </TableRow>
                      ) : developers?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            No developers found. Add your first developer to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        developers?.map((developer) => (
                          <TableRow key={developer.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div>{developer.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  /{developer.slug}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={developer.is_active ? "default" : "secondary"}>
                                {developer.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {developer.is_featured && (
                                <Badge variant="outline">Featured</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(developer.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(developer)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(developer.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="commissions" className="space-y-6">
              <AdminCommissionDashboard />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure system-wide settings and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Maintenance Mode</h4>
                        <p className="text-sm text-muted-foreground">
                          Enable maintenance mode to prevent new registrations
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Auto-approve Developers</h4>
                        <p className="text-sm text-muted-foreground">
                          Automatically approve new developer registrations
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Developer Assistant */}
      <DeveloperAssistant />
    </div>
  );
}