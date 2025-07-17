import React, { useState, useEffect, useRef } from 'react';
import { Shield, X, Send, CheckCircle, XCircle, AlertTriangle, Eye, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';

interface Property {
  id: string;
  property_type: string;
  listing_type: string;
  location: string;
  price: number;
  size: number;
  size_unit: string;
  bedrooms: number;
  bathrooms: number;
  features: string[];
  images: string[];
  tour_link: string;
  contact_info: string;
  whatsapp_number: string;
  civil_number: string;
  status: string;
  moderation_status: string;
  moderation_notes: string;
  created_at: string;
  agent_id: string;
}

interface ModerationResult {
  status: 'approve' | 'reject' | 'needs_review';
  notes: string[];
  missing_fields: string[];
  warnings: string[];
  auto_message?: string;
}

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

const AdminModerationAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { profile, isAuthenticated } = useUserProfile();

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (isAdmin && isOpen) {
      fetchPendingProperties();
    }
  }, [isAdmin, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchPendingProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPendingProperties(data || []);
    } catch (error) {
      console.error('Error fetching pending properties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending properties",
        variant: "destructive"
      });
    }
  };

  const addMessage = (content: string, type: 'bot' | 'user') => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const analyzeProperty = async (property: Property) => {
    setIsAnalyzing(true);
    setSelectedProperty(property);
    
    addMessage(`Analyzing property: ${property.property_type} in ${property.location}`, 'bot');

    const analysis: ModerationResult = {
      status: 'approve',
      notes: [],
      missing_fields: [],
      warnings: []
    };

    // Check required fields
    const requiredFields = [
      { field: 'property_type', label: 'Property Type', value: property.property_type },
      { field: 'price', label: 'Price', value: property.price },
      { field: 'size', label: 'Size', value: property.size },
      { field: 'location', label: 'Location', value: property.location },
      { field: 'contact_info', label: 'Contact Info', value: property.contact_info }
    ];

    requiredFields.forEach(({ field, label, value }) => {
      if (!value || value === 0) {
        analysis.missing_fields.push(label);
        analysis.status = 'needs_review';
      }
    });

    // Check images
    if (!property.images || property.images.length === 0) {
      analysis.missing_fields.push('Property Images');
      analysis.status = 'needs_review';
    }

    // Check for duplicate civil number
    if (property.civil_number) {
      try {
        const { data: duplicateCheck } = await supabase
          .rpc('check_duplicate_civil_number', {
            civil_num: property.civil_number,
            property_id: property.id
          });

        if (duplicateCheck && duplicateCheck[0]?.duplicate_count > 0) {
          analysis.warnings.push(`Civil number ${property.civil_number} is already used by ${duplicateCheck[0].duplicate_count} other property(ies)`);
          analysis.status = 'needs_review';
        }
      } catch (error) {
        console.error('Error checking duplicates:', error);
      }
    }

    // Price validation (simple check - could be enhanced with area averages)
    if (property.price > 0) {
      const pricePerSqm = property.price / property.size;
      if (pricePerSqm > 1000) { // KWD per sqm - adjust threshold as needed
        analysis.warnings.push(`High price per square meter: ${pricePerSqm.toFixed(2)} KWD/m²`);
      }
      if (pricePerSqm < 50) {
        analysis.warnings.push(`Low price per square meter: ${pricePerSqm.toFixed(2)} KWD/m² - please verify`);
      }
    }

    // Generate auto-message if needed
    if (analysis.missing_fields.length > 0) {
      analysis.auto_message = `Dear Agent,

Your property listing "${property.property_type} in ${property.location}" requires additional information before it can be approved:

Missing Information:
${analysis.missing_fields.map(field => `• ${field}`).join('\n')}

Please update your listing with the missing information and resubmit for review.

Best regards,
Manzily Moderation Team`;
    }

    setModerationResult(analysis);
    setIsAnalyzing(false);

    // Display analysis results
    const resultMessage = `
Analysis Complete:

Status: ${analysis.status.toUpperCase()}
${analysis.missing_fields.length > 0 ? `\nMissing Fields: ${analysis.missing_fields.join(', ')}` : ''}
${analysis.warnings.length > 0 ? `\nWarnings: ${analysis.warnings.join('; ')}` : ''}

${analysis.status === 'approve' ? '✅ Ready for approval' : 
  analysis.status === 'needs_review' ? '⚠️ Needs review before approval' : 
  '❌ Should be rejected'}
    `;

    addMessage(resultMessage, 'bot');
  };

  const handleModeration = async (action: 'approve' | 'reject' | 'needs_review', message?: string) => {
    if (!selectedProperty || !profile) return;

    try {
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          moderation_status: action,
          moderation_notes: moderationResult?.notes.join('; ') || '',
          moderated_by: profile.user_id,
          moderated_at: new Date().toISOString()
        })
        .eq('id', selectedProperty.id);

      if (updateError) throw updateError;

      // Send message to agent if provided
      if (message || moderationResult?.auto_message) {
        const { error: messageError } = await supabase
          .from('property_moderation_messages')
          .insert({
            property_id: selectedProperty.id,
            admin_id: profile.user_id,
            agent_id: selectedProperty.agent_id,
            message: message || moderationResult?.auto_message || '',
            message_type: action === 'approve' ? 'approval_note' : 
                         action === 'reject' ? 'rejection_reason' : 'info_request'
          });

        if (messageError) throw messageError;
      }

      toast({
        title: "Success!",
        description: `Property ${action}d successfully`,
      });

      addMessage(`Property ${action}d and agent notified.`, 'bot');
      
      // Refresh pending properties
      await fetchPendingProperties();
      setSelectedProperty(null);
      setModerationResult(null);

    } catch (error) {
      console.error('Error during moderation:', error);
      toast({
        title: "Error",
        description: "Failed to process moderation action",
        variant: "destructive"
      });
    }
  };

  const startAssistant = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      addMessage("Hello Admin! I'm here to help you moderate property listings. Let me check for pending properties...", 'bot');
      setTimeout(() => {
        if (pendingProperties.length > 0) {
          addMessage(`Found ${pendingProperties.length} properties awaiting moderation. Select a property to analyze.`, 'bot');
        } else {
          addMessage("No properties currently pending moderation. Great job keeping up!", 'bot');
        }
      }, 1000);
    }
  };

  // Only show for admin users
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <>
      {/* Admin Assistant Button */}
      {!isOpen && (
        <Button
          onClick={startAssistant}
          className="fixed bottom-36 right-6 rounded-full w-14 h-14 bg-destructive hover:bg-destructive/90 shadow-lg z-50"
          size="icon"
        >
          <Shield className="h-6 w-6" />
        </Button>
      )}

      {/* Assistant Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[500px] h-[700px] shadow-xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-destructive" />
              <CardTitle className="text-lg">Admin Moderation Assistant</CardTitle>
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
            {/* Pending Properties List */}
            {!selectedProperty && (
              <div className="space-y-2">
                <h3 className="font-semibold">Pending Properties ({pendingProperties.length})</h3>
                <ScrollArea className="h-40">
                  {pendingProperties.map((property) => (
                    <div
                      key={property.id}
                      className="p-2 border rounded cursor-pointer hover:bg-muted"
                      onClick={() => analyzeProperty(property)}
                    >
                      <div className="font-medium">{property.property_type} - {property.location}</div>
                      <div className="text-sm text-muted-foreground">
                        {property.price} KWD • {property.size} {property.size_unit}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}

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
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === 'bot' && <Shield className="h-4 w-4 mt-0.5 text-destructive" />}
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isAnalyzing && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 animate-pulse text-destructive" />
                        <p className="text-sm">Analyzing property...</p>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Moderation Actions */}
            {moderationResult && selectedProperty && (
              <div className="space-y-3 border-t pt-3">
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleModeration('approve')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleModeration('needs_review', moderationResult.auto_message)}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Request Info
                  </Button>
                  <Button
                    onClick={() => handleModeration('reject')}
                    variant="destructive"
                    className="flex-1"
                    size="sm"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
                
                <Textarea
                  placeholder="Custom message to agent (optional)"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="text-sm"
                  rows={2}
                />
                
                {customMessage && (
                  <Button
                    onClick={() => handleModeration('needs_review', customMessage)}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Send Custom Message
                  </Button>
                )}
                
                <Button
                  onClick={() => {
                    setSelectedProperty(null);
                    setModerationResult(null);
                    setCustomMessage('');
                  }}
                  variant="ghost"
                  className="w-full"
                  size="sm"
                >
                  Back to List
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AdminModerationAssistant;