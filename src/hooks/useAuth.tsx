import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Add debugging to catch React dispatcher issues
if (typeof React === 'undefined') {
  console.error('React is undefined - this could cause hook dispatcher issues');
}

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
  // Ensure all hooks are called at the top level and unconditionally
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any | null>(null);

  const checkSubscription = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check subscription when user logs in
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          // Defer subscription check to prevent potential deadlocks
          setTimeout(() => {
            if (mounted) {
              checkSubscription();
            }
          }, 0);
          
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
        if (mounted) {
          setSubscription(null);
        }
      }
    });

    return () => {
      mounted = false;
      authSubscription.unsubscribe();
    };
  }, [checkSubscription]);

  // Check subscription when user changes
  useEffect(() => {
    if (user && !loading) {
      checkSubscription();
    }
  }, [user, loading, checkSubscription]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    subscription,
    isAuthenticated: !!user,
    checkSubscription,
  }), [user, session, loading, subscription, checkSubscription]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};