import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Send, Building2, User, Upload, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PropertyData {
  propertyType: string;
  listingType: string;
  location: string;
  price: string;
  size: string;
  sizeUnit: string;
  bedrooms: string;
  bathrooms: string;
  features: string[];
  images: string[];
  tourLink: string;
  contactInfo: string;
  whatsappNumber: string;
  civilNumber: string;
}

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

const PropertyIntakeAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [propertyData, setPropertyData] = useState<Partial<PropertyData>>({
    features: [],
    images: []
  });
  const [currentInput, setCurrentInput] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const steps = [
    {
      question: "What type of property are you listing?",
      type: "select",
      options: ["Apartment", "Villa", "House", "Farm", "Land", "Land Exchange", "Chalet", "Commercial"],
      key: "propertyType"
    },
    {
      question: "Is this property for rent or sale?",
      type: "select",
      options: ["Rent", "Sale"],
      key: "listingType"
    },
    {
      question: "What's the location? (Area + Block or Street name)",
      type: "text",
      key: "location"
    },
    {
      question: "What's the price? (Enter amount only, currency will be KWD)",
      type: "number",
      key: "price"
    },
    {
      question: "What's the size of the property?",
      type: "size",
      key: "size"
    },
    {
      question: "How many bedrooms?",
      type: "number",
      key: "bedrooms"
    },
    {
      question: "How many bathrooms?",
      type: "number",
      key: "bathrooms"
    },
    {
      question: "Select additional features:",
      type: "features",
      key: "features"
    },
    {
      question: "Add image URLs or upload images (optional):",
      type: "images",
      key: "images"
    },
    {
      question: "3D tour link (optional):",
      type: "text",
      key: "tourLink"
    },
    {
      question: "Contact information or agent name:",
      type: "text",
      key: "contactInfo"
    },
    {
      question: "WhatsApp number (optional):",
      type: "text",
      key: "whatsappNumber"
    },
    {
      question: "Civil number of the property (optional, for exclusivity):",
      type: "text",
      key: "civilNumber"
    }
  ];

  const availableFeatures = [
    "Garden", "Elevator", "Parking", "Pool", "Gym", "Security", 
    "Sea View", "Balcony", "Furnished", "Central AC", "Maid Room", 
    "Storage Room", "Basement", "Roof Access", "Pet Friendly"
  ];

  const addMessage = (content: string, type: 'bot' | 'user') => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleNext = (value?: string) => {
    const currentStepData = steps[currentStep];
    
    if (currentStepData.type === 'features') {
      setPropertyData(prev => ({ ...prev, features: selectedFeatures }));
      addMessage(`Selected features: ${selectedFeatures.join(', ') || 'None'}`, 'user');
    } else if (currentStepData.type === 'size') {
      const sizeValue = currentInput.split(' ')[0];
      const unit = propertyData.sizeUnit || 'm²';
      setPropertyData(prev => ({ 
        ...prev, 
        size: sizeValue,
        sizeUnit: unit
      }));
      addMessage(`${sizeValue} ${unit}`, 'user');
    } else if (value || currentInput) {
      const inputValue = value || currentInput;
      setPropertyData(prev => ({ ...prev, [currentStepData.key]: inputValue }));
      addMessage(inputValue, 'user');
    }

    if (currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        addMessage(steps[currentStep + 1].question, 'bot');
      }, 500);
    } else {
      setTimeout(() => {
        showSummary();
      }, 500);
    }
    
    setCurrentInput('');
  };

  const showSummary = () => {
    const summary = `
Property Listing Summary:

• Type: ${propertyData.propertyType}
• Listing: For ${propertyData.listingType}
• Location: ${propertyData.location}
• Price: ${propertyData.price} KWD
• Size: ${propertyData.size} ${propertyData.sizeUnit}
• Bedrooms: ${propertyData.bedrooms}
• Bathrooms: ${propertyData.bathrooms}
• Features: ${propertyData.features?.join(', ') || 'None'}
• Contact: ${propertyData.contactInfo}
${propertyData.whatsappNumber ? `• WhatsApp: ${propertyData.whatsappNumber}` : ''}
${propertyData.civilNumber ? `• Civil Number: ${propertyData.civilNumber}` : ''}

Perfect! I've collected all the information. Do you want to feature this listing or publish it now?
    `;
    
    addMessage(summary, 'bot');
    setIsComplete(true);
  };

  const saveListing = async (status: 'draft' | 'published' | 'featured') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save listings",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('properties')
        .insert({
          agent_id: user.id,
          property_type: propertyData.propertyType,
          listing_type: propertyData.listingType?.toLowerCase(),
          location: propertyData.location,
          price: parseFloat(propertyData.price || '0'),
          size: parseFloat(propertyData.size || '0'),
          size_unit: propertyData.sizeUnit || 'm²',
          bedrooms: parseInt(propertyData.bedrooms || '0'),
          bathrooms: parseInt(propertyData.bathrooms || '0'),
          features: propertyData.features || [],
          images: propertyData.images || [],
          tour_link: propertyData.tourLink,
          contact_info: propertyData.contactInfo,
          whatsapp_number: propertyData.whatsappNumber,
          civil_number: propertyData.civilNumber,
          status: status
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Property listing ${status === 'draft' ? 'saved as draft' : status === 'featured' ? 'featured' : 'published'} successfully`,
      });

      addMessage(`Great! Your property listing has been ${status === 'draft' ? 'saved as draft' : status === 'featured' ? 'featured' : 'published'}. You can manage your listings from the agent dashboard.`, 'bot');
      
      // Reset for new listing
      setTimeout(() => {
        resetAssistant();
      }, 3000);

    } catch (error) {
      console.error('Error saving listing:', error);
      toast({
        title: "Error",
        description: "Failed to save listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetAssistant = () => {
    setMessages([]);
    setCurrentStep(0);
    setPropertyData({ features: [], images: [] });
    setSelectedFeatures([]);
    setIsComplete(false);
    setCurrentInput('');
    addMessage(steps[0].question, 'bot');
  };

  const startAssistant = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      addMessage("Hello! I'm here to help you add a new property listing. Let's start with some basic information.", 'bot');
      setTimeout(() => {
        addMessage(steps[0].question, 'bot');
      }, 1000);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderInput = () => {
    const currentStepData = steps[currentStep];
    
    if (isComplete) {
      return (
        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <Button 
              onClick={() => saveListing('featured')} 
              disabled={isSaving}
              className="flex-1 bg-gradient-primary"
            >
              Feature Listing
            </Button>
            <Button 
              onClick={() => saveListing('published')} 
              disabled={isSaving}
              variant="outline"
              className="flex-1"
            >
              Publish Now
            </Button>
          </div>
          <Button 
            onClick={() => saveListing('draft')} 
            disabled={isSaving}
            variant="ghost"
            className="w-full"
          >
            Save as Draft
          </Button>
        </div>
      );
    }

    switch (currentStepData.type) {
      case 'select':
        return (
          <Select onValueChange={handleNext}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {currentStepData.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'features':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {availableFeatures.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature}
                    checked={selectedFeatures.includes(feature)}
                    onCheckedChange={() => handleFeatureToggle(feature)}
                  />
                  <label htmlFor={feature} className="text-sm">
                    {feature}
                  </label>
                </div>
              ))}
            </div>
            <Button onClick={() => handleNext()} className="w-full">
              Continue
            </Button>
          </div>
        );

      case 'size':
        return (
          <div className="flex space-x-2">
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Enter size..."
              className="flex-1"
              type="number"
            />
            <Select 
              value={propertyData.sizeUnit || 'm²'} 
              onValueChange={(value) => setPropertyData(prev => ({ ...prev, sizeUnit: value }))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="m²">m²</SelectItem>
                <SelectItem value="ft²">ft²</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => handleNext()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        );

      case 'images':
        return (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Image URL (optional)..."
                className="flex-1"
              />
              <Button 
                onClick={() => {
                  if (currentInput) {
                    setPropertyData(prev => ({
                      ...prev,
                      images: [...(prev.images || []), currentInput]
                    }));
                    setCurrentInput('');
                  }
                }}
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {propertyData.images && propertyData.images.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {propertyData.images.length} image(s) added
              </div>
            )}
            <Button onClick={() => handleNext()} className="w-full">
              Continue
            </Button>
          </div>
        );

      default:
        return (
          <div className="flex space-x-2">
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type your answer..."
              onKeyPress={(e) => e.key === 'Enter' && handleNext()}
              className="flex-1"
              type={currentStepData.type === 'number' ? 'number' : 'text'}
            />
            <Button onClick={() => handleNext()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        );
    }
  };

  return (
    <>
      {/* Agent Assistant Button */}
      {!isOpen && (
        <Button
          onClick={startAssistant}
          className="fixed bottom-20 right-6 rounded-full w-14 h-14 bg-secondary hover:bg-secondary/90 shadow-lg z-50"
          size="icon"
        >
          <Building2 className="h-6 w-6" />
        </Button>
      )}

      {/* Assistant Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-secondary" />
              <CardTitle className="text-lg">Property Intake Assistant</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-4 space-y-4">
            {/* Messages */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === 'bot' && <Building2 className="h-4 w-4 mt-0.5 text-secondary" />}
                        {message.type === 'user' && <User className="h-4 w-4 mt-0.5" />}
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            {renderInput()}

            {/* Progress indicator */}
            {!isComplete && (
              <div className="flex justify-center">
                <Badge variant="secondary">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default PropertyIntakeAssistant;