import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Square, Heart, Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  civilNumber: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  image: string;
  featured?: boolean;
  className?: string;
  onClick?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  location,
  civilNumber,
  price,
  currency,
  bedrooms,
  bathrooms,
  area,
  type,
  image,
  featured = false,
  className,
  onClick,
}) => {
  const navigate = useNavigate();
  return (
    <Card 
      className={cn(
        "group overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 bg-gradient-card border-border/50 cursor-pointer",
        featured && "ring-2 ring-secondary ring-offset-2",
        className
      )}
      onClick={() => {
        navigate(`/property/${id}`);
        onClick?.();
      }}
    >
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Property type badge */}
        <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
          {type}
        </Badge>
        
        {/* Featured badge */}
        {featured && (
          <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground">
            Featured
          </Badge>
        )}
        
        {/* Favorite button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <Heart className="h-4 w-4" />
        </Button>
        
        {/* Price overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-background/95 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <p className="text-2xl font-bold text-primary">
              {currency} {price.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">per month</p>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4 text-secondary" />
              <span className="text-sm">{location}</span>
            </div>
            <div className="text-xs text-muted-foreground/80 mt-1">
              Civil ID: {civilNumber}
            </div>
          </div>
          
          {/* Property features */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{bathrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span>{area} m²</span>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="default" size="sm" className="flex-1">
              <Phone className="h-4 w-4" />
              Call
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <MessageCircle className="h-4 w-4" />
              Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;