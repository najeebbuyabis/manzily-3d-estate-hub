import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, MapPin, Building, Clock, Search, Loader2 } from 'lucide-react';
import { paciService, PACIValidationResult } from '@/services/paciService';
import { useToast } from '@/hooks/use-toast';

interface PACIValidationProps {
  className?: string;
  onValidationResult?: (result: PACIValidationResult) => void;
}

const PACIValidation: React.FC<PACIValidationProps> = ({ 
  className = "",
  onValidationResult 
}) => {
  const [civilNumber, setCivilNumber] = useState('');
  const [validationResult, setValidationResult] = useState<PACIValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleValidation = async () => {
    if (!civilNumber.trim()) {
      toast({
        title: "Civil Number Required",
        description: "Please enter a civil number to validate.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await paciService.validateCivilNumber(civilNumber.trim());
      setValidationResult(result);
      onValidationResult?.(result);

      if (result.isValid) {
        toast({
          title: "Property Validated",
          description: "Property found in PACI records.",
        });
      } else {
        toast({
          title: "Property Not Found",
          description: result.error || "Property not found in PACI records.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Failed to validate property with PACI.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidation();
    }
  };

  return (
    <Card className={`bg-gradient-card border-border/50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-secondary" />
          PACI Property Validation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Validate property civil numbers with Kuwait's Public Authority for Civil Information (PACI)
          </p>
          
          <div className="flex gap-2">
            <Input
              placeholder="Enter civil number (e.g., 67890123)"
              value={civilNumber}
              onChange={(e) => setCivilNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button 
              onClick={handleValidation}
              disabled={isLoading || !civilNumber.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Validate
            </Button>
          </div>
        </div>

        {validationResult && (
          <div className="space-y-4">
            <Separator />
            
            {/* Validation Status */}
            <div className="flex items-center gap-2">
              {validationResult.isValid ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Valid Property
                  </Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    Invalid Property
                  </Badge>
                </>
              )}
            </div>

            {/* Property Details */}
            {validationResult.isValid && validationResult.propertyData && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Property Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Civil Number:</span>
                    <p className="font-medium">{validationResult.propertyData.civilNumber}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Property Type:</span>
                    <p className="font-medium">{validationResult.propertyData.propertyType}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Area:</span>
                    <p className="font-medium">{validationResult.propertyData.area}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Governorate:</span>
                    <p className="font-medium">{validationResult.propertyData.governorate}</p>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2">
                    <span className="text-muted-foreground">Official Address:</span>
                    <p className="font-medium">{validationResult.propertyData.officialAddress}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Block:</span>
                    <p className="font-medium">{validationResult.propertyData.block}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Building:</span>
                    <p className="font-medium">{validationResult.propertyData.buildingNumber}</p>
                  </div>
                  
                  {validationResult.propertyData.plotArea && (
                    <div>
                      <span className="text-muted-foreground">Plot Area:</span>
                      <p className="font-medium">{validationResult.propertyData.plotArea} m²</p>
                    </div>
                  )}
                  
                  {validationResult.propertyData.buildingArea && (
                    <div>
                      <span className="text-muted-foreground">Building Area:</span>
                      <p className="font-medium">{validationResult.propertyData.buildingArea} m²</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-muted-foreground">Ownership:</span>
                    <p className="font-medium">{validationResult.propertyData.ownershipType}</p>
                  </div>
                  
                  {validationResult.propertyData.registrationDate && (
                    <div>
                      <span className="text-muted-foreground">Registered:</span>
                      <p className="font-medium">
                        {new Date(validationResult.propertyData.registrationDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Coordinates */}
                {validationResult.propertyData.coordinates && (
                  <div className="pt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-secondary" />
                      <span className="text-muted-foreground">Coordinates:</span>
                      <span className="font-mono text-foreground">
                        {validationResult.propertyData.coordinates[1].toFixed(6)}, {validationResult.propertyData.coordinates[0].toFixed(6)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Last Updated */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                  <Clock className="h-3 w-3" />
                  <span>
                    Last updated: {new Date(validationResult.propertyData.lastUpdated).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {!validationResult.isValid && validationResult.error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {validationResult.error}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          <p>✓ Connected to Kuwait PACI GIS System</p>
          <p>✓ Real-time property validation</p>
          <p>✓ Official government records</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PACIValidation;