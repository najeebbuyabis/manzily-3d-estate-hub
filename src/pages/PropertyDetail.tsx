import React from "react";
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import PropertyMap from "@/components/PropertyMap";
import { getPropertyById } from "@/data/mockProperties";
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart, 
  Phone, 
  MessageCircle, 
  ArrowLeft,
  Check,
  Building2,
  Car,
  Shield,
  Waves,
  Trees,
  Dumbbell,
  ShoppingBag,
  GraduationCap,
  MapPin as LocationIcon
} from "lucide-react";

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const property = id ? getPropertyById(id) : undefined;

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">{t('propertyNotFound')}</h1>
            <p className="text-muted-foreground mb-6">{t('propertyNotFoundDescription')}</p>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToProperties')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, any> = {
      'Pool': Waves,
      'Gym': Dumbbell,
      'Parking': Car,
      'Security': Shield,
      'Garden': Trees,
      'Shopping Mall': ShoppingBag,
      'Schools': GraduationCap,
      'Business District': Building2,
    };
    return iconMap[amenity] || Check;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToProperties')}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Property Image and Details */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
              />
              {property.featured && (
                <Badge className="absolute top-2 left-2 lg:top-4 lg:left-4 bg-secondary text-secondary-foreground text-xs">
                  {t('featured')}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 lg:top-4 lg:right-4 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            {/* Property Info */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{property.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LocationIcon className="h-4 w-4 text-secondary flex-shrink-0" />
                    <span className="text-sm lg:text-base">{property.location}</span>
                  </div>
                  <div className="text-xs lg:text-sm text-muted-foreground/80 mt-1">
                    {t('civilId')}: {property.civilNumber}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-primary">
                    {property.currency} {property.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('perMonth')}</p>
                </div>
              </div>

              {/* Property Features */}
              <div className="flex flex-wrap items-center gap-4 lg:gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 lg:h-5 lg:w-5 text-secondary" />
                  <span className="font-medium text-sm lg:text-base">{property.bedrooms} {t('bedrooms')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-4 w-4 lg:h-5 lg:w-5 text-secondary" />
                  <span className="font-medium text-sm lg:text-base">{property.bathrooms} {t('bathrooms')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="h-4 w-4 lg:h-5 lg:w-5 text-secondary" />
                  <span className="font-medium text-sm lg:text-base">{property.area} {t('sqm')}</span>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-3">{t('description')}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* Amenities */}
              {property.amenities && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, index) => {
                      const IconComponent = getAmenityIcon(amenity);
                      return (
                        <div key={index} className="flex items-center gap-2 text-muted-foreground">
                          <IconComponent className="h-4 w-4 text-secondary" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Card */}
          <div className="space-y-6">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="text-center">Contact Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {property.agentName && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary-foreground font-semibold text-lg">
                        {property.agentName.charAt(0)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground">{property.agentName}</h3>
                    {property.agentPhone && (
                      <p className="text-sm text-muted-foreground">{property.agentPhone}</p>
                    )}
                  </div>
                )}
                
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Agent
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Property Type Card */}
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-6">
                <div className="text-center">
                  <Building2 className="h-12 w-12 text-secondary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">Property Type</h3>
                  <p className="text-muted-foreground">{property.type}</p>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Viewing */}
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <h3 className="font-semibold text-foreground">Schedule a Viewing</h3>
                  <p className="text-sm text-muted-foreground">
                    Book a time to visit this property
                  </p>
                  <Button variant="secondary" className="w-full">
                    Schedule Viewing
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Property Location Map */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Property Location</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <PropertyMap 
                  properties={[property]} 
                  selectedProperty={property}
                  className="border-none"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;