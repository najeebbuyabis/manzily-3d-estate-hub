// Mock data for apartment properties
import apartment1 from "@/assets/apartment-1.jpg";
import apartment2 from "@/assets/apartment-2.jpg";
import apartment3 from "@/assets/apartment-3.jpg";
import apartment4 from "@/assets/apartment-4.jpg";
import apartment5 from "@/assets/apartment-5.jpg";
import apartment6 from "@/assets/apartment-6.jpg";

export interface Property {
  id: string;
  title: string;
  location: string;
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
    location: "Marina District, Dubai",
    price: 8500,
    currency: "AED",
    bedrooms: 2,
    bathrooms: 2,
    area: 120,
    type: "Apartment",
    image: apartment1,
    featured: true,
    description: "Stunning waterfront apartment with panoramic city views and premium finishes.",
    amenities: ["Pool", "Gym", "Parking", "Security", "Balcony"],
    agentName: "Sarah Al-Mansouri",
    agentPhone: "+971 50 123 4567"
  },
  {
    id: "2",
    title: "Modern City Center Apartment",
    location: "Downtown, Abu Dhabi",
    price: 6200,
    currency: "AED",
    bedrooms: 1,
    bathrooms: 1,
    area: 85,
    type: "Apartment",
    image: apartment2,
    featured: false,
    description: "Contemporary apartment in the heart of the city with easy access to metro.",
    amenities: ["Gym", "Parking", "Metro Access", "Shopping Mall"],
    agentName: "Ahmed Hassan",
    agentPhone: "+971 55 987 6543"
  },
  {
    id: "3",
    title: "Elegant Garden Apartment",
    location: "Al Barsha, Dubai",
    price: 7200,
    currency: "AED",
    bedrooms: 3,
    bathrooms: 2,
    area: 140,
    type: "Apartment",
    image: apartment3,
    featured: true,
    description: "Spacious apartment with private garden access and family-friendly community.",
    amenities: ["Garden", "Pool", "Playground", "Parking", "Security"],
    agentName: "Fatima Al-Zahra",
    agentPhone: "+971 52 456 7890"
  },
  {
    id: "4",
    title: "Contemporary Studio Apartment",
    location: "Business Bay, Dubai",
    price: 4800,
    currency: "AED",
    bedrooms: 0,
    bathrooms: 1,
    area: 55,
    type: "Studio",
    image: apartment4,
    featured: false,
    description: "Perfect studio for young professionals with modern amenities and great location.",
    amenities: ["Pool", "Gym", "Metro", "Parking"],
    agentName: "Omar Al-Rashid",
    agentPhone: "+971 56 234 5678"
  },
  {
    id: "5",
    title: "Luxury Penthouse Suite",
    location: "Jumeirah Beach, Dubai",
    price: 15000,
    currency: "AED",
    bedrooms: 4,
    bathrooms: 3,
    area: 250,
    type: "Penthouse",
    image: apartment5,
    featured: true,
    description: "Exclusive penthouse with private terrace and breathtaking beach views.",
    amenities: ["Beach Access", "Private Terrace", "Pool", "Gym", "Concierge"],
    agentName: "Layla Abdulla",
    agentPhone: "+971 50 876 5432"
  },
  {
    id: "6",
    title: "Cozy Family Apartment",
    location: "Al Ain, UAE",
    price: 3500,
    currency: "AED",
    bedrooms: 2,
    bathrooms: 1,
    area: 95,
    type: "Apartment",
    image: apartment6,
    featured: false,
    description: "Affordable family apartment in quiet neighborhood with excellent schools nearby.",
    amenities: ["Parking", "Garden", "Schools", "Shopping"],
    agentName: "Khalid Al-Mansoori",
    agentPhone: "+971 55 345 6789"
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