import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, TrendingUp } from "lucide-react";

interface AdvertisingBannerProps {
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  variant?: "horizontal" | "vertical" | "featured";
  className?: string;
}

const AdvertisingBanner: React.FC<AdvertisingBannerProps> = ({
  title,
  description,
  imageUrl,
  ctaText,
  ctaLink,
  badge,
  variant = "horizontal",
  className = "",
}) => {
  const handleClick = () => {
    window.open(ctaLink, '_blank', 'noopener,noreferrer');
  };

  if (variant === "featured") {
    return (
      <Card className={`relative overflow-hidden bg-gradient-card hover:shadow-card-hover transition-all duration-300 cursor-pointer ${className}`} onClick={handleClick}>
        <div className="absolute inset-0">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <CardContent className="relative p-8 text-center">
          {badge && (
            <Badge className="mb-4 bg-secondary text-secondary-foreground">
              <Star className="h-3 w-3 mr-1" />
              {badge}
            </Badge>
          )}
          <h3 className="text-2xl font-bold text-foreground mb-3">{title}</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
          <Button variant="default" size="lg" className="group">
            {ctaText}
            <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (variant === "vertical") {
    return (
      <Card className={`overflow-hidden bg-gradient-card hover:shadow-card-hover transition-all duration-300 cursor-pointer ${className}`} onClick={handleClick}>
        <div className="aspect-[4/3]">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-6">
          {badge && (
            <Badge className="mb-2 bg-secondary text-secondary-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              {badge}
            </Badge>
          )}
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm mb-4">{description}</p>
          <Button variant="outline" size="sm" className="w-full group">
            {ctaText}
            <ExternalLink className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Default horizontal variant
  return (
    <Card className={`overflow-hidden bg-gradient-card hover:shadow-card-hover transition-all duration-300 cursor-pointer ${className}`} onClick={handleClick}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3">
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-48 md:h-full object-cover"
            />
          </div>
          <div className="md:w-2/3 p-6 flex flex-col justify-center">
            {badge && (
              <Badge className="mb-3 w-fit bg-secondary text-secondary-foreground">
                <Star className="h-3 w-3 mr-1" />
                {badge}
              </Badge>
            )}
            <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground mb-4">{description}</p>
            <Button variant="default" className="w-fit group">
              {ctaText}
              <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvertisingBanner;