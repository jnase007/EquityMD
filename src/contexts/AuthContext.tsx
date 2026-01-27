import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    console.log('AuthContext: Manually refreshing session...');
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('AuthContext: Refresh error:', error.message);
      } else {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        console.log('AuthContext: Session refreshed successfully');
      }
    } catch (err) {
      console.error('AuthContext: Refresh failed:', err);
    }
  }, []);

  useEffect(() => {
    // Initial session load
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('AuthContext: Initial session error:', error.message);
        }
        setSession(session);
        console.log('AuthContext: Initial session loaded:', session?.user?.id ? 'authenticated' : 'no session');
      } catch (err) {
        console.error('AuthContext: Init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Global auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthContext: Auth event:', event);
        setSession(session);

        if (event === 'TOKEN_REFRESHED') {
          console.log('AuthContext: Token refreshed successfully');
        }
        if (event === 'SIGNED_OUT') {
          console.log('AuthContext: User signed out');
        }
      }
    );

    // Resume from background/tab switch recovery
    const handleResume = async () => {
      if (document.visibilityState !== 'visible') return;

      console.log('AuthContext: Tab resumed — checking session...');
      
      const tryRecover = async (attempt = 1): Promise<void> => {
        try {
          let { data: { session: currentSession } } = await supabase.auth.getSession();
          
          if (currentSession) {
            console.log('AuthContext: Session valid on attempt', attempt);
            setSession(currentSession);
            return;
          }

          console.log('AuthContext: Session null on resume — forcing refresh (attempt', attempt, ')');
          const { error } = await supabase.auth.refreshSession();
          
          if (error) {
            console.error('AuthContext: Refresh error:', error.message);
          }
          
          const retry = await supabase.auth.getSession();
          if (retry.data.session) {
            console.log('AuthContext: Session recovered on attempt', attempt);
            setSession(retry.data.session);
            return;
          }
          
          // Retry up to 3 times with delay
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return tryRecover(attempt + 1);
          }
          
          console.warn('AuthContext: Session recovery failed after', attempt, 'attempts');
        } catch (err) {
          console.error('AuthContext: Resume recovery error:', err);
        }
      };
      
      await tryRecover();
    };

    document.addEventListener('visibilitychange', handleResume);
    window.addEventListener('focus', handleResume);
    window.addEventListener('pageshow', handleResume);

    // Heartbeat: check session every 30 seconds when visible
    const heartbeatInterval = setInterval(async () => {
      if (document.visibilityState === 'visible' && session) {
        try {
          const { data } = await supabase.auth.getUser();
          if (!data.user) {
            console.log('AuthContext: Heartbeat detected no user — refreshing session');
            await supabase.auth.refreshSession();
          }
        } catch (err) {
          console.error('AuthContext: Heartbeat error:', err);
        }
      }
    }, 30 * 1000);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleResume);
      window.removeEventListener('focus', handleResume);
      window.removeEventListener('pageshow', handleResume);
      clearInterval(heartbeatInterval);
    };
  }, [session]);

  return (
    <AuthContext.Provider value={{ 
      session, 
      user: session?.user ?? null, 
      loading,
      refreshSession 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};
