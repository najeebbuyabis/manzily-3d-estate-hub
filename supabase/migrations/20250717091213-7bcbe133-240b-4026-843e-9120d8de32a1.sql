-- Create developers table for showcase pages
CREATE TABLE public.developers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  website_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;

-- Create policies for developers
CREATE POLICY "Developers are viewable by everyone" 
ON public.developers 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage developers" 
ON public.developers 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create developer_projects junction table
CREATE TABLE public.developer_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id UUID NOT NULL REFERENCES public.developers(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on developer_projects
ALTER TABLE public.developer_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Developer projects are viewable by everyone" 
ON public.developer_projects 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage developer projects" 
ON public.developer_projects 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_developers_updated_at
BEFORE UPDATE ON public.developers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();