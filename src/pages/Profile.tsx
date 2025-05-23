import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MessageModal } from '../components/MessageModal';
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
  const [message, setMessage] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [syndicators, setSyndicators] = useState<Syndicator[]>([]);
  const [selectedSyndicator, setSelectedSyndicator] = useState<Syndicator | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [loadingSyndicators, setLoadingSyndicators] = useState(false);

  useEffect(() => {
    if (user && profile?.user_type === 'investor') {
      fetchSyndicators();
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
          profile_id
        `)
        .limit(6);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: Syndicator[] = (data || []).map(item => ({
        id: item.id,
        company_name: item.company_name,
        company_description: item.company_description,
        location: item.location,
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

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Email Update Form */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Account Settings</h2>
              <button
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="text-blue-600 hover:text-blue-700"
              >
                {showEmailForm ? 'Cancel' : 'Update Email'}
              </button>
            </div>

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
              <InvestorProfileForm setMessage={setMessage} />
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