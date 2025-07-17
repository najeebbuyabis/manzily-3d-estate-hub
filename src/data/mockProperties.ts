// Mock data for properties
import apartment1 from "@/assets/apartment-1.jpg";
import apartment2 from "@/assets/apartment-2.jpg";
import apartment3 from "@/assets/apartment-3.jpg";
import apartment4 from "@/assets/apartment-4.jpg";
import apartment5 from "@/assets/apartment-5.jpg";
import apartment6 from "@/assets/apartment-6.jpg";
import house1 from "@/assets/house-1.jpg";
import house2 from "@/assets/house-2.jpg";
import farm1 from "@/assets/farm-1.jpg";
import farm2 from "@/assets/farm-2.jpg";
import land1 from "@/assets/land-1.jpg";
import land2 from "@/assets/land-2.jpg";

export interface Property {
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
  description?: string;
  amenities?: string[];
  agentName?: string;
  agentPhone?: string;
}

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Luxury Waterfront Apartment",
    location: "Salmiya, Kuwait City",
    civilNumber: "67890123",
    price: 850,
    currency: "KWD",
    bedrooms: 2,
    bathrooms: 2,
    area: 120,
    type: "Apartment",
    image: apartment1,
    featured: true,
    description: "Stunning waterfront apartment with panoramic Arabian Gulf views and premium finishes.",
    amenities: ["Pool", "Gym", "Parking", "Security", "Sea View"],
    agentName: "Fatima Al-Kandari",
    agentPhone: "+965 9999 1234"
  },
  {
    id: "2",
    title: "Modern City Center Apartment",
    location: "Sharq, Kuwait City",
    civilNumber: "89012345",
    price: 620,
    currency: "KWD",
    bedrooms: 1,
    bathrooms: 1,
    area: 85,
    type: "Apartment",
    image: apartment2,
    featured: false,
    description: "Contemporary apartment in the heart of Kuwait City with easy access to shopping and business districts.",
    amenities: ["Gym", "Parking", "Shopping Mall", "Business District"],
    agentName: "Ahmed Al-Mutairi",
    agentPhone: "+965 9888 5678"
  },
  {
    id: "3",
    title: "Elegant Garden Apartment",
    location: "Jabriya, Kuwait",
    civilNumber: "23456789",
    price: 720,
    currency: "KWD",
    bedrooms: 3,
    bathrooms: 2,
    area: 140,
    type: "Apartment",
    image: apartment3,
    featured: true,
    description: "Spacious apartment with private garden access and family-friendly community near schools.",
    amenities: ["Garden", "Pool", "Playground", "Parking", "Schools"],
    agentName: "Maryam Al-Sabah",
    agentPhone: "+965 9777 9012"
  },
  {
    id: "4",
    title: "Contemporary Studio Apartment",
    location: "Mahboula, Kuwait",
    civilNumber: "45678901",
    price: 480,
    currency: "KWD",
    bedrooms: 0,
    bathrooms: 1,
    area: 55,
    type: "Studio",
    image: apartment4,
    featured: false,
    description: "Perfect studio for young professionals with modern amenities and coastal location.",
    amenities: ["Pool", "Gym", "Beach Access", "Parking"],
    agentName: "Omar Al-Rashid",
    agentPhone: "+965 9666 3456"
  },
  {
    id: "5",
    title: "Luxury Penthouse Suite",
    location: "Kuwait City Marina",
    civilNumber: "12345678",
    price: 1500,
    currency: "KWD",
    bedrooms: 4,
    bathrooms: 3,
    area: 250,
    type: "Penthouse",
    image: apartment5,
    featured: true,
    description: "Exclusive penthouse with private terrace and breathtaking Kuwait Bay views.",
    amenities: ["Bay View", "Private Terrace", "Pool", "Gym", "Concierge"],
    agentName: "Layla Al-Enezi",
    agentPhone: "+965 9555 7890"
  },
  {
    id: "6",
    title: "Cozy Family Apartment",
    location: "Hawally, Kuwait",
    civilNumber: "56789012",
    price: 350,
    currency: "KWD",
    bedrooms: 2,
    bathrooms: 1,
    area: 95,
    type: "Apartment",
    image: apartment6,
    featured: false,
    description: "Affordable family apartment in quiet neighborhood with excellent schools and amenities nearby.",
    amenities: ["Parking", "Garden", "Schools", "Shopping"],
    agentName: "Khalid Al-Ajmi",
    agentPhone: "+965 9444 2468"
  },
  // Houses for Sale
  {
    id: "7",
    title: "Traditional Kuwaiti House",
    location: "Kaifan, Kuwait",
    civilNumber: "78901234",
    price: 280000,
    currency: "KWD",
    bedrooms: 4,
    bathrooms: 3,
    area: 400,
    type: "House",
    image: house1,
    featured: true,
    description: "Beautiful traditional Kuwaiti house with authentic architecture, private courtyard, and modern renovations.",
    amenities: ["Private Courtyard", "Traditional Design", "Parking", "Garden", "Storage"],
    agentName: "Hassan Al-Kuwari",
    agentPhone: "+965 9333 1111"
  },
  {
    id: "8",
    title: "Modern Luxury Villa",
    location: "Mishref, Kuwait",
    civilNumber: "90123456",
    price: 450000,
    currency: "KWD",
    bedrooms: 5,
    bathrooms: 4,
    area: 600,
    type: "House",
    image: house2,
    featured: true,
    description: "Contemporary luxury villa with premium finishes, landscaped gardens, and state-of-the-art amenities.",
    amenities: ["Swimming Pool", "Landscaped Garden", "Garage", "Modern Kitchen", "Smart Home"],
    agentName: "Noura Al-Sabhan",
    agentPhone: "+965 9222 3333"
  },
  // Farms for Rent
  {
    id: "9",
    title: "Agricultural Farm Land",
    location: "Wafra, Kuwait",
    civilNumber: "34567890",
    price: 2500,
    currency: "KWD",
    bedrooms: 0,
    bathrooms: 1,
    area: 5000,
    type: "Farm",
    image: farm1,
    featured: false,
    description: "Large agricultural farm land perfect for crop cultivation with irrigation systems and storage facilities.",
    amenities: ["Irrigation System", "Storage Facilities", "Machinery Shed", "Well Water", "Fertile Soil"],
    agentName: "Abdullah Al-Mutairi",
    agentPhone: "+965 9111 4444"
  },
  {
    id: "10",
    title: "Livestock Farm Property",
    location: "Abdali, Kuwait",
    civilNumber: "56789013",
    price: 3200,
    currency: "KWD",
    bedrooms: 1,
    bathrooms: 2,
    area: 8000,
    type: "Farm",
    image: farm2,
    featured: true,
    description: "Spacious livestock farm with animal shelters, grazing areas, and residential quarters for farm management.",
    amenities: ["Animal Shelters", "Grazing Areas", "Residential Quarters", "Feed Storage", "Veterinary Area"],
    agentName: "Salem Al-Dosari",
    agentPhone: "+965 9000 5555"
  },
  // Lands for Sale
  {
    id: "11",
    title: "Residential Land Plot",
    location: "Sabah Al-Salem, Kuwait",
    civilNumber: "67890145",
    price: 180000,
    currency: "KWD",
    bedrooms: 0,
    bathrooms: 0,
    area: 750,
    type: "Land",
    image: land1,
    featured: false,
    description: "Prime residential land plot ready for development in a well-established neighborhood with utilities available.",
    amenities: ["Utilities Available", "Corner Plot", "Residential Zone", "Easy Access", "Flat Terrain"],
    agentName: "Youssef Al-Ahmad",
    agentPhone: "+965 8999 6666"
  },
  {
    id: "12",
    title: "Commercial Land Investment",
    location: "Farwaniya, Kuwait",
    civilNumber: "89012367",
    price: 350000,
    currency: "KWD",
    bedrooms: 0,
    bathrooms: 0,
    area: 1200,
    type: "Land",
    image: land2,
    featured: true,
    description: "Strategic commercial land plot with high visibility and excellent investment potential in growing business district.",
    amenities: ["Commercial Zone", "High Visibility", "Main Road Access", "Investment Opportunity", "Large Area"],
    agentName: "Reem Al-Zahra",
    agentPhone: "+965 8888 7777"
  }
];

export const getPropertyById = (id: string): Property | undefined => {
  return mockProperties.find(property => property.id === id);
};

export const getPropertiesByType = (type: string): Property[] => {
  return mockProperties.filter(property => property.type.toLowerCase() === type.toLowerCase());
};

export const getFeaturedProperties = (): Property[] => {
  return mockProperties.filter(property => property.featured);
};

// Deduplicate properties by civil number to prevent agents from showing the same property
export const deduplicatePropertiesByCivilNumber = (properties: Property[]): Property[] => {
  const seen = new Set<string>();
  return properties.filter(property => {
    if (seen.has(property.civilNumber)) {
      return false;
    }
    seen.add(property.civilNumber);
    return true;
  });
};

// Get unique properties (deduplicated by civil number)
export const getUniqueProperties = (): Property[] => {
  return deduplicatePropertiesByCivilNumber(mockProperties);
};