import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  DollarSign,
  RefreshCw,
  Mail,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock3,
  Search,
  User,
  Building2,
} from 'lucide-react';

type InterestStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

interface InterestRow {
  id: string;
  deal_id: string;
  user_id: string;
  amount: number | null;
  status: InterestStatus | string | null;
  created_at: string;
  updated_at?: string | null;
  deal?: {
    id: string;
    title: string;
    slug: string;
    created_by?: string | null;
    syndicator_id?: string | null;
  } | null;
  investor?: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
  owner?: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
  syndicatorName?: string | null;
}

const STATUS_OPTIONS: Array<'all' | InterestStatus> = [
  'all',
  'pending',
  'approved',
  'rejected',
  'withdrawn',
];

function statusClasses(status?: string | null) {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'approved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'withdrawn':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

export function InvestmentInterestAdmin() {
  const [rows, setRows] = useState<InterestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | InterestStatus>('all');
  const [query, setQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      let reqQuery = supabase
        .from('investment_requests')
        .select('id, deal_id, user_id, amount, status, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(200);

      if (statusFilter !== 'all') {
        reqQuery = reqQuery.eq('status', statusFilter);
      }

      const { data: reqs, error: reqErr } = await reqQuery;
      if (reqErr) throw reqErr;

      const dealIds = [...new Set((reqs || []).map((r) => r.deal_id).filter(Boolean))];
      const userIds = [...new Set((reqs || []).map((r) => r.user_id).filter(Boolean))];

      const [{ data: deals, error: dealErr }, { data: investors, error: invErr }] = await Promise.all([
        dealIds.length
          ? supabase
              .from('deals')
              .select('id, title, slug, created_by, syndicator_id')
              .in('id', dealIds)
          : Promise.resolve({ data: [] as any[], error: null }),
        userIds.length
          ? supabase.from('profiles').select('id, full_name, email').in('id', userIds)
          : Promise.resolve({ data: [] as any[], error: null }),
      ]);

      if (dealErr) throw dealErr;
      if (invErr) throw invErr;

      const syndicatorIds = [
        ...new Set((deals || []).map((d: any) => d.syndicator_id).filter(Boolean)),
      ];
      const creatorIds = [
        ...new Set((deals || []).map((d: any) => d.created_by).filter(Boolean)),
      ];

      const [{ data: synds }, { data: creators }] = await Promise.all([
        syndicatorIds.length
          ? supabase
              .from('syndicator_profiles')
              .select('id, company_name, claimed_by')
              .in('id', syndicatorIds)
          : Promise.resolve({ data: [] as any[] }),
        creatorIds.length
          ? supabase.from('profiles').select('id, full_name, email').in('id', creatorIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const claimedIds = [
        ...new Set((synds || []).map((s: any) => s.claimed_by).filter(Boolean)),
      ];
      const { data: owners } = claimedIds.length
        ? await supabase.from('profiles').select('id, full_name, email').in('id', claimedIds)
        : { data: [] as any[] };

      const dealMap = new Map((deals || []).map((d: any) => [d.id, d]));
      const investorMap = new Map((investors || []).map((p: any) => [p.id, p]));
      const syndMap = new Map((synds || []).map((s: any) => [s.id, s]));
      const ownerMap = new Map([
        ...((owners || []).map((p: any) => [p.id, p] as const)),
        ...((creators || []).map((p: any) => [p.id, p] as const)),
      ]);

      setRows(
        (reqs || []).map((r) => {
          const deal = dealMap.get(r.deal_id) || null;
          const synd = deal?.syndicator_id ? syndMap.get(deal.syndicator_id) : null;
          const ownerId = synd?.claimed_by || deal?.created_by || null;
          return {
            ...r,
            deal,
            investor: investorMap.get(r.user_id) || null,
            owner: ownerId ? ownerMap.get(ownerId) || null : null,
            syndicatorName: synd?.company_name || null,
          };
        })
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

  async function updateStatus(id: string, status: InterestStatus) {
    try {
      setUpdatingId(id);
      setError(null);
      const { error: updErr } = await supabase
        .from('investment_requests')
        .update({ status })
        .eq('id', id);
      if (updErr) throw updErr;
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (e) {
      console.error('Status update failed:', e);
      setError(
        e instanceof Error
          ? e.message
          : 'Could not update status. Admin update policy may still need SQL apply.'
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = [
        r.investor?.full_name,
        r.investor?.email,
        r.deal?.title,
        r.deal?.slug,
        r.owner?.full_name,
        r.owner?.email,
        r.syndicatorName,
        r.status,
        r.amount != null ? String(r.amount) : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query]);

  const totalAmount = filtered.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const pendingCount = filtered.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-emerald-600" />
            Investment Interest
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Platform-wide deal interest — independent of who owns the deal inbox
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search investor, deal, owner..."
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={load}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="text-2xl font-bold text-gray-900">{filtered.length}</div>
          <div className="text-sm text-gray-500">Shown requests</div>
        </div>
        <div className="bg-white border border-emerald-100 rounded-xl p-4">
          <div className="text-2xl font-bold text-emerald-700">{pendingCount}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white border border-blue-100 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-700">${totalAmount.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Total interest amount</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((s) => (
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
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            No investment interest yet
            {statusFilter !== 'all' ? ` with status “${statusFilter}”` : ''}
            {query ? ` matching “${query}”` : ''}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    When
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Investor
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Deal / Owner
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r) => (
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
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        {r.investor?.full_name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">{r.investor?.email || '—'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-gray-900">{r.deal?.title || 'Unknown deal'}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3" />
                        {r.syndicatorName || 'Syndicator'}
                        {r.owner?.full_name || r.owner?.email
                          ? ` · owner ${r.owner?.full_name || r.owner?.email}`
                          : ' · unclaimed'}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-emerald-700 whitespace-nowrap">
                      {r.amount != null ? `$${Number(r.amount).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${statusClasses(
                          r.status
                        )}`}
                      >
                        {r.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {r.investor?.email && (
                          <a
                            href={`mailto:${r.investor.email}?subject=${encodeURIComponent(
                              `Re: Your interest in ${r.deal?.title || 'EquityMD deal'}`
                            )}`}
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
                        {r.status === 'pending' && (
                          <>
                            <button
                              disabled={updatingId === r.id}
                              onClick={() => updateStatus(r.id, 'approved')}
                              className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-900 disabled:opacity-50"
                              title="Mark approved"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approve
                            </button>
                            <button
                              disabled={updatingId === r.id}
                              onClick={() => updateStatus(r.id, 'rejected')}
                              className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                              title="Mark rejected"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          </>
                        )}
                        {r.status && r.status !== 'pending' && (
                          <button
                            disabled={updatingId === r.id}
                            onClick={() => updateStatus(r.id, 'pending')}
                            className="inline-flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900 disabled:opacity-50"
                            title="Reopen as pending"
                          >
                            <Clock3 className="h-3.5 w-3.5" />
                            Reopen
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
    </div>
  );
}
