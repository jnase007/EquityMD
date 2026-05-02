import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, RefreshCw, RotateCcw, Calendar, Users, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface SyndicatorSub {
  id: string;
  company_name: string;
  subscription_status: string | null;
  subscribed_at: string | null;
  subscription_cancelled_at: string | null;
  claimed_by: string | null;
}

export function SubscriptionManager() {
  const [syndicators, setSyndicators] = useState<SyndicatorSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dateInputs, setDateInputs] = useState<Record<string, string>>({});
  const [migrationMissing, setMigrationMissing] = useState(false);

  const fetchSyndicators = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('syndicators')
        .select('id, company_name, subscription_status, subscribed_at, subscription_cancelled_at, claimed_by')
        .order('company_name');

      if (fetchError) {
        if (fetchError.message?.includes('subscription_status') || fetchError.code === '42703') {
          setMigrationMissing(true);
          // Fallback: fetch without subscription columns
          const { data: fallbackData } = await supabase
            .from('syndicators')
            .select('id, company_name, claimed_by')
            .order('company_name');
          setSyndicators((fallbackData || []).map(s => ({
            ...s,
            subscription_status: null,
            subscribed_at: null,
            subscription_cancelled_at: null,
          })));
        } else {
          throw fetchError;
        }
      } else {
        setSyndicators(data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch syndicators');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSyndicators();
  }, [fetchSyndicators]);

  const updateSubscription = async (
    syndicatorId: string,
    updates: Record<string, any>
  ) => {
    setActionLoading(syndicatorId);
    try {
      const { error: updateError } = await supabase
        .from('syndicators')
        .update(updates)
        .eq('id', syndicatorId);

      if (updateError) throw updateError;
      await fetchSyndicators();
    } catch (err: any) {
      setError(err.message || 'Failed to update subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (s: SyndicatorSub) => {
    await updateSubscription(s.id, {
      subscription_status: 'active',
      subscribed_at: s.subscribed_at || new Date().toISOString(),
      subscription_cancelled_at: null,
    });
    // TODO: Wire actual approval email via Supabase edge function here
    toast.success(`Approved! ${s.company_name} now has investor access.`);
  };

  const handleCancel = (s: SyndicatorSub) => {
    updateSubscription(s.id, {
      subscription_status: 'cancelled',
      subscription_cancelled_at: new Date().toISOString(),
    });
  };

  const handleReactivate = (s: SyndicatorSub) => {
    updateSubscription(s.id, {
      subscription_status: 'active',
      subscription_cancelled_at: null,
    });
  };

  const handleReset = (s: SyndicatorSub) => {
    updateSubscription(s.id, {
      subscription_status: 'none',
      subscribed_at: null,
      subscription_cancelled_at: null,
    });
  };

  const handleSetDate = (s: SyndicatorSub) => {
    const dateVal = dateInputs[s.id];
    if (!dateVal) return;
    updateSubscription(s.id, {
      subscribed_at: new Date(dateVal).toISOString(),
    });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            Active
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
            None
          </span>
        );
    }
  };

  if (migrationMissing) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Migration Required</h3>
        <p className="text-gray-600 mb-4">
          The subscription columns haven't been added to the syndicators table yet.
          Run the migration file <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">supabase/migrations/20260502_investor_program.sql</code> in Supabase SQL Editor.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Investor Program Subscriptions</h2>
        </div>
        <button
          onClick={fetchSyndicators}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Pending Approvals Section */}
      {!loading && (() => {
        const pending = syndicators.filter(s => !s.subscription_status || s.subscription_status === 'none');
        if (pending.length === 0) {
          return (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-green-800 font-medium">All caught up! No pending approvals.</span>
            </div>
          );
        }
        return (
          <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-amber-100 border-b border-amber-300 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-700" />
              <h3 className="font-bold text-amber-900">Pending Approval ({pending.length})</h3>
            </div>
            <div className="divide-y divide-amber-200">
              {pending.map(s => (
                <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{s.company_name}</div>
                    <div className="text-sm text-gray-500">{s.claimed_by ? 'Claimed' : 'Unclaimed'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleActivate(s)}
                      disabled={actionLoading === s.id}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleCancel(s)}
                      disabled={actionLoading === s.id}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading syndicators...</div>
      ) : syndicators.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No syndicators found</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Subscribed At</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Set Date</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {syndicators.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{s.company_name}</div>
                    {s.claimed_by && (
                      <div className="text-xs text-gray-500">Claimed</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(s.subscription_status)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {s.subscribed_at
                      ? new Date(s.subscribed_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                    {s.subscription_cancelled_at && (
                      <div className="text-xs text-red-500 mt-0.5">
                        Cancelled {new Date(s.subscription_cancelled_at).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <input
                        type="date"
                        value={dateInputs[s.id] || ''}
                        onChange={(e) =>
                          setDateInputs((prev) => ({ ...prev, [s.id]: e.target.value }))
                        }
                        className="border rounded px-2 py-1 text-sm w-36"
                      />
                      <button
                        onClick={() => handleSetDate(s)}
                        disabled={!dateInputs[s.id] || actionLoading === s.id}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-40"
                        title="Set subscribed_at date"
                      >
                        <Calendar className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {(s.subscription_status !== 'active') && (
                        <button
                          onClick={() =>
                            s.subscription_status === 'cancelled'
                              ? handleReactivate(s)
                              : handleActivate(s)
                          }
                          disabled={actionLoading === s.id}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {s.subscription_status === 'cancelled' ? 'Reactivate' : 'Activate'}
                        </button>
                      )}
                      {s.subscription_status === 'active' && (
                        <button
                          onClick={() => handleCancel(s)}
                          disabled={actionLoading === s.id}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                      {s.subscription_status && s.subscription_status !== 'none' && (
                        <button
                          onClick={() => handleReset(s)}
                          disabled={actionLoading === s.id}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                          title="Reset to none (testing)"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
