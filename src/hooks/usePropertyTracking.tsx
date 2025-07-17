import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type PropertyEventType = 
  | 'property_view'
  | 'contact_agent_click'
  | 'saved_property'
  | 'visit_request'
  | 'whatsapp_launch'
  | 'deal_completion';

interface EventData {
  [key: string]: any;
}

export const usePropertyTracking = () => {
  const trackEvent = useCallback(async (
    propertyId: string,
    eventType: PropertyEventType,
    eventData?: EventData
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `https://hzoddyvygyumiarigfna.supabase.co/functions/v1/track-property-event`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            propertyId,
            eventType,
            eventData: eventData || {}
          })
        }
      );

      if (!response.ok) {
        console.warn('Failed to track event:', eventType, propertyId);
      }
    } catch (error) {
      console.warn('Error tracking event:', error);
    }
  }, []);

  // Convenience methods for specific event types
  const trackPropertyView = useCallback((propertyId: string) => {
    trackEvent(propertyId, 'property_view');
  }, [trackEvent]);

  const trackContactAgentClick = useCallback((propertyId: string, contactMethod: string) => {
    trackEvent(propertyId, 'contact_agent_click', { contact_method: contactMethod });
  }, [trackEvent]);

  const trackSavedProperty = useCallback((propertyId: string, action: 'save' | 'unsave') => {
    trackEvent(propertyId, 'saved_property', { action });
  }, [trackEvent]);

  const trackVisitRequest = useCallback((propertyId: string, visitData?: EventData) => {
    trackEvent(propertyId, 'visit_request', visitData);
  }, [trackEvent]);

  const trackWhatsAppLaunch = useCallback((propertyId: string, agentPhone?: string) => {
    trackEvent(propertyId, 'whatsapp_launch', { agent_phone: agentPhone });
  }, [trackEvent]);

  const trackDealCompletion = useCallback((propertyId: string, dealData?: EventData) => {
    trackEvent(propertyId, 'deal_completion', dealData);
  }, [trackEvent]);

  return {
    trackEvent,
    trackPropertyView,
    trackContactAgentClick,
    trackSavedProperty,
    trackVisitRequest,
    trackWhatsAppLaunch,
    trackDealCompletion,
  };
};