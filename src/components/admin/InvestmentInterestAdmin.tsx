import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { DollarSign, RefreshCw, Mail, ExternalLink } from 'lucide-react';

interface InterestRow {
  id: string;
  deal_id: string;
  user_id: string;
  amount: number | null;
  status: string | null;
  created_at: string;
  deal?: { id: string; title: string; slug: string } | null;
  investor?: { id: string; full_name: string | null; email: string | null } | null;
}

export function InvestmentInterestAdmin() {
  const [rows, setRows] = useState<InterestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  async function load() {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('investment_requests')
        .select('id, deal_id, user_id, amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: reqs, error: reqErr } = await query;
      if (reqErr) throw reqErr;

      const dealIds = [...new Set((reqs || []).map((r) => r.deal_id).filter(Boolean))];
      const userIds = [...new Set((reqs || []).map((r) => r.user_id).filter(Boolean))];

      const [{ data: deals }, { data: profs }] = await Promise.all([
        dealIds.length
          ? supabase.from('deals').select('id, title, slug').in('id', dealIds)
          : Promise.resolve({ data: [] as any[] }),
        userIds.length
          ? supabase.from('profiles').select('id, full_name, email').in('id', userIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const dealMap = new Map((deals || []).map((d) => [d.id, d]));
      const profMap = new Map((profs || []).map((p) => [p.id, p]));

      setRows(
        (reqs || []).map((r) => ({
          ...r,
          deal: dealMap.get(r.deal_id) || null,
          investor: profMap.get(r.user_id) || null,
        }))
      );
    } catch (e) {
      console.error('InvestmentInterestAdmin load error:', e);
      setError(e instanceof Error ? e.message : 'Failed to load investment interest');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const totalAmount = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const pendingCount = rows.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-emerald-600" />
            Investment Interest
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Platform-wide deal interest from investors — independent of who owns the deal inbox
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="text-2xl font-bold text-gray-900">{rows.length}</div>
          <div className="text-sm text-gray-500">Shown requests</div>
        </div>
        <div className="bg-white border border-emerald-100 rounded-xl p-4">
          <div className="text-2xl font-bold text-emerald-700">{pendingCount}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white border border-blue-100 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-700">
            ${totalAmount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total interest amount</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
              statusFilter === s
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 text-sm">Loading interest…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            No investment interest yet{statusFilter !== 'all' ? ` with status “${statusFilter}”` : ''}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">When</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Investor</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deal</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {r.investor?.full_name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">{r.investor?.email || '—'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-gray-900">{r.deal?.title || 'Unknown deal'}</div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-emerald-700 whitespace-nowrap">
                      {r.amount != null ? `$${Number(r.amount).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          r.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : r.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {r.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {r.investor?.email && (
                          <a
                            href={`mailto:${r.investor.email}`}
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Email
                          </a>
                        )}
                        {r.deal?.slug && (
                          <Link
                            to={`/deals/${r.deal.slug}`}
                            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Deal
                          </Link>
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
    </div>
  );
}
