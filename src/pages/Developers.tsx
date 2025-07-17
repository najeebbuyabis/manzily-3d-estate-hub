import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function Developers() {
  const { data: developers, isLoading } = useQuery({
    queryKey: ["active-developers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("developers")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded w-1/3"></div>
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Developers & Agencies</h1>
          <p className="text-xl text-muted-foreground">
            Discover Kuwait's leading real estate developers and agencies
          </p>
        </div>

        {developers && developers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {developers.map((developer) => (
              <Card key={developer.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {developer.logo_url && (
                      <img
                        src={developer.logo_url}
                        alt={`${developer.name} logo`}
                        className="w-16 h-16 object-contain rounded-lg border bg-white flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold truncate">{developer.name}</h3>
                        {developer.is_featured && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                      {developer.description && (
                        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                          {developer.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button asChild className="w-full">
                      <a href={`/developers/${developer.slug}`}>
                        View Projects
                      </a>
                    </Button>
                    
                    {developer.website_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={developer.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit Website
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No Developers Found</h2>
            <p className="text-muted-foreground">
              No active developers are currently showcased on our platform.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}