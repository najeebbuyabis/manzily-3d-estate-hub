import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

interface SearchFiltersProps {
  onFiltersChange?: (filters: FilterState) => void;
  className?: string;
}

interface FilterState {
  location: string;
  civilNumber: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  propertyType: string;
  area: string;
}

const getPropertyTypes = (t: any) => [
  { value: "apartment", label: t('apartment') },
  { value: "studio", label: t('studio') },
  { value: "penthouse", label: t('penthouse') },
  { value: "duplex", label: "Duplex" },
  { value: "house", label: "House" },
  { value: "farm", label: "Farm" },
  { value: "land", label: "Land" },
  { value: "land exchange", label: "Land Exchange" },
];

const getBedroomOptions = (t: any) => [
  { value: "any", label: "Any" },
  { value: "1", label: `1 ${t('bedrooms')}` },
  { value: "2", label: `2 ${t('bedrooms')}` },
  { value: "3", label: `3 ${t('bedrooms')}` },
  { value: "4+", label: `4+ ${t('bedrooms')}` },
];

export const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  onFiltersChange, 
  className 
}) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<FilterState>({
    location: "",
    civilNumber: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "any",
    propertyType: "apartment",
    area: "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      location: "",
      civilNumber: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "any",
      propertyType: "apartment",
      area: "",
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value && value !== "any" && value !== "apartment"
  ).length;

  return (
    <Card className={cn("bg-gradient-card border-border/50", className)}>
      <CardContent className="p-6">
        {/* Main search bar */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by location or area..."
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="luxury" size="lg">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>

        {/* Quick filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Select value={filters.propertyType} onValueChange={(value) => updateFilter("propertyType", value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              {getPropertyTypes(t).map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.bedrooms} onValueChange={(value) => updateFilter("bedrooms", value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Bedrooms" />
            </SelectTrigger>
            <SelectContent>
              {getBedroomOptions(t).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="filter"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="relative"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Advanced
            {activeFiltersCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-secondary text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" onClick={clearFilters} size="sm">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Advanced filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Civil Number</label>
              <Input
                placeholder="Search by Civil ID"
                value={filters.civilNumber}
                onChange={(e) => updateFilter("civilNumber", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Min Price</label>
              <Input
                type="number"
                placeholder="Min price"
                value={filters.minPrice}
                onChange={(e) => updateFilter("minPrice", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Max Price</label>
              <Input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Min Area (m²)</label>
              <Input
                type="number"
                placeholder="Min area"
                value={filters.area}
                onChange={(e) => updateFilter("area", e.target.value)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchFilters;