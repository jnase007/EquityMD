import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MessageModal } from '../components/MessageModal';
import { AccountTypeBadge } from '../components/AccountTypeBadge';
import { useAuthStore } from '../lib/store';
import { InvestorProfileForm } from '../components/InvestorProfileForm';
import { SyndicatorProfileForm } from '../components/SyndicatorProfileForm';
import { EmailUpdateForm } from '../components/EmailUpdateForm';
import { supabase } from '../lib/supabase';
import { MessageCircle, Star, Building2, User, Eye } from 'lucide-react';

interface Syndicator {
  id: string;
  company_name: string;
  company_description: string;
  location: string;
  profile?: {
    full_name: string;
    avatar_url: string;
  } | null;
}

export function Profile() {
  const { user, profile } = useAuthStore();
  const [syndicators, setSyndicators] = useState<Syndicator[]>([]);
  const [loadingSyndicators, setLoadingSyndicators] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedSyndicator, setSelectedSyndicator] = useState<Syndicator | null>(null);
  const [message, setMessage] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showAccountTypeForm, setShowAccountTypeForm] = useState(false);
  const [changingAccountType, setChangingAccountType] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user && profile?.user_type === 'investor') {
      fetchSyndicators();
    }
  }, [user, profile]);

  // Handle profile loading state
  useEffect(() => {
    if (user) {
      // If user exists but no profile, wait a bit for profile to load
      if (!profile) {
        const timer = setTimeout(() => {
          setProfileLoading(false);
        }, 3000); // Wait 3 seconds max for profile to load
        return () => clearTimeout(timer);
      } else {
        setProfileLoading(false);
      }
    } else {
      setProfileLoading(false);
    }
  }, [user, profile]);

  async function fetchSyndicators() {
    setLoadingSyndicators(true);
    try {
      const { data, error } = await supabase
        .from('syndicator_profiles')
        .select(`
          id,
          company_name,
          company_description,
          location,
          profile_id,
          state,
          city
        `)
        .not('company_name', 'ilike', '%equitymd admin%')
        .not('company_name', 'ilike', '%admin%')
        .not('company_name', 'ilike', '%test%')
        .limit(6);

      if (error) throw error;
      
      // Transform the data and filter for complete profiles
      const transformedData: Syndicator[] = (data || [])
        .filter(item => {
          // Only show syndicators with complete profiles
          const hasRequiredFields = item.company_name && 
            item.company_name.length >= 3 &&
            item.state && 
            item.city &&
            item.company_description && 
            item.company_description.length >= 50;
          
          return hasRequiredFields || 
            // Always include verified premier syndicators
            item.company_name === 'Back Bay Capital' || 
            item.company_name === 'Sutera Properties' || 
            item.company_name === 'Starboard Realty';
        })
        .map(item => ({
          id: item.id,
          company_name: item.company_name,
          company_description: item.company_description,
          location: `${item.city}, ${item.state}`,
          profile: null // We'll keep it simple for now
        }));
      
      setSyndicators(transformedData);
    } catch (error) {
      console.error('Error fetching syndicators:', error);
    } finally {
      setLoadingSyndicators(false);
    }
  }

  const handleMessageSyndicator = (syndicator: Syndicator) => {
    setSelectedSyndicator(syndicator);
    setShowMessageModal(true);
  };

  const handleAccountTypeChange = async (newType: 'investor' | 'syndicator') => {
    if (!user || !profile || newType === profile.user_type) return;
    
    setChangingAccountType(true);
    try {
      // Update profile user_type
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ user_type: newType })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Create type-specific profile if it doesn't exist
      if (newType === 'investor') {
        // Check if investor profile exists
        const { data: existingInvestor } = await supabase
          .from('investor_profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingInvestor) {
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
        }
      } else {
        // Check if syndicator profile exists
        const { data: existingSyndicator } = await supabase
          .from('syndicator_profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingSyndicator) {
          const { error: syndicatorError } = await supabase
            .from('syndicator_profiles')
            .insert([{
              id: user.id,
              company_name: profile.full_name || 'My Company',
              verification_documents: {}
            }]);
          
          if (syndicatorError) throw syndicatorError;
        }
      }

      setMessage(`Account type successfully changed to ${newType}`);
      setShowAccountTypeForm(false);
      
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error changing account type:', error);
      setMessage('Error changing account type. Please try again.');
    } finally {
      setChangingAccountType(false);
    }
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Show loading state while profile is being created/fetched
  if (user && !profile && profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Setting up your profile...</h2>
                <p className="text-gray-600">This will only take a moment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user exists but no profile after loading timeout, show error
  if (user && !profile && !profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Setup Error</h2>
              <p className="text-gray-600 mb-4">There was an issue setting up your profile. Please try refreshing the page.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Account Type Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || 'User'}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <User className="h-8 w-8 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile?.full_name || 'User Profile'}
                  </h1>
                  <div className="mt-2">
                    <AccountTypeBadge
                      userType={profile?.user_type || 'investor'}
                      isAdmin={profile?.is_admin}
                      isVerified={profile?.is_verified}
                      size="md"
                    />
                  </div>
                </div>
              </div>
              {profile?.is_admin && user?.email === 'justin@brandastic.com' && (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Email Update Form */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Account Settings</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAccountTypeForm(!showAccountTypeForm)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {showAccountTypeForm ? 'Cancel' : 'Change Account Type'}
                </button>
                <button
                  onClick={() => setShowEmailForm(!showEmailForm)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {showEmailForm ? 'Cancel' : 'Update Email'}
                </button>
              </div>
            </div>

            {showAccountTypeForm ? (
              <div className="bg-white p-6 rounded-lg shadow-sm mb-4">
                <h3 className="text-lg font-semibold mb-4">Change Account Type</h3>
                <p className="text-gray-600 mb-4">
                  You can switch between investor and syndicator accounts. Your existing data will be preserved.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => handleAccountTypeChange('investor')}
                    disabled={changingAccountType || profile?.user_type === 'investor'}
                    className={`p-4 border rounded-lg text-center flex items-center justify-center ${
                      profile?.user_type === 'investor'
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                    } disabled:opacity-50`}
                  >
                    <User className="h-5 w-5 mr-2" />
                    <div>
                      <div className="font-medium">Investor</div>
                      <div className="text-sm text-gray-500">Browse and invest in opportunities</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleAccountTypeChange('syndicator')}
                    disabled={changingAccountType || profile?.user_type === 'syndicator'}
                    className={`p-4 border rounded-lg text-center flex items-center justify-center ${
                      profile?.user_type === 'syndicator'
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                    } disabled:opacity-50`}
                  >
                    <Building2 className="h-5 w-5 mr-2" />
                    <div>
                      <div className="font-medium">Syndicator</div>
                      <div className="text-sm text-gray-500">List investment opportunities</div>
                    </div>
                  </button>
                </div>
                
                {changingAccountType && (
                  <div className="text-center text-gray-600">
                    Updating account type...
                  </div>
                )}
              </div>
            ) : null}

            {showEmailForm ? (
              <EmailUpdateForm
                currentEmail={user.email!}
                onSuccess={() => setShowEmailForm(false)}
              />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-500">Email Address</div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
            
            {message && (
              <div 
                className={`p-4 rounded-md mb-6 ${
                  message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                }`}
              >
                {message}
              </div>
            )}

            {profile?.user_type === 'investor' ? (
              <InvestorProfileForm onComplete={() => setMessage('Profile updated successfully!')} />
            ) : (
              <SyndicatorProfileForm setMessage={setMessage} />
            )}
          </div>

          {/* Syndicator Directory - Only for Investors */}
          {profile?.user_type === 'investor' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Connect with Syndicators</h2>
                  <p className="text-gray-600 mt-1">Message syndicators directly or view their profiles</p>
                </div>
                <Link
                  to="/directory"
                  className="text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View All
                </Link>
              </div>

              {loadingSyndicators ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading syndicators...</div>
                </div>
              ) : syndicators.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {syndicators.map((syndicator) => {
                    const slug = syndicator.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    return (
                      <div key={syndicator.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center mb-3">
                            {syndicator.profile?.avatar_url ? (
                              <img
                                src={syndicator.profile.avatar_url}
                                alt={syndicator.company_name}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-blue-600" />
                              </div>
                            )}
                            <div className="ml-3">
                              <h3 className="font-medium text-gray-900">{syndicator.company_name}</h3>
                              <p className="text-sm text-gray-500">{syndicator.location}</p>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {syndicator.company_description || 'Real estate investment company'}
                        </p>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMessageSyndicator(syndicator)}
                            className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message
                          </button>
                          <Link
                            to={`/syndicators/${slug}`}
                            className="flex items-center px-3 py-2 bg-white border text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Profile
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No syndicators found</h3>
                  <p className="text-gray-500 mb-4">
                    Check back later or browse our directory to find syndicators.
                  </p>
                  <Link
                    to="/directory"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Browse Directory
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedSyndicator && (
        <MessageModal
          dealId=""
          dealTitle=""
          syndicatorId={selectedSyndicator.id}
          syndicatorName={selectedSyndicator.company_name}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedSyndicator(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}