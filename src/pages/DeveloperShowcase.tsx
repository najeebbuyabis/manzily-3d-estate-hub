import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Phone, Mail, MapPin } from "lucide-react";
import { getPropertyById } from "@/data/mockProperties";

export default function DeveloperShowcase() {
  const { slug } = useParams<{ slug: string }>();

  const { data: developer, isLoading } = useQuery({
    queryKey: ["developer", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("developers")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: projects } = useQuery({
    queryKey: ["developer-projects", developer?.id],
    queryFn: async () => {
      if (!developer?.id) return [];

      const { data, error } = await supabase
        .from("developer_projects")
        .select("property_id")
        .eq("developer_id", developer.id);

      if (error) throw error;

      // Get property details from mock data
      return data.map(project => getPropertyById(project.property_id)).filter(Boolean);
    },
    enabled: !!developer?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!developer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Developer Not Found</h1>
          <p className="text-muted-foreground">The developer you're looking for doesn't exist or is not active.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Developer Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6 mb-6">
            {developer.logo_url && (
              <img
                src={developer.logo_url}
                alt={`${developer.name} logo`}
                className="w-24 h-24 object-contain rounded-lg border bg-white"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{developer.name}</h1>
                {developer.is_featured && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Featured Developer
                  </Badge>
                )}
              </div>
              {developer.description && (
                <p className="text-muted-foreground text-lg mb-4">{developer.description}</p>
              )}
              
              {/* Contact Info */}
              <div className="flex flex-wrap gap-4">
                {developer.website_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={developer.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}
                {developer.phone && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${developer.phone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      {developer.phone}
                    </a>
                  </Button>
                )}
                {developer.email && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${developer.email}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      {developer.email}
                    </a>
                  </Button>
                )}
                {developer.address && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {developer.address}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Projects by {developer.name}</h2>
          
          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{property.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{property.location}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {property.price.toLocaleString()} {property.currency}
                      </span>
                      <Button size="sm" asChild>
                        <a href={`/property/${property.id}`}>View Details</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No projects available for this developer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}