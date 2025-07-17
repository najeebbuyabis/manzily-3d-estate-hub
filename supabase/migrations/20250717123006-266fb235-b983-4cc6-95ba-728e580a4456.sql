-- Create properties table for real estate listings
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL,
  property_type TEXT NOT NULL,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('rent', 'sale')),
  location TEXT NOT NULL,
  price NUMERIC NOT NULL,
  size NUMERIC NOT NULL,
  size_unit TEXT NOT NULL DEFAULT 'm²' CHECK (size_unit IN ('m²', 'ft²')),
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  features TEXT[],
  images TEXT[],
  tour_link TEXT,
  contact_info TEXT,
  whatsapp_number TEXT,
  civil_number TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'featured')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create policies for agent access
CREATE POLICY "Agents can view all properties" 
ON public.properties 
FOR SELECT 
USING (true);

CREATE POLICY "Agents can create their own properties" 
ON public.properties 
FOR INSERT 
WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update their own properties" 
ON public.properties 
FOR UPDATE 
USING (auth.uid() = agent_id);

CREATE POLICY "Agents can delete their own properties" 
ON public.properties 
FOR DELETE 
USING (auth.uid() = agent_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();