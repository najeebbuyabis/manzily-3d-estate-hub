import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Property } from '@/data/mockProperties';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Layers, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onPropertySelect?: (property: Property) => void;
  className?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedProperty,
  onPropertySelect,
  className = ""
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);
  const { toast } = useToast();

  // Kuwait coordinates for initial center
  const kuwaitCenter: [number, number] = [47.9824, 29.3759];

  const initializeMap = (token: string) => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: kuwaitCenter,
      zoom: 11,
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-right');

    map.current.on('style.load', () => {
      toast({
        title: "Map Loaded",
        description: "Property locations are now visible on the map.",
      });
    });

    setIsTokenSet(true);
  };

  // Mock function to get coordinates from PACI GIS
  const getPACICoordinates = async (civilNumber: string): Promise<[number, number] | null> => {
    // In a real implementation, this would call the PACI GIS API
    // For now, we'll return mock coordinates within Kuwait
    const mockCoordinates: { [key: string]: [number, number] } = {
      '67890123': [47.9734, 29.3759], // Salmiya
      '89012345': [47.9774, 29.3767], // Sharq
      '23456789': [47.9234, 29.3321], // Jabriya
      '45678901': [48.0234, 29.2991], // Mahboula
      '12345678': [47.9734, 29.3889], // Kuwait City Marina
      '56789012': [48.0034, 29.3321], // Hawally
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockCoordinates[civilNumber] || null;
  };

  const addPropertyMarkers = async () => {
    if (!map.current || !isTokenSet) return;

    // Clear existing markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    for (const property of properties) {
      try {
        const coordinates = await getPACICoordinates(property.civilNumber);
        
        if (coordinates) {
          // Create custom marker element
          const markerElement = document.createElement('div');
          markerElement.className = 'property-marker';
          markerElement.innerHTML = `
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
              <span class="text-primary-foreground text-xs font-bold">${property.currency} ${property.price}</span>
            </div>
          `;

          const marker = new mapboxgl.Marker({
            element: markerElement,
            anchor: 'bottom'
          })
            .setLngLat(coordinates)
            .addTo(map.current);

          // Create popup
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            className: 'property-popup'
          }).setHTML(`
            <div class="p-2 min-w-[200px]">
              <img src="${property.image}" alt="${property.title}" class="w-full h-24 object-cover rounded mb-2">
              <h3 class="font-semibold text-sm mb-1">${property.title}</h3>
              <p class="text-xs text-gray-600 mb-1">${property.location}</p>
              <p class="text-xs text-gray-500 mb-2">Civil ID: ${property.civilNumber}</p>
              <div class="flex justify-between items-center">
                <span class="font-bold text-primary">${property.currency} ${property.price}</span>
                <span class="text-xs">${property.bedrooms}BR/${property.bathrooms}BA</span>
              </div>
            </div>
          `);

          marker.setPopup(popup);

          // Add click event
          markerElement.addEventListener('click', () => {
            if (onPropertySelect) {
              onPropertySelect(property);
            }
          });

          markers.current[property.id] = marker;
        }
      } catch (error) {
        console.error(`Failed to get coordinates for property ${property.id}:`, error);
      }
    }
  };

  useEffect(() => {
    if (isTokenSet) {
      addPropertyMarkers();
    }
  }, [properties, isTokenSet]);

  useEffect(() => {
    if (selectedProperty && markers.current[selectedProperty.id]) {
      const marker = markers.current[selectedProperty.id];
      marker.togglePopup();
      
      // Center map on selected property
      if (map.current) {
        map.current.flyTo({
          center: marker.getLngLat(),
          zoom: 15,
          duration: 1500
        });
      }
    }
  }, [selectedProperty]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      initializeMap(mapboxToken);
    } else {
      toast({
        title: "Token Required",
        description: "Please enter your Mapbox public token.",
        variant: "destructive"
      });
    }
  };

  if (!isTokenSet) {
    return (
      <Card className={`${className} bg-gradient-card border-border/50`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-secondary" />
            Property Location Map
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              To display property locations on the map, please enter your Mapbox public token.
              You can get one from{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter Mapbox public token..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTokenSubmit()}
              />
              <Button onClick={handleTokenSubmit}>
                <MapPin className="h-4 w-4" />
                Load Map
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} bg-gradient-card border-border/50`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-secondary" />
            Property Locations
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Layers className="h-4 w-4" />
              Layers
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div 
            ref={mapContainer} 
            className="w-full h-96 rounded-lg shadow-lg"
            style={{ minHeight: '400px' }}
          />
          
          {/* Map controls */}
          <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <p className="text-xs text-muted-foreground">
              {properties.length} properties displayed
            </p>
            <p className="text-xs text-muted-foreground">
              Data from PACI GIS Kuwait
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyMap;