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
            // New user from social login - create basic profile and redirect to onboarding
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([{
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                avatar_url: user.user_metadata?.avatar_url,
                user_type: 'investor', // Default for social login
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

            onClose();
            navigate('/profile'); // Navigate to complete profile
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start md:items-center justify-center z-50 pt-4 md:pt-0 overflow-y-auto" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 my-4 md:my-0 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LogIn className="h-6 w-6" />
                <h2 className="text-xl font-bold">Welcome Back</h2>
              </div>
              <p className="text-blue-100 text-sm">Sign in to access your account</p>
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
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm">
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
                },
              },
              style: {
                button: {
                  borderRadius: '0.75rem',
                  height: '44px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '500',
                },
                input: {
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem',
                },
                anchor: {
                  color: '#2563eb',
                },
                message: {
                  borderRadius: '0.75rem',
                },
                container: {
                  gap: '1rem',
                },
                divider: {
                  margin: '1.5rem 0',
                },
              },
            }}
            providers={['google', 'facebook', 'linkedin_oidc']}
            onlyThirdPartyProviders={false}
            redirectTo={`${window.location.origin}/dashboard`}
            view="sign_in"
            socialLayout="horizontal"
            localization={{
              variables: {
                sign_in: {
                  social_provider_text: 'Continue with',
                  email_label: 'Email address',
                  password_label: 'Password',
                  button_label: 'Sign in',
                  loading_button_label: 'Signing in...',
                  link_text: '',
                },
                sign_up: {
                  social_provider_text: 'Sign up with',
                  email_label: 'Email address',
                  password_label: 'Create a Password',
                  button_label: 'Sign up',
                  loading_button_label: 'Signing up...',
                  link_text: '',
                },
              },
            }}
          />

          {/* Sign Up CTA */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-3">New to EquityMD?</p>
              <button
                onClick={handleSignUpClick}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20"
              >
                <UserPlus className="h-5 w-5" />
                Create an Account
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
