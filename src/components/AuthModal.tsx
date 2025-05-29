import React, { useState, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { sendSignupEmails } from '../lib/emailService';
import { X, User, Building2 } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  defaultType?: 'investor' | 'syndicator';
  defaultView?: 'sign_in' | 'sign_up';
}

export function AuthModal({ onClose, defaultType, defaultView = 'sign_in' }: AuthModalProps) {
  const [userType, setUserType] = useState<'investor' | 'syndicator'>(defaultType || 'investor');
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
          console.log('AuthModal: User signed in:', user.id);
          console.log('AuthModal: User metadata:', user.user_metadata);
          console.log('AuthModal: App metadata:', user.app_metadata);
          
          // Check if this is a new user by looking for existing profile
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileCheckError && profileCheckError.code !== 'PGRST116') {
            console.error('AuthModal: Error checking existing profile:', profileCheckError);
            throw profileCheckError;
          }

          // If no existing profile, this is a new user - create profile automatically
          if (!existingProfile) {
            console.log('AuthModal: No existing profile found, creating new profile...');
            
            // For social users, default to investor unless specified
            // For email users, use the selected userType
            const finalUserType = user.app_metadata?.provider && user.app_metadata.provider !== 'email' 
              ? 'investor' // Default social users to investor
              : userType; // Use selected type for email users

            console.log('AuthModal: Creating profile with user type:', finalUserType);

            // Create profile
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: user.id,
                  email: user.email,
                  full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                  avatar_url: user.user_metadata?.avatar_url,
                  user_type: finalUserType,
                  is_verified: true // Auto-verify all users
                },
              ]);

            if (profileError) {
              console.error('AuthModal: Error creating profile:', profileError);
              throw profileError;
            }

            console.log('AuthModal: Profile created successfully');

            // Create type-specific profile
            if (finalUserType === 'investor') {
              console.log('AuthModal: Creating investor profile...');
              const { error: investorError } = await supabase
                .from('investor_profiles')
                .insert([{ 
                  id: user.id,
                  accredited_status: false,
                  investment_preferences: {},
                  preferred_property_types: [],
                  preferred_locations: []
                }]);
              
              if (investorError) {
                console.error('AuthModal: Error creating investor profile:', investorError);
                throw investorError;
              }
              console.log('AuthModal: Investor profile created successfully');
            } else {
              console.log('AuthModal: Creating syndicator profile...');
              const { error: syndicatorError } = await supabase
                .from('syndicator_profiles')
                .insert([{ 
                  id: user.id,
                  company_name: user.user_metadata?.full_name || 'My Company',
                  verification_documents: {}
                }]);
              
              if (syndicatorError) {
                console.error('AuthModal: Error creating syndicator profile:', syndicatorError);
                throw syndicatorError;
              }
              console.log('AuthModal: Syndicator profile created successfully');
            }

            // Send signup notification emails for new users
            try {
              await sendSignupEmails({
                userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New User',
                userEmail: user.email || '',
                userType: finalUserType
              });
            } catch (emailError) {
              console.error('Failed to send signup emails:', emailError);
              // Don't throw here - we don't want email failures to break signup
            }
          } else {
            console.log('AuthModal: Existing profile found:', existingProfile);
          }

          // Close modal and navigate to dashboard
          console.log('AuthModal: Closing modal and navigating to dashboard');
          onClose();
          navigate('/dashboard');
        } catch (error) {
          console.error('AuthModal: Error in auth state change handler:', error);
          setError(error instanceof Error ? error.message : 'An error occurred during sign in');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [userType, onClose, navigate]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {defaultView === 'sign_in' ? 'Sign In' : 'Sign Up / Register'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I am a:
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Investors can invest in deals. Syndicators can list their real estate deals.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setUserType('investor')}
              className={`py-2 px-4 rounded-lg text-center flex items-center justify-center ${
                userType === 'investor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <User className="h-5 w-5 mr-2" />
              Investor
            </button>
            <button
              onClick={() => setUserType('syndicator')}
              className={`py-2 px-4 rounded-lg text-center flex items-center justify-center ${
                userType === 'syndicator'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Building2 className="h-5 w-5 mr-2" />
              Syndicator
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
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
            borderRadius: '0.5rem',
            height: '44px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          input: {
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
          },
          anchor: {
            color: '#2563eb',
          },
          message: {
            borderRadius: '0.5rem',
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
      view={defaultView}
      socialLayout="horizontal"
      localization={{
        variables: {
          sign_in: {
            social_provider_text: 'Continue with',
            email_label: 'Email address',
            password_label: 'Password',
            button_label: 'Sign in',
            loading_button_label: 'Signing in...',
            link_text: "Don't have an account? Sign up",
          },
          sign_up: {
            social_provider_text: 'Sign up with',
            email_label: 'Email address',
            password_label: 'Create a Password',
            button_label: 'Sign up',
            loading_button_label: 'Signing up...',
            link_text: 'Already have an account? Sign in',
          },
        },
      }}
    />
      </div>
    </div>
  );
}