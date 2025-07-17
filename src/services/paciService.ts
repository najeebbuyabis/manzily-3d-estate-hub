// Service for integrating with Kuwait's PACI GIS system
// gis.paci.gov.kw integration

export interface PACIPropertyData {
  civilNumber: string;
  coordinates: [number, number]; // [longitude, latitude]
  officialAddress: string;
  block: string;
  street: string;
  buildingNumber: string;
  apartmentNumber?: string;
  area: string;
  governorate: string;
  propertyType: string;
  plotArea?: number;
  buildingArea?: number;
  ownershipType: string;
  registrationDate?: string;
  lastUpdated: string;
}

export interface PACIValidationResult {
  isValid: boolean;
  civilNumber: string;
  propertyData?: PACIPropertyData;
  error?: string;
}

class PACIGISService {
  private baseUrl = 'https://gis.paci.gov.kw/api'; // Mock URL - replace with actual PACI endpoint
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Validate a civil number and get property coordinates from PACI
   */
  async validateCivilNumber(civilNumber: string): Promise<PACIValidationResult> {
    try {
      // Mock implementation - in real scenario, this would call PACI API
      const mockData = this.getMockPACIData(civilNumber);
      
      if (mockData) {
        return {
          isValid: true,
          civilNumber,
          propertyData: mockData
        };
      } else {
        return {
          isValid: false,
          civilNumber,
          error: 'Civil number not found in PACI records'
        };
      }
    } catch (error) {
      return {
        isValid: false,
        civilNumber,
        error: `PACI API error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get property coordinates from PACI GIS
   */
  async getPropertyCoordinates(civilNumber: string): Promise<[number, number] | null> {
    const validation = await this.validateCivilNumber(civilNumber);
    return validation.propertyData?.coordinates || null;
  }

  /**
   * Get detailed property information from PACI
   */
  async getPropertyDetails(civilNumber: string): Promise<PACIPropertyData | null> {
    const validation = await this.validateCivilNumber(civilNumber);
    return validation.propertyData || null;
  }

  /**
   * Batch validate multiple civil numbers
   */
  async batchValidateCivilNumbers(civilNumbers: string[]): Promise<PACIValidationResult[]> {
    const results = await Promise.all(
      civilNumbers.map(civilNumber => this.validateCivilNumber(civilNumber))
    );
    return results;
  }

  /**
   * Search properties by area/location
   */
  async searchPropertiesByArea(governorate: string, area: string): Promise<PACIPropertyData[]> {
    try {
      // Mock implementation
      const allMockData = Object.values(this.getAllMockData());
      return allMockData.filter(property => 
        property.governorate.toLowerCase().includes(governorate.toLowerCase()) ||
        property.area.toLowerCase().includes(area.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching properties by area:', error);
      return [];
    }
  }

  /**
   * Get property boundaries (polygon data) from PACI GIS
   */
  async getPropertyBoundaries(civilNumber: string): Promise<GeoJSON.Polygon | null> {
    try {
      // Mock implementation - in real scenario, this would return actual boundary data
      const coordinates = await this.getPropertyCoordinates(civilNumber);
      if (!coordinates) return null;

      // Create a small square around the property point as mock boundary
      const [lng, lat] = coordinates;
      const offset = 0.0001; // Small offset for mock boundary

      return {
        type: 'Polygon',
        coordinates: [[
          [lng - offset, lat - offset],
          [lng + offset, lat - offset],
          [lng + offset, lat + offset],
          [lng - offset, lat + offset],
          [lng - offset, lat - offset]
        ]]
      };
    } catch (error) {
      console.error('Error getting property boundaries:', error);
      return null;
    }
  }

  /**
   * Mock data for development - replace with actual PACI API calls
   */
  private getMockPACIData(civilNumber: string): PACIPropertyData | null {
    const mockData = this.getAllMockData();
    return mockData[civilNumber] || null;
  }

  private getAllMockData(): { [key: string]: PACIPropertyData } {
    return {
      '67890123': {
        civilNumber: '67890123',
        coordinates: [47.9734, 29.3759],
        officialAddress: 'Salem Al-Mubarak Street, Block 10, Building 25',
        block: '10',
        street: 'Salem Al-Mubarak Street',
        buildingNumber: '25',
        apartmentNumber: '3A',
        area: 'Salmiya',
        governorate: 'Hawalli',
        propertyType: 'Residential Apartment',
        plotArea: 500,
        buildingArea: 120,
        ownershipType: 'Private',
        registrationDate: '2020-03-15',
        lastUpdated: new Date().toISOString()
      },
      '89012345': {
        civilNumber: '89012345',
        coordinates: [47.9774, 29.3767],
        officialAddress: 'Ahmad Al-Jaber Street, Block 1, Building 12',
        block: '1',
        street: 'Ahmad Al-Jaber Street',
        buildingNumber: '12',
        apartmentNumber: '2B',
        area: 'Sharq',
        governorate: 'Kuwait',
        propertyType: 'Commercial Apartment',
        plotArea: 300,
        buildingArea: 85,
        ownershipType: 'Private',
        registrationDate: '2019-08-22',
        lastUpdated: new Date().toISOString()
      },
      '23456789': {
        civilNumber: '23456789',
        coordinates: [47.9234, 29.3321],
        officialAddress: 'Block 4, Street 40, Building 15',
        block: '4',
        street: 'Street 40',
        buildingNumber: '15',
        apartmentNumber: '1A',
        area: 'Jabriya',
        governorate: 'Hawalli',
        propertyType: 'Residential Apartment',
        plotArea: 700,
        buildingArea: 140,
        ownershipType: 'Private',
        registrationDate: '2018-12-10',
        lastUpdated: new Date().toISOString()
      },
      '45678901': {
        civilNumber: '45678901',
        coordinates: [48.0234, 29.2991],
        officialAddress: 'Coastal Road, Block 2, Building 8',
        block: '2',
        street: 'Coastal Road',
        buildingNumber: '8',
        area: 'Mahboula',
        governorate: 'Ahmadi',
        propertyType: 'Studio Apartment',
        plotArea: 200,
        buildingArea: 55,
        ownershipType: 'Private',
        registrationDate: '2021-05-18',
        lastUpdated: new Date().toISOString()
      },
      '12345678': {
        civilNumber: '12345678',
        coordinates: [47.9734, 29.3889],
        officialAddress: 'Marina Crescent, Block 1, Tower A',
        block: '1',
        street: 'Marina Crescent',
        buildingNumber: 'Tower A',
        apartmentNumber: 'PH-01',
        area: 'Kuwait City Marina',
        governorate: 'Kuwait',
        propertyType: 'Luxury Penthouse',
        plotArea: 1000,
        buildingArea: 250,
        ownershipType: 'Private',
        registrationDate: '2022-01-30',
        lastUpdated: new Date().toISOString()
      },
      '56789012': {
        civilNumber: '56789012',
        coordinates: [48.0034, 29.3321],
        officialAddress: 'Tunis Street, Block 3, Building 20',
        block: '3',
        street: 'Tunis Street',
        buildingNumber: '20',
        apartmentNumber: '1B',
        area: 'Hawally',
        governorate: 'Hawalli',
        propertyType: 'Family Apartment',
        plotArea: 400,
        buildingArea: 95,
        ownershipType: 'Private',
        registrationDate: '2017-11-05',
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

// Export singleton instance
export const paciService = new PACIGISService();
export default PACIGISService;