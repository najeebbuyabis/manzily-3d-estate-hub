import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import PropertyCard from "@/components/PropertyCard";
import PropertyMap from "@/components/PropertyMap";
import PACIValidation from "@/components/PACIValidation";
import SearchFilters from "@/components/SearchFilters";
import ChatAssistant from "@/components/ChatAssistant";
import PropertyIntakeAssistant from "@/components/PropertyIntakeAssistant";
import AdminModerationAssistant from "@/components/AdminModerationAssistant";
import UserOnboarding from "@/components/UserOnboarding";
import BannerSection from "@/components/BannerSection";
import { useTranslation } from 'react-i18next';

import { mockProperties, getFeaturedProperties, getUniqueProperties, deduplicatePropertiesByCivilNumber, Property } from "@/data/mockProperties";
import { Building2, Star, TrendingUp, Users, MapPin, ArrowRight, Shield } from "lucide-react";

interface FilterState {
  location: string;
  civilNumber: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  propertyType: string;
  area: string;
  rentalPeriod: string;
  listingType: string;
}

const Index = () => {
  const { t } = useTranslation();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    location: "",
    civilNumber: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "any",
    propertyType: "apartment",
    area: "",
    rentalPeriod: "any",
    listingType: "any",
  });

  const filteredProperties = useMemo(() => {
    // First get unique properties to prevent duplicates based on civil number
    const uniqueProperties = getUniqueProperties();
    
    return uniqueProperties.filter(property => {
      const locationMatch = !filters.location || 
        property.location.toLowerCase().includes(filters.location.toLowerCase());
      
      const civilNumberMatch = !filters.civilNumber ||
        property.civilNumber.includes(filters.civilNumber);
      
      const typeMatch = !filters.propertyType || filters.propertyType === "apartment" ||
        property.type.toLowerCase() === filters.propertyType.toLowerCase();
      
      const bedroomMatch = filters.bedrooms === "any" || 
        (filters.bedrooms === "4+" ? property.bedrooms >= 4 : 
         property.bedrooms === parseInt(filters.bedrooms));
      
      const minPriceMatch = !filters.minPrice || property.price >= parseInt(filters.minPrice);
      const maxPriceMatch = !filters.maxPrice || property.price <= parseInt(filters.maxPrice);
      const areaMatch = !filters.area || property.area >= parseInt(filters.area);
      
      const rentalPeriodMatch = filters.rentalPeriod === "any" || 
        property.rentalPeriod === filters.rentalPeriod;
      
      const listingTypeMatch = filters.listingType === "any" || 
        property.listingType === filters.listingType;

      return locationMatch && civilNumberMatch && typeMatch && bedroomMatch && 
             minPriceMatch && maxPriceMatch && areaMatch && rentalPeriodMatch && listingTypeMatch;
    });
  }, [filters]);

  const featuredProperties = deduplicatePropertiesByCivilNumber(getFeaturedProperties());

  const stats = [
    { icon: Building2, label: t('properties'), value: "+2,500" },
    { icon: Users, label: t('happyClients'), value: "+10,000" },
    { icon: Star, label: t('starReviews'), value: "4.9/5" },
    { icon: TrendingUp, label: t('growthRate'), value: "25%" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-primary-foreground py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="bg-secondary text-secondary-foreground px-4 py-2">
              <Star className="h-4 w-4 mr-2" />
              {t('realEstatePlatform')}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {t('findYourPerfect')}
              <span className="block bg-gradient-to-r from-secondary to-luxury-gold bg-clip-text text-transparent">
                {t('dreamApartment')}
              </span>
            </h1>
            
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              {t('heroDescription')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="xl"
                onClick={() => setShowOnboarding(true)}
              >
                <Building2 className="h-5 w-5" />
                {t('getStarted')}
              </Button>
              <Button variant="outline" size="xl" className="bg-background/20 border-primary-foreground/30 text-primary-foreground hover:bg-background/30">
                <MapPin className="h-5 w-5" />
                {t('virtualTours')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center bg-gradient-card border-border/50 hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                  <p className="text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Top Banner Section */}
      <BannerSection variant="top" />

      {/* Search Section */}
      <section className="py-16 bg-accent/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('searchPremiumApartments')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('searchDescription')}
            </p>
          </div>
          
          <SearchFilters onFiltersChange={setFilters} className="max-w-5xl mx-auto" />
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('featuredApartments')}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('featuredDescription')}
              </p>
            </div>
            <Button variant="outline" className="hidden md:flex">
              {t('viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                featured={true}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Middle Banner Section */}
      <BannerSection variant="middle" />

      {/* Property Map Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('propertyLocations')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('propertyLocationsDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <PropertyMap 
                properties={filteredProperties} 
                selectedProperty={selectedProperty}
                onPropertySelect={setSelectedProperty}
                className="max-w-full"
              />
            </div>
            <div className="space-y-6">
              <PACIValidation className="h-fit" />
              <BannerSection variant="sidebar" />
            </div>
          </div>
        </div>
      </section>

      {/* PACI Integration Info */}
      <section className="py-12 bg-accent/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {t('verifiedWithPaci')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t('paciVerificationDescription')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <MapPin className="h-6 w-6 text-primary-foreground" />
                </div>
                <h4 className="font-semibold text-foreground">{t('accurateLocations')}</h4>
                <p className="text-sm text-muted-foreground">{t('accurateLocationsDesc')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <Building2 className="h-6 w-6 text-primary-foreground" />
                </div>
                <h4 className="font-semibold text-foreground">{t('verifiedProperties')}</h4>
                <p className="text-sm text-muted-foreground">{t('verifiedPropertiesDesc')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <h4 className="font-semibold text-foreground">{t('noDuplicates')}</h4>
                <p className="text-sm text-muted-foreground">{t('noDuplicatesDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Properties */}
      <section className="py-16 bg-accent/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('availableApartments')}
              </h2>
              <p className="text-lg text-muted-foreground">
                {filteredProperties.length} {t('propertiesFound')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                className={selectedProperty?.id === property.id ? "ring-2 ring-secondary" : ""}
                onClick={() => setSelectedProperty(property)}
              />
            ))}
          </div>
          
          {filteredProperties.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search filters to see more results</p>
              <Button onClick={() => setFilters({
                location: "",
                civilNumber: "",
                minPrice: "",
                maxPrice: "",
                bedrooms: "any",
                propertyType: "apartment",
                area: "",
                rentalPeriod: "any",
                listingType: "any",
              })}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Manzily</h3>
                  <p className="text-sm text-background/70">{t('realEstatePlatform')}</p>
                </div>
              </div>
              <p className="text-background/80">
                {t('trustedPartner')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('propertiesSection')}</h4>
              <ul className="space-y-2 text-background/80">
                <li><a href="#" className="hover:text-background transition-colors">{t('apartments')}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{t('studios')}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{t('penthouses')}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{t('duplexes')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('servicesSection')}</h4>
              <ul className="space-y-2 text-background/80">
                <li><a href="#" className="hover:text-background transition-colors">{t('propertyManagement')}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{t('virtualTours')}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{t('investmentAdvice')}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{t('legalSupport')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('contactSection')}</h4>
              <ul className="space-y-2 text-background/80">
                <li>3333 2222 965+</li>
                <li>info@manzily.kw</li>
                <li>Kuwait City, Kuwait</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-background/20 mt-12 pt-8 text-center text-background/60">
            <p>{t('allRightsReserved')}</p>
          </div>
        </div>
      </footer>
      
      {/* Chat Assistant */}
      <ChatAssistant />
      
      {/* Property Intake Assistant */}
      <PropertyIntakeAssistant />
      
      {/* Admin Moderation Assistant */}
      <AdminModerationAssistant />
      
      {/* User Onboarding */}
      <UserOnboarding 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onRoleSelected={(role) => {
          console.log("User selected role:", role);
          // Handle role selection (e.g., show relevant tools, navigate to specific sections)
        }}
      />
      
    </div>
  );
};

export default Index;
