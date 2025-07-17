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
    location: "Salmiya, Kuwait City",
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