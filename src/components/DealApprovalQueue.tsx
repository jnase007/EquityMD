import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Building2, ExternalLink, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface PendingDeal {
  id: string;
  title: string;
  slug: string;
  location: string;
  property_type: string;
  minimum_investment: number;
  target_irr: number;
  created_at: string;
  approval_status: string;
  approval_notes: string | null;
  syndicator: {
    company_name: string;
  } | null;
}

export function DealApprovalQueue() {
  const [deals, setDeals] = useState<PendingDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [rejectNotesId, setRejectNotesId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  useEffect(() => {
    fetchDeals();
  }, [filter]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('deals')
        .select(`
          id, title, slug, location, property_type, minimum_investment, target_irr,
          created_at, approval_status, approval_notes,
          syndicator:syndicator_id(company_name)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('approval_status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDeals((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      setMessage({ type: 'error', text: 'Failed to load deals' });
    } finally {
      setLoading(false);
    }
  };

  const approveDeal = async (dealId: string) => {
    setUpdating(dealId);
    setMessage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('deals')
        .update({
          approval_status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          approval_notes: null
        })
        .eq('id', dealId);

      if (error) throw error;

      setDeals(prev => prev.map(d => 
        d.id === dealId 
          ? { ...d, approval_status: 'approved', approval_notes: null }
          : d
      ));
      setMessage({ type: 'success', text: 'Deal approved and now visible to investors' });
    } catch (error) {
      console.error('Error approving deal:', error);
      setMessage({ type: 'error', text: 'Failed to approve deal' });
    } finally {
      setUpdating(null);
    }
  };

  const rejectDeal = async (dealId: string, notes: string) => {
    setUpdating(dealId);
    setMessage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('deals')
        .update({
          approval_status: 'rejected',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          approval_notes: notes || 'Rejected by admin'
        })
        .eq('id', dealId);

      if (error) throw error;

      setDeals(prev => prev.map(d => 
        d.id === dealId 
          ? { ...d, approval_status: 'rejected', approval_notes: notes }
          : d
      ));
      setRejectNotesId(null);
      setRejectNotes('');
      setMessage({ type: 'success', text: 'Deal rejected' });
    } catch (error) {
      console.error('Error rejecting deal:', error);
      setMessage({ type: 'error', text: 'Failed to reject deal' });
    } finally {
      setUpdating(null);
    }
  };

  const pendingCount = deals.filter(d => d.approval_status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading deals...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            Deal Approval Queue
            {filter === 'pending' && pendingCount > 0 && (
              <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-bold text-white bg-red-500 rounded-full">
                {pendingCount}
              </span>
            )}
          </h2>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              <AlertCircle className={`h-5 w-5 mr-2 ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`} />
              <span className={`text-sm ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Deals list */}
      <div className="divide-y divide-gray-200">
        {deals.map(deal => (
          <div key={deal.id} className={`p-6 ${deal.approval_status === 'pending' ? 'bg-yellow-50/30' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <Link 
                    to={`/deals/${deal.slug}`}
                    className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                  >
                    {deal.title}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    deal.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    deal.approval_status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {deal.approval_status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-x-4">
                  {deal.syndicator && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {(deal.syndicator as any).company_name}
                    </span>
                  )}
                  {deal.location && <span>📍 {deal.location}</span>}
                  {deal.property_type && <span>🏢 {deal.property_type}</span>}
                  <span>📅 {new Date(deal.created_at).toLocaleDateString()}</span>
                </div>
                {deal.approval_notes && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 rounded px-3 py-1 inline-block">
                    Note: {deal.approval_notes}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {deal.approval_status === 'pending' && (
                  <>
                    <button
                      onClick={() => approveDeal(deal.id)}
                      disabled={updating === deal.id}
                      className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {updating === deal.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1.5" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setRejectNotesId(rejectNotesId === deal.id ? null : deal.id)}
                      disabled={updating === deal.id}
                      className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Reject
                    </button>
                  </>
                )}
                {deal.approval_status === 'rejected' && (
                  <button
                    onClick={() => approveDeal(deal.id)}
                    disabled={updating === deal.id}
                    className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Approve
                  </button>
                )}
              </div>
            </div>

            {/* Reject notes input */}
            {rejectNotesId === deal.id && (
              <div className="mt-3 flex items-center gap-3 bg-red-50 rounded-lg p-3">
                <input
                  type="text"
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Reason for rejection (optional)..."
                  className="flex-1 px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={() => rejectDeal(deal.id, rejectNotes)}
                  disabled={updating === deal.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => { setRejectNotesId(null); setRejectNotes(''); }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {deals.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {filter === 'pending' ? 'No deals awaiting approval.' : `No ${filter} deals found.`}
          </p>
        </div>
      )}
    </div>
  );
}
