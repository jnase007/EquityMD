import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MessageModal } from '../components/MessageModal';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { MessageCircle, User, Building2 } from 'lucide-react';

interface TestSyndicator {
  id: string;
  company_name: string;
  company_description: string;
  claimed_by: string | null;
}

export function TestMessaging() {
  const { user, profile } = useAuthStore();
  const [syndicators, setSyndicators] = useState<TestSyndicator[]>([]);
  const [selectedSyndicator, setSelectedSyndicator] = useState<TestSyndicator | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestData();
  }, []);

  async function fetchTestData() {
    try {
      // Fetch some syndicators for testing
      const { data: syndicatorData, error: syndicatorError } = await supabase
        .from('syndicators')
        .select('id, company_name, company_description, state, city, claimed_by')
        .not('company_name', 'ilike', '%equitymd admin%')
        .not('company_name', 'ilike', '%admin%')
        .not('company_name', 'ilike', '%test%')
        .neq('company_name', 'Metropolitan Real Estate')
        .in('verification_status', ['verified', 'premier'])
        .not('claimed_by', 'is', null)
        .limit(5);

      if (syndicatorError) throw syndicatorError;
      
      // Filter for complete profiles only
      const completeProfiles = (syndicatorData || []).filter(item => {
        const hasRequiredFields = item.company_name && 
          item.company_name.length >= 3 &&
          item.state && 
          item.city &&
          item.company_description && 
          item.company_description.length >= 50 &&
          item.claimed_by; // Must be claimed to send messages
        
        return hasRequiredFields || 
          // Always include verified premier syndicators if claimed
          (item.claimed_by && (
            item.company_name === 'Back Bay Capital' || 
            item.company_name === 'Sutera Properties' || 
            item.company_name === 'Starboard Realty'
          ));
      });
      
      setSyndicators(completeProfiles);

      // Fetch recent messages if user is logged in
      if (user) {
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            sender:profiles!messages_sender_id_fkey(full_name, user_type),
            receiver:profiles!messages_receiver_id_fkey(full_name, user_type)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (messagesError) throw messagesError;
        setRecentMessages(messagesData || []);
      }
    } catch (error) {
      console.error('Error fetching test data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleTestMessage = (syndicator: TestSyndicator) => {
    setSelectedSyndicator(syndicator);
    setShowMessageModal(true);
  };

  const handleCloseModal = () => {
    setShowMessageModal(false);
    setSelectedSyndicator(null);
    // Refresh messages after sending
    fetchTestData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold mb-4">Messaging System Test</h1>
          
          {!user ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                Please sign in to test the messaging functionality.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Current User</h3>
                <div className="flex items-center">
                  {profile?.user_type === 'syndicator' ? (
                    <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                  ) : (
                    <User className="h-5 w-5 text-blue-600 mr-2" />
                  )}
                  <span className="text-blue-800">
                    {profile?.full_name || user.email} ({profile?.user_type || 'Unknown'})
                  </span>
                </div>
              </div>

              {/* Test Syndicators */}
              <div>
                <h3 className="text-lg font-medium mb-4">Test Messaging with Syndicators</h3>
                {loading ? (
                  <p>Loading syndicators...</p>
                ) : syndicators.length > 0 ? (
                  <div className="grid gap-4">
                    {syndicators.map((syndicator) => (
                      <div key={syndicator.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{syndicator.company_name}</h4>
                          <p className="text-sm text-gray-600">
                            {syndicator.company_description || 'Real estate syndicator'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleTestMessage(syndicator)}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Send Message
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No syndicators found for testing.</p>
                )}
              </div>

              {/* Recent Messages */}
              <div>
                <h3 className="text-lg font-medium mb-4">Recent Messages</h3>
                {recentMessages.length > 0 ? (
                  <div className="space-y-3">
                    {recentMessages.map((message) => (
                      <div key={message.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm text-gray-600">
                            From: {message.sender.full_name} ({message.sender.user_type}) → 
                            To: {message.receiver.full_name} ({message.receiver.user_type})
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleString()}
                          </div>
                        </div>
                        <p className="text-gray-900">{message.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No messages yet. Send a test message above!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showMessageModal && selectedSyndicator && selectedSyndicator.claimed_by && (
        <MessageModal
          receiverId={selectedSyndicator.claimed_by}
          syndicatorName={selectedSyndicator.company_name}
          onClose={handleCloseModal}
        />
      )}

      <Footer />
    </div>
  );
} 