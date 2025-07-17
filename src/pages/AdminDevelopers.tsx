import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, ExternalLink, Trash2 } from "lucide-react";

interface Developer {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  website_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminDevelopers() {
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logo_url: "",
    description: "",
    website_url: "",
    phone: "",
    email: "",
    address: "",
    is_active: false,
    is_featured: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: developers, isLoading } = useQuery({
    queryKey: ["admin-developers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("developers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Developer[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("developers")
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-developers"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Developer created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating developer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase
        .from("developers")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-developers"] });
      setIsDialogOpen(false);
      setSelectedDeveloper(null);
      resetForm();
      toast({ title: "Developer updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating developer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("developers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-developers"] });
      toast({ title: "Developer deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting developer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleStatus = async (developer: Developer, field: 'is_active' | 'is_featured') => {
    updateMutation.mutate({
      id: developer.id,
      data: { [field]: !developer[field] }
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      logo_url: "",
      description: "",
      website_url: "",
      phone: "",
      email: "",
      address: "",
      is_active: false,
      is_featured: false,
    });
  };

  const openEditDialog = (developer: Developer) => {
    setSelectedDeveloper(developer);
    setFormData({
      name: developer.name,
      slug: developer.slug,
      logo_url: developer.logo_url || "",
      description: developer.description || "",
      website_url: developer.website_url || "",
      phone: developer.phone || "",
      email: developer.email || "",
      address: developer.address || "",
      is_active: developer.is_active,
      is_featured: developer.is_featured,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedDeveloper(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedDeveloper) {
      updateMutation.mutate({ id: selectedDeveloper.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: prev.slug || generateSlug(value)
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Developer Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Developer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedDeveloper ? "Edit Developer" : "Create Developer"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                    />
                    <Label htmlFor="is_featured">Featured</Label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {selectedDeveloper ? "Update" : "Create"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {developers?.map((developer) => (
            <Card key={developer.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {developer.logo_url && (
                      <img
                        src={developer.logo_url}
                        alt={`${developer.name} logo`}
                        className="w-12 h-12 object-contain rounded border bg-white"
                      />
                    )}
                    <div>
                      <CardTitle className="text-lg">{developer.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">/{developer.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEditDialog(developer)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(developer.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {developer.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{developer.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant={developer.is_active ? "default" : "secondary"}>
                    {developer.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {developer.is_featured && (
                    <Badge variant="outline" className="border-primary text-primary">
                      Featured
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span>Active:</span>
                    <Switch
                      checked={developer.is_active}
                      onCheckedChange={() => toggleStatus(developer, 'is_active')}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>Featured:</span>
                    <Switch
                      checked={developer.is_featured}
                      onCheckedChange={() => toggleStatus(developer, 'is_featured')}
                    />
                  </div>
                </div>

                {developer.website_url && (
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <a href={developer.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}

                {developer.is_active && (
                  <Button size="sm" className="w-full" asChild>
                    <a href={`/developers/${developer.slug}`} target="_blank">
                      View Showcase Page
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {developers?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No developers found</p>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Developer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}