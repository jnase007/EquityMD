import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, AlertCircle, FileText, ExternalLink } from 'lucide-react';

interface ClaimRequest {
  id: string;
  syndicator_id: string;
  requester_id: string;
  company_email: string;
  company_website: string;
  proof_documents: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  syndicator: {
    company_name: string;
  };
  requester: {
    full_name: string;
    email: string;
  };
}

export function ClaimRequests() {
  const [requests, setRequests] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ClaimRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const { data, error } = await supabase
        .from('syndicator_claim_requests')
        .select(`
          *,
          syndicator:syndicator_id (
            company_name
          ),
          requester:requester_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched claim requests:', data?.length || 0);
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('syndicator_claim_requests')
        .update({ 
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      if (status === 'approved') {
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        // Update syndicator profile
        const { error: syndicatorError } = await supabase
          .from('syndicator_profiles')
          .update({
            claimable: false,
            claimed_at: new Date().toISOString(),
            claimed_by: request.requester_id
          })
          .eq('id', request.syndicator_id);

        if (syndicatorError) throw syndicatorError;

        // Send notification
        await supabase.functions.invoke('send-email', {
          body: {
            to: request.requester.email,
            subject: 'Syndicator Profile Claim Approved',
            content: `Your request to claim the ${request.syndicator.company_name} profile has been approved. You can now manage this profile through your dashboard.`,
            type: 'claim_approved'
          }
        });
      }

      // Refresh requests
      fetchRequests();
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error handling request:', error);
      alert('Error processing claim request. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading claim requests...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6">Syndicator Claim Requests</h2>

      <div className="space-y-6">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div 
              key={request.id}
              className={`border rounded-lg p-6 ${
                request.status === 'pending'
                  ? 'border-yellow-200 bg-yellow-50'
                  : request.status === 'approved'
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{request.syndicator.company_name}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    Requested by: {request.requester.full_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Email: {request.company_email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    Website: 
                    <a 
                      href={request.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 ml-1 flex items-center"
                    >
                      {request.company_website}
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-sm flex items-center ${
                  request.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : request.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {request.status === 'pending' && (
                    <AlertCircle className="h-4 w-4 mr-1" />
                  )}
                  {request.status === 'approved' && (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  {request.status === 'rejected' && (
                    <XCircle className="h-4 w-4 mr-1" />
                  )}
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </div>
              </div>

              {request.status === 'pending' && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Notes
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Add notes about this request..."
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => handleAction(request.id, 'rejected')}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(request.id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              )}

              {request.admin_notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="text-sm font-medium text-gray-700">Admin Notes:</div>
                  <div className="text-sm text-gray-600 mt-1">{request.admin_notes}</div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            No claim requests found
          </div>
        )}
      </div>
    </div>
  );
}