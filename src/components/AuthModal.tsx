import React, { useState, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { trackUserLogin } from '../lib/analytics';
import { X, Sparkles } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  defaultType?: 'investor' | 'syndicator';
  defaultView?: 'sign_in' | 'sign_up';
}

export function AuthModal({ onClose, defaultType, defaultView = 'sign_in' }: AuthModalProps) {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fix LinkedIn button text display using MutationObserver
  useEffect(() => {
    const fixLinkedInButton = () => {
      // Find all buttons and fix linkedin_oidc text
      document.querySelectorAll('button').forEach((btn) => {
        // Walk through all text nodes and replace linkedin_oidc
        const walker = document.createTreeWalker(btn, NodeFilter.SHOW_TEXT, null);
        let node;
        while ((node = walker.nextNode())) {
          if (node.textContent?.includes('linkedin_oidc')) {
            node.textContent = node.textContent.replace('linkedin_oidc', 'LinkedIn');
          }
        }
      });
    };
    
    // Run immediately
    fixLinkedInButton();
    
    // Set up MutationObserver to watch for Supabase Auth UI rendering
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        fixLinkedInButton();
      });
    });
    
    // Observe the modal content for changes
    const modalContent = document.querySelector('.bg-white.rounded-xl');
    if (modalContent) {
      observer.observe(modalContent, { 
        childList: true, 
        subtree: true,
        characterData: true 
      });
    }
    
    // Also run on intervals for safety
    const intervals = [100, 300, 600, 1000, 2000];
    const timers = intervals.map(ms => setTimeout(fixLinkedInButton, ms));
    
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const user = session.user;
          
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileCheckError && profileCheckError.code !== 'PGRST116') {
            console.error('AuthModal: Error checking existing profile:', profileCheckError);
            throw profileCheckError;
          }

          if (existingProfile) {
            trackUserLogin(existingProfile.user_type, user.id);
            onClose();
            navigate('/dashboard');
          } else {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([{
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || '',
                avatar_url: user.user_metadata?.avatar_url,
                user_type: 'investor',
                is_verified: true,
                is_admin: user.email === 'justin@brandastic.com',
              }]);

            if (profileError) {
              console.error('AuthModal: Error creating profile:', profileError);
              throw profileError;
            }

            await supabase.from('investor_profiles').insert([{
              id: user.id,
              accredited_status: false
            }]);

            trackUserLogin('investor', user.id);
            onClose();
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('AuthModal: Error in auth state change handler:', error);
          setError(error instanceof Error ? error.message : 'An error occurred during sign in');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [onClose, navigate]);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-xs max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 text-white sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <h2 className="text-base font-bold">Welcome to EquityMD</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-0.5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="mb-3 p-2 bg-red-50 text-red-700 rounded-lg text-xs">
              {error}
            </div>
          )}
          
          <p className="text-center text-xs text-gray-500 mb-3">
            Continue with your preferred account
          </p>
          
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  },
                  space: {
                    inputPadding: '8px 10px',
                    buttonPadding: '8px 10px',
                  },
                  fontSizes: {
                    baseInputSize: '13px',
                    baseButtonSize: '13px',
                  },
                  borderWidths: {
                    buttonBorderWidth: '0px',
                  },
                  radii: {
                    borderRadiusButton: '8px',
                    inputBorderRadius: '8px',
                  },
                },
              },
              style: {
                button: {
                  borderRadius: '8px',
                  height: '36px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '500',
                  fontSize: '13px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                },
                input: {
                  borderRadius: '8px',
                  padding: '8px 10px',
                  fontSize: '13px',
                  border: '1px solid #e5e7eb',
                  height: '36px',
                },
                label: {
                  fontSize: '12px',
                  marginBottom: '4px',
                  fontWeight: '500',
                },
                anchor: {
                  color: '#2563eb',
                  fontSize: '12px',
                },
                message: {
                  borderRadius: '8px',
                  fontSize: '12px',
                  padding: '8px',
                },
                container: {
                  gap: '8px',
                },
                divider: {
                  margin: '12px 0',
                },
              },
            }}
            providers={['google', 'facebook', 'linkedin_oidc']}
            onlyThirdPartyProviders={false}
            redirectTo={`${window.location.origin}/dashboard`}
            view="sign_in"
            socialLayout="vertical"
            localization={{
              variables: {
                sign_in: {
                  social_provider_text: 'Continue with {{provider}}',
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Sign in',
                  loading_button_label: 'Signing in...',
                  link_text: '',
                },
                sign_up: {
                  social_provider_text: 'Continue with {{provider}}',
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Sign up',
                  loading_button_label: 'Signing up...',
                  link_text: '',
                },
              },
            }}
          />

          {/* Compact Trust Badges */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400">
              <span>🔒 Secure</span>
              <span>•</span>
              <span>✓ SEC Compliant</span>
              <span>•</span>
              <span>🏢 10K+ Investors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
