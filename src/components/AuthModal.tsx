import React, { useState, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { trackUserLogin } from '../lib/analytics';
import { X, LogIn, UserPlus, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  defaultType?: 'investor' | 'syndicator';
  defaultView?: 'sign_in' | 'sign_up';
}

export function AuthModal({ onClose, defaultType, defaultView = 'sign_in' }: AuthModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(defaultView === 'sign_up');
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
            // Existing user - track login and navigate
            trackUserLogin(existingProfile.user_type, user.id);
            onClose();
            navigate('/dashboard');
          } else {
            // New user from social login - create basic profile and redirect to welcome onboarding
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([{
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || '',
                avatar_url: user.user_metadata?.avatar_url,
                user_type: 'investor', // Will be updated in onboarding
                is_verified: false,
                is_admin: user.email === 'justin@brandastic.com',
              }]);

            if (profileError) {
              console.error('AuthModal: Error creating profile:', profileError);
              throw profileError;
            }

            // Create investor profile placeholder
            await supabase.from('investor_profiles').insert([{
              id: user.id,
              accredited_status: false
            }]);

            onClose();
            navigate('/welcome'); // Navigate to welcome onboarding
          }
        } catch (error) {
          console.error('AuthModal: Error in auth state change handler:', error);
          setError(error instanceof Error ? error.message : 'An error occurred during sign in');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [onClose, navigate]);

  const handleSignUpClick = () => {
    onClose();
    navigate('/signup/start');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 py-4 text-white ${
          defaultView === 'sign_up' 
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-700'
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {defaultView === 'sign_up' ? (
                <>
                  <UserPlus className="h-5 w-5" />
                  <h2 className="text-lg font-bold">Get Started</h2>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <h2 className="text-lg font-bold">Welcome Back</h2>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {error && (
            <div className="mb-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
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
                    inputPadding: '10px 12px',
                    buttonPadding: '10px 12px',
                  },
                  fontSizes: {
                    baseInputSize: '14px',
                    baseButtonSize: '14px',
                  },
                },
              },
              style: {
                button: {
                  borderRadius: '0.5rem',
                  height: '40px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '500',
                  fontSize: '14px',
                },
                input: {
                  borderRadius: '0.5rem',
                  padding: '10px 12px',
                  fontSize: '14px',
                },
                label: {
                  fontSize: '13px',
                  marginBottom: '4px',
                },
                anchor: {
                  color: '#2563eb',
                  fontSize: '13px',
                },
                message: {
                  borderRadius: '0.5rem',
                  fontSize: '13px',
                },
                container: {
                  gap: '0.75rem',
                },
                divider: {
                  margin: '1rem 0',
                },
              },
            }}
            providers={['google', 'facebook', 'linkedin_oidc']}
            onlyThirdPartyProviders={false}
            redirectTo={`${window.location.origin}/dashboard`}
            view={defaultView === 'sign_up' ? 'sign_up' : 'sign_in'}
            socialLayout="horizontal"
            localization={{
              variables: {
                sign_in: {
                  social_provider_text: '',
                  email_label: 'Email address',
                  password_label: 'Password',
                  button_label: 'Sign in',
                  loading_button_label: 'Signing in...',
                  link_text: '',
                },
                sign_up: {
                  social_provider_text: '',
                  email_label: 'Email address',
                  password_label: 'Create a Password',
                  button_label: 'Sign up',
                  loading_button_label: 'Signing up...',
                  link_text: '',
                },
              },
            }}
          />

          {/* Bottom CTA - show opposite action */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              {defaultView === 'sign_up' ? (
                <>
                  <p className="text-gray-600 text-sm mb-2">Already have an account?</p>
                  <button
                    onClick={onClose}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Sign in instead
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-600 text-sm mb-2">New to EquityMD?</p>
                  <button
                    onClick={handleSignUpClick}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all text-sm"
                  >
                    <UserPlus className="h-4 w-4" />
                    Create an Account
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
