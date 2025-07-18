import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: any | null;
  isAuthenticated: boolean;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  subscription: null,
  isAuthenticated: false,
  checkSubscription: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any | null>(null);

  const checkSubscription = async () => {
    if (!user) {
      setSubscription(null);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) {
        console.error('Subscription check error:', error);
        return;
      }
      
      setSubscription({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || 'free',
        subscription_end: data.subscription_end
      });
    } catch (error) {
      console.error('Subscription check failed:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check subscription when user logs in
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await checkSubscription();
          
          // Check for stored role selection and apply it
          const storedRole = localStorage.getItem('selectedRole');
          if (storedRole) {
            try {
              const { error } = await supabase
                .from("profiles")
                .update({ role: storedRole })
                .eq("user_id", session.user.id);
              
              if (!error) {
                localStorage.removeItem('selectedRole');
                console.log('Applied stored role:', storedRole);
              }
            } catch (error) {
              console.error('Error applying stored role:', error);
            }
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setSubscription(null);
      }
    });

    return () => authSubscription.unsubscribe();
  }, []);

  // Check subscription when user changes
  useEffect(() => {
    if (user && !loading) {
      checkSubscription();
    }
  }, [user, loading]);

  const value = {
    user,
    session,
    loading,
    subscription,
    isAuthenticated: !!user,
    checkSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};