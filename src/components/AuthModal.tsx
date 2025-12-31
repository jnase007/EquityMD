import React, { useState, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { trackUserLogin } from '../lib/analytics';
import { X, LogIn, Sparkles } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  defaultType?: 'investor' | 'syndicator';
  defaultView?: 'sign_in' | 'sign_up';
}

export function AuthModal({ onClose, defaultType, defaultView = 'sign_in' }: AuthModalProps) {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const buttons = document.querySelectorAll('.supabase-auth-ui_ui-button');
    buttons.forEach((btn) => {
      if (btn.textContent?.toLowerCase().includes('linkedin')) {
        btn.classList.add('linkedin-btn');
      }
    });
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const user = session.user;
          
          // Check if this is an existing user
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
            // Existing user - track login and navigate to dashboard
            trackUserLogin(existingProfile.user_type, user.id);
            onClose();
            navigate('/dashboard');
          } else {
            // New user - automatically create investor profile
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([{
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || '',
                avatar_url: user.user_metadata?.avatar_url,
                user_type: 'investor', // Everyone starts as investor
                is_verified: true,
                is_admin: user.email === 'justin@brandastic.com',
              }]);

            if (profileError) {
              console.error('AuthModal: Error creating profile:', profileError);
              throw profileError;
            }

            // Create investor profile
            await supabase.from('investor_profiles').insert([{
              id: user.id,
              accredited_status: false
            }]);

            trackUserLogin('investor', user.id);
            onClose();
            navigate('/dashboard'); // Go straight to dashboard
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 text-white relative overflow-hidden">
          {/* Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          
          <div className="relative flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5" />
                <h2 className="text-xl font-bold">Welcome to EquityMD</h2>
              </div>
              <p className="text-blue-100 text-sm">
                Sign in to access exclusive real estate investments
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 transition-colors -mt-1 -mr-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}
          
          {/* Social Auth - Primary */}
          <div className="mb-4">
            <p className="text-center text-sm text-gray-500 mb-4">
              Continue with your preferred account
            </p>
          </div>
          
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
                    inputPadding: '12px 14px',
                    buttonPadding: '12px 14px',
                  },
                  fontSizes: {
                    baseInputSize: '15px',
                    baseButtonSize: '15px',
                  },
                  borderWidths: {
                    buttonBorderWidth: '0px',
                  },
                  radii: {
                    borderRadiusButton: '12px',
                    inputBorderRadius: '12px',
                  },
                },
              },
              style: {
                button: {
                  borderRadius: '12px',
                  height: '48px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '15px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                },
                input: {
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '15px',
                  border: '1px solid #e5e7eb',
                },
                label: {
                  fontSize: '14px',
                  marginBottom: '6px',
                  fontWeight: '500',
                },
                anchor: {
                  color: '#2563eb',
                  fontSize: '14px',
                },
                message: {
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                container: {
                  gap: '12px',
                },
                divider: {
                  margin: '20px 0',
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
                  email_label: 'Email address',
                  password_label: 'Password',
                  button_label: 'Sign in with email',
                  loading_button_label: 'Signing in...',
                  link_text: '',
                },
                sign_up: {
                  social_provider_text: 'Continue with {{provider}}',
                  email_label: 'Email address',
                  password_label: 'Create a Password',
                  button_label: 'Sign up with email',
                  loading_button_label: 'Signing up...',
                  link_text: '',
                },
              },
            }}
          />

          {/* Trust Badges */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                🔒 Secure
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                ✓ SEC Compliant
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                🏢 10K+ Investors
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
