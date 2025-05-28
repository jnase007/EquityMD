import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthModal } from '../components/AuthModal';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Loader, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';

export function TestAuth() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'investor' | 'syndicator'>('investor');
  const [authModalView, setAuthModalView] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [testing, setTesting] = useState(false);
  const [directTestResult, setDirectTestResult] = useState<string>('');
  const { user, profile } = useAuthStore();

  const providers = ['google', 'facebook', 'linkedin_oidc'];

  // Direct test of social authentication
  const testDirectSocialAuth = async (provider: string) => {
    try {
      setDirectTestResult(`Testing ${provider} authentication...`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        setDirectTestResult(`❌ ${provider} Error: ${error.message}`);
        console.error(`${provider} auth error:`, error);
      } else {
        setDirectTestResult(`✅ ${provider} authentication initiated successfully`);
        console.log(`${provider} auth data:`, data);
      }
    } catch (error) {
      setDirectTestResult(`❌ ${provider} Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error(`${provider} auth exception:`, error);
    }
  };

  // Manual profile creation test
  const testManualProfileCreation = async () => {
    if (!user) {
      setDirectTestResult('❌ No user found. Please sign in first.');
      return;
    }

    try {
      setDirectTestResult('Testing manual profile creation...');

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        setDirectTestResult('✅ Profile already exists: ' + JSON.stringify(existingProfile, null, 2));
        return;
      }

      // Create profile manually
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
          user_type: 'investor',
          is_verified: true
        }])
        .select()
        .single();

      if (profileError) {
        setDirectTestResult(`❌ Profile creation error: ${profileError.message}`);
        return;
      }

      // Create investor profile
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
        setDirectTestResult(`❌ Investor profile creation error: ${investorError.message}`);
        return;
      }

      setDirectTestResult('✅ Profile created successfully: ' + JSON.stringify(newProfile, null, 2));
    } catch (error) {
      setDirectTestResult(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runComprehensiveTest = async () => {
    setTesting(true);
    const results: Record<string, any> = {};

    for (const provider of providers) {
      for (const view of ['sign_in', 'sign_up'] as const) {
        for (const userType of ['investor', 'syndicator'] as const) {
          const testKey = `${provider}_${view}_${userType}`;
          
          try {
            setTestResults((prev: Record<string, any>) => ({
              ...prev,
              [provider]: {
                ...prev[provider],
                [`${view}_${userType}`]: {
                  status: 'testing',
                  message: 'Initiating OAuth flow...'
                }
              }
            }));

            // Test the OAuth flow
            const { data, error } = await supabase.auth.signInWithOAuth({
              provider: provider as any,
              options: {
                redirectTo: `${window.location.origin}/dashboard`,
                queryParams: {
                  user_type: userType,
                  view: view
                }
              }
            });

            if (error) {
              setTestResults((prev: Record<string, any>) => ({
                ...prev,
                [provider]: {
                  ...prev[provider],
                  [`${view}_${userType}`]: {
                    status: 'error',
                    error: error.message
                  }
                }
              }));
            } else {
              setTestResults((prev: Record<string, any>) => ({
                ...prev,
                [provider]: {
                  ...prev[provider],
                  [`${view}_${userType}`]: {
                    status: 'initiated',
                    message: 'OAuth flow initiated'
                  }
                }
              }));
            }

            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 500));

          } catch (error) {
            setTestResults((prev: Record<string, any>) => ({
              ...prev,
              [provider]: {
                ...prev[provider],
                [`${view}_${userType}`]: {
                  status: 'error',
                  error: error instanceof Error ? error.message : 'Unknown error'
                }
              }
            }));
          }
        }
      }
    }

    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'testing':
        return <Loader className="h-4 w-4 animate-spin text-blue-500" />;
      case 'initiated':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Social Authentication Test</h1>
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Current User Status */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Current User Status</h2>
            {user ? (
              <div className="space-y-2">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Provider:</strong> {user.app_metadata?.provider || 'email'}</p>
                <p><strong>Profile Type:</strong> {profile?.user_type || 'Not set'}</p>
                <p><strong>Profile Full Name:</strong> {profile?.full_name || 'Not set'}</p>
                <p><strong>Profile Verified:</strong> {profile?.is_verified ? 'Yes' : 'No'}</p>
                <p><strong>Profile Admin:</strong> {profile?.is_admin ? 'Yes' : 'No'}</p>
                <p><strong>User Metadata:</strong> {JSON.stringify(user.user_metadata, null, 2)}</p>
                <p><strong>App Metadata:</strong> {JSON.stringify(user.app_metadata, null, 2)}</p>
                
                {/* Profile Actions */}
                <div className="mt-4 space-x-2">
                  <Link 
                    to="/profile" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition inline-block"
                  >
                    Go to Profile
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition inline-block"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      const { error } = await supabase.auth.signOut();
                      if (error) console.error('Sign out error:', error);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Not signed in</p>
            )}
          </div>

          {/* Direct Social Auth Test */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Direct Social Authentication Test</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {providers.map(provider => (
                <button
                  key={provider}
                  onClick={() => testDirectSocialAuth(provider)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Test {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </button>
              ))}
            </div>
            {directTestResult && (
              <div className="p-3 bg-white rounded border">
                <p className="text-sm font-mono">{directTestResult}</p>
              </div>
            )}
          </div>

          {/* Configuration Check */}
          <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              OAuth Configuration Status
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}</p>
              <p><strong>Supabase Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}</p>
              <p><strong>Current Origin:</strong> {window.location.origin}</p>
              <p><strong>Redirect URL:</strong> {window.location.origin}/dashboard</p>
            </div>
            <div className="mt-4 p-3 bg-white rounded border">
              <p className="text-sm"><strong>Note:</strong> If social auth was working before but isn't now, check:</p>
              <ul className="text-sm mt-2 space-y-1 ml-4">
                <li>• Supabase Dashboard → Authentication → Providers</li>
                <li>• OAuth redirect URLs in provider settings</li>
                <li>• Site URL in Supabase project settings</li>
              </ul>
            </div>
          </div>

          {/* Auth Modal Test */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Auth Modal Test</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => {
                  setAuthModalType('investor');
                  setAuthModalView('sign_in');
                  setShowAuthModal(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Investor Sign In
              </button>
              <button
                onClick={() => {
                  setAuthModalType('investor');
                  setAuthModalView('sign_up');
                  setShowAuthModal(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Investor Sign Up
              </button>
              <button
                onClick={() => {
                  setAuthModalType('syndicator');
                  setAuthModalView('sign_in');
                  setShowAuthModal(true);
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Syndicator Sign In
              </button>
              <button
                onClick={() => {
                  setAuthModalType('syndicator');
                  setAuthModalView('sign_up');
                  setShowAuthModal(true);
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Syndicator Sign Up
              </button>
            </div>
          </div>

          {/* Comprehensive Test */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Comprehensive OAuth Test</h2>
              <button
                onClick={runComprehensiveTest}
                disabled={testing}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {testing ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {providers.map(provider => (
                <div key={provider} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 capitalize">{provider} Authentication</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {['sign_in', 'sign_up'].map(view => 
                      ['investor', 'syndicator'].map(userType => {
                        const result = testResults[provider]?.[`${view}_${userType}`];
                        return (
                          <div key={`${view}_${userType}`} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            {getStatusIcon(result?.status)}
                            <span className="text-xs">
                              {view === 'sign_in' ? 'Sign In' : 'Sign Up'} - {userType}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {Object.entries(testResults[provider] || {}).map(([key, result]: [string, any]) => (
                    result?.error && (
                      <div key={key} className="mt-2 p-2 bg-red-50 text-red-700 text-xs rounded">
                        <strong>{key}:</strong> {result.error}
                      </div>
                    )
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Supabase Dashboard
              </a>
              <Link to="/test-messaging" className="text-blue-600 hover:text-blue-800">
                Test Messaging
              </Link>
              <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
                Dashboard
              </Link>
              <Link to="/loader-demo" className="text-blue-600 hover:text-blue-800">
                Loader Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          defaultType={authModalType} 
          defaultView={authModalView}
        />
      )}
    </div>
  );
} 