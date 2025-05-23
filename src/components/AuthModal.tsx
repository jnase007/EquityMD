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
  const [currentView, setCurrentView] = useState<'sign_in' | 'sign_up'>(defaultView);
  const navigate = useNavigate();

  const handleSignUp = async ({ email, password }: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              user_type: userType,
            },
          ]);

        if (profileError) throw profileError;

        // Create type-specific profile
        if (userType === 'investor') {
          const { error: investorError } = await supabase
            .from('investor_profiles')
            .insert([{ id: data.user.id }]);
          
          if (investorError) throw investorError;
        } else {
          const { error: syndicatorError } = await supabase
            .from('syndicator_profiles')
            .insert([{ id: data.user.id }]);
          
          if (syndicatorError) throw syndicatorError;
        }

        // Send signup notification emails
        try {
          await sendSignupEmails({
            userName: data.user.email?.split('@')[0] || 'New User',
            userEmail: data.user.email || '',
            userType: userType
          });
        } catch (emailError) {
          console.error('Failed to send signup emails:', emailError);
          // Don't throw here - we don't want email failures to break signup
        }

        // Close modal and redirect to dashboard
        onClose();
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error in signup process:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
    }
  };

  const handleAuthSuccess = async ({ event, session }: { event: any; session: any }) => {
    try {
      if (event === 'SIGNED_IN') {
        const user = session?.user;
        if (!user) throw new Error('No user data available');

        // Check if profile exists
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          throw profileCheckError;
        }

        if (!existingProfile) {
          // If user signed in with social provider but has no profile, redirect to social signup
          if (user.app_metadata?.provider && user.app_metadata.provider !== 'email') {
            onClose();
            navigate('/social-signup');
            return;
          }

          // Create new profile for email users
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                avatar_url: user.user_metadata?.avatar_url,
                user_type: userType,
                is_verified: true, // Auto-verify OAuth users
              },
            ]);

          if (profileError) throw profileError;

          // Create type-specific profile
          if (userType === 'investor') {
            const { error: investorError } = await supabase
              .from('investor_profiles')
              .insert([{ 
                id: user.id,
                accredited_status: false,
                investment_preferences: {},
                preferred_property_types: [],
                preferred_locations: []
              }]);
            
            if (investorError) throw investorError;
          } else {
            const { error: syndicatorError } = await supabase
              .from('syndicator_profiles')
              .insert([{ 
                id: user.id,
                company_name: user.user_metadata?.full_name || 'My Company',
                verification_documents: {}
              }]);
            
            if (syndicatorError) throw syndicatorError;
          }
        }

        // Check if user is admin
        if (existingProfile?.is_admin) {
          onClose();
          navigate('/admin/dashboard');
          return;
        }

        // Close modal and redirect to dashboard
        onClose();
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error in auth success handler:', error);
      setError('Error setting up user profile. Please try again.');
    }
  };

  // Track view changes from the Auth component
  const handleViewChange = (view: 'sign_in' | 'sign_up') => {
    setCurrentView(view);
  };

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
          
          // Check if this is a new user by looking for existing profile
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileCheckError && profileCheckError.code !== 'PGRST116') {
            throw profileCheckError;
          }

          // If no existing profile, this is a new user
          if (!existingProfile) {
            // Create profile
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: user.id,
                  email: user.email,
                  full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                  avatar_url: user.user_metadata?.avatar_url,
                  user_type: userType,
                },
              ]);

            if (profileError) throw profileError;

            // Create type-specific profile
            if (userType === 'investor') {
              const { error: investorError } = await supabase
                .from('investor_profiles')
                .insert([{ id: user.id }]);
              
              if (investorError) throw investorError;
            } else {
              const { error: syndicatorError } = await supabase
                .from('syndicator_profiles')
                .insert([{ id: user.id }]);
              
              if (syndicatorError) throw syndicatorError;
            }

            // Send signup notification emails for new users
            try {
              await sendSignupEmails({
                userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New User',
                userEmail: user.email || '',
                userType: userType
              });
            } catch (emailError) {
              console.error('Failed to send signup emails:', emailError);
              // Don't throw here - we don't want email failures to break signup
            }
          }

          // Close modal and redirect to dashboard
          onClose();
          navigate('/dashboard');
        } catch (err) {
          console.error('Error in signup process:', err);
          setError(err instanceof Error ? err.message : 'An error occurred during signup');
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
            {currentView === 'sign_in' ? 'Sign In' : 'Sign Up / Register'}
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
      redirectTo={window.location.origin}
      view={currentView}
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