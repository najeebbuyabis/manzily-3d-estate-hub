import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserCredits {
  credits_remaining: number;
  total_credits: number;
  last_free_ad_date: string | null;
}

export const useUserCredits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserCredits();
    } else {
      setUserCredits(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserCredits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no credits record exists, create one with 1 free credit
      if (!data) {
        const { data: newCredits, error: insertError } = await supabase
          .from('user_credits')
          .insert({
            user_id: user?.id,
            credits_remaining: 1,
            total_credits: 1
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setUserCredits(newCredits);
      } else {
        setUserCredits(data);
      }
    } catch (error) {
      console.error('Error fetching user credits:', error);
      toast({
        title: "Error",
        description: "Failed to load user credits",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canPostFreeAd = (): boolean => {
    if (!userCredits?.last_free_ad_date) return true;
    
    const lastAdDate = new Date(userCredits.last_free_ad_date);
    const now = new Date();
    const daysSinceLastAd = (now.getTime() - lastAdDate.getTime()) / (1000 * 3600 * 24);
    
    return daysSinceLastAd >= 30; // Allow one free ad per month
  };

  const useCredit = async (): Promise<boolean> => {
    if (!user || !userCredits) return false;

    // Check if user can post a free ad this month
    if (canPostFreeAd()) {
      try {
        const { error } = await supabase
          .from('user_credits')
          .update({
            last_free_ad_date: new Date().toISOString().split('T')[0]
          })
          .eq('user_id', user.id);

        if (error) throw error;
        await fetchUserCredits(); // Refresh credits
        return true;
      } catch (error) {
        console.error('Error updating free ad date:', error);
        return false;
      }
    }

    // Use a paid credit
    if (userCredits.credits_remaining > 0) {
      try {
        const { error } = await supabase
          .from('user_credits')
          .update({
            credits_remaining: userCredits.credits_remaining - 1
          })
          .eq('user_id', user.id);

        if (error) throw error;
        await fetchUserCredits(); // Refresh credits
        return true;
      } catch (error) {
        console.error('Error using credit:', error);
        return false;
      }
    }

    return false; // No credits available
  };

  const addCredits = async (creditsToAdd: number): Promise<boolean> => {
    if (!user || !userCredits) return false;

    try {
      const { error } = await supabase
        .from('user_credits')
        .update({
          credits_remaining: userCredits.credits_remaining + creditsToAdd,
          total_credits: userCredits.total_credits + creditsToAdd
        })
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchUserCredits(); // Refresh credits
      return true;
    } catch (error) {
      console.error('Error adding credits:', error);
      return false;
    }
  };

  const hasCreditsOrFreeAd = (): boolean => {
    if (!userCredits) return false;
    return userCredits.credits_remaining > 0 || canPostFreeAd();
  };

  return {
    userCredits,
    loading,
    fetchUserCredits,
    canPostFreeAd,
    useCredit,
    addCredits,
    hasCreditsOrFreeAd
  };
};