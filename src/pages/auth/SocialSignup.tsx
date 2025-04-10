import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function SocialSignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState<'investor' | 'syndicator'>('investor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if we have a session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Check if profile already exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          // Profile exists, redirect to dashboard
          navigate('/dashboard');
        }
      } else {
        // No session, redirect to signup start
        navigate('/signup/start');
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
          user_type: userType,
          is_verified: true // Auto-verify social users
        });

      if (profileError) throw profileError;

      // Create type-specific profile
      if (userType === 'investor') {
        const { error: investorError } = await supabase
          .from('investor_profiles')
          .insert({
            id: user.id,
            accredited_status: false,
            investment_preferences: {},
            preferred_property_types: [],
            preferred_locations: []
          });
        
        if (investorError) throw investorError;
      } else {
        const { error: syndicatorError } = await supabase
          .from('syndicator_profiles')
          .insert({
            id: user.id,
            company_name: user.user_metadata?.full_name || 'My Company',
            verification_documents: {}
          });
        
        if (syndicatorError) throw syndicatorError;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error creating profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="mb-8">
            <button
              onClick={() => navigate('/signup/start')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
          </div>

          <div className="text-center mb-8">
            <Link to="/">
              <img
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos//logo-black.png`}
                alt="EquityMD"
                className="h-12 mx-auto mb-6"
              />
            </Link>
            <h1 className="text-2xl font-bold mb-2">Complete Your Registration</h1>
            <p className="text-gray-600">Choose your account type to continue</p>
          </div>

          {success ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-4">Registration Complete!</h2>
              <p className="text-gray-600 mb-6">
                Your account has been created successfully. You'll be redirected to your dashboard in a moment.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}! Please select your account type:
                  </p>
                  
                  <div className="space-y-4">
                    <label className="block p-4 border rounded-lg cursor-pointer transition hover:border-blue-300">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="userType"
                          value="investor"
                          checked={userType === 'investor'}
                          onChange={() => setUserType('investor')}
                          className="h-4 w-4 text-blue-600"
                        />
                        <div className="ml-3">
                          <div className="font-medium">Investor</div>
                          <p className="text-sm text-gray-500">
                            I want to browse and invest in opportunities
                          </p>
                        </div>
                      </div>
                    </label>
                    
                    <label className="block p-4 border rounded-lg cursor-pointer transition hover:border-blue-300">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="userType"
                          value="syndicator"
                          checked={userType === 'syndicator'}
                          onChange={() => setUserType('syndicator')}
                          className="h-4 w-4 text-blue-600"
                        />
                        <div className="ml-3">
                          <div className="font-medium">Syndicator</div>
                          <p className="text-sm text-gray-500">
                            I want to list investment opportunities
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm mb-4">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Continue'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} EquityMD. All rights reserved.
      </div>
    </div>
  );
}