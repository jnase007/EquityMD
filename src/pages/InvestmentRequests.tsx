import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  DollarSign, Building2, User, Clock, CheckCircle, XCircle, 
  MessageSquare, Filter, TrendingUp, ArrowUpRight, Bell,
  ChevronDown, MoreHorizontal, Mail, Phone, Calendar,
  Sparkles, AlertCircle, RefreshCw
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface InvestmentRequest {
  id: string;
  deal_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  created_at: string;
  updated_at: string;
  deal?: {
    id: string;
    title: string;
    slug: string;
    cover_image_url: string;
  };
  investor?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
    phone_number: string;
  };
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export function InvestmentRequests() {
  const { user, profile, syndicator } = useAuthStore();
  const [requests, setRequests] = useState<InvestmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedRequest, setSelectedRequest] = useState<InvestmentRequest | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    if (user && syndicator) {
      fetchInvestmentRequests();
      
      // Subscribe to real-time updates
      const subscription = supabase
        .channel('investment-requests-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'investment_requests',
        }, () => {
          fetchInvestmentRequests();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, syndicator]);

  async function fetchInvestmentRequests() {
    if (!syndicator?.id) return;

    try {
      // First get deals for this syndicator
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('id, title, slug, cover_image_url')
        .eq('syndicator_id', syndicator.id);

      if (dealsError) throw dealsError;
      if (!deals || deals.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const dealIds = deals.map(d => d.id);

      // Get investment requests for these deals
      const { data: requestsData, error: requestsError } = await supabase
        .from('investment_requests')
        .select('*')
        .in('deal_id', dealIds)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Get investor profiles
      const investorIds = [...new Set(requestsData?.map(r => r.user_id) || [])];
      const { data: investorProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, phone_number')
        .in('id', investorIds);

      // Combine data
      const enrichedRequests = requestsData?.map(request => ({
        ...request,
        deal: deals.find(d => d.id === request.deal_id),
        investor: investorProfiles?.find(p => p.id === request.user_id),
      })) || [];

      setRequests(enrichedRequests);

      // Calculate stats
      const pending = enrichedRequests.filter(r => r.status === 'pending').length;
      const approved = enrichedRequests.filter(r => r.status === 'approved').length;
      const totalAmount = enrichedRequests
        .filter(r => r.status !== 'rejected')
        .reduce((sum, r) => sum + r.amount, 0);

      setStats({
        total: enrichedRequests.length,
        pending,
        approved,
        totalAmount,
      });

    } catch (error) {
      console.error('Error fetching investment requests:', error);
      toast.error('Failed to load investment requests');
    } finally {
      setLoading(false);
    }
  }

  async function updateRequestStatus(requestId: string, newStatus: 'approved' | 'rejected') {
    try {
      const { error } = await supabase
        .from('investment_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: newStatus } : r
      ));

      // Get the request to notify the investor
      const request = requests.find(r => r.id === requestId);
      if (request?.investor?.id) {
        // Create notification for investor
        await supabase
          .from('notifications')
          .insert({
            user_id: request.investor.id,
            type: 'investment_status',
            title: newStatus === 'approved' 
              ? '🎉 Investment Request Approved!' 
              : 'Investment Request Update',
            content: newStatus === 'approved'
              ? `Your investment request of ${formatCurrency(request.amount)} for ${request.deal?.title} has been approved!`
              : `Your investment request for ${request.deal?.title} has been updated.`,
            data: {
              deal_id: request.deal_id,
              deal_slug: request.deal?.slug,
              status: newStatus,
            },
            read: false
          });
      }

      toast.success(
        newStatus === 'approved' 
          ? '✅ Investment request approved!' 
          : 'Investment request updated'
      );

      setShowActionMenu(null);
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredRequests = requests.filter(r => 
    statusFilter === 'all' || r.status === statusFilter
  );

  // Redirect if not a syndicator
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (profile?.user_type !== 'syndicator') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-emerald-600" />
                Investment Requests
              </h1>
              <p className="text-gray-600 mt-1">
                Manage investor interest in your deals
              </p>
            </div>
            
            <button
              onClick={fetchInvestmentRequests}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Requests</p>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            <p className="text-sm text-gray-500">Pending Review</p>
            {stats.pending > 0 && (
              <span className="absolute top-3 right-3 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
            )}
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            <p className="text-sm text-gray-500">Approved</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 shadow-sm text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
            <p className="text-sm text-emerald-100">Total Interest</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Filter:</span>
            </div>
            
            {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === filter
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                {filter === 'pending' && stats.pending > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                    {stats.pending}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading investment requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {statusFilter === 'all' ? 'No Investment Requests Yet' : `No ${statusFilter} Requests`}
            </h3>
            <p className="text-gray-500 mb-4">
              {statusFilter === 'all' 
                ? 'Investment requests from interested investors will appear here.'
                : `You don't have any ${statusFilter} investment requests.`}
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Go to Dashboard
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div 
                key={request.id}
                className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
                  request.status === 'pending' ? 'border-amber-200' : 'border-gray-100'
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Deal Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        {request.deal?.cover_image_url ? (
                          <img 
                            src={request.deal.cover_image_url} 
                            alt={request.deal.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <Link 
                          to={`/deals/${request.deal?.slug}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {request.deal?.title || 'Unknown Deal'}
                        </Link>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Investor Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        {request.investor?.avatar_url ? (
                          <img 
                            src={request.investor.avatar_url} 
                            alt={request.investor.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.investor?.full_name || 'Unknown Investor'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.investor?.email}
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-center lg:text-right">
                      <p className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(request.amount)}
                      </p>
                      <p className="text-sm text-gray-500">Investment Interest</p>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        request.status === 'pending' 
                          ? 'bg-amber-100 text-amber-700'
                          : request.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {request.status === 'pending' && <Clock className="h-3 w-3 inline mr-1" />}
                        {request.status === 'approved' && <CheckCircle className="h-3 w-3 inline mr-1" />}
                        {request.status === 'rejected' && <XCircle className="h-3 w-3 inline mr-1" />}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>

                      {request.status === 'pending' && (
                        <div className="relative">
                          <button
                            onClick={() => setShowActionMenu(
                              showActionMenu === request.id ? null : request.id
                            )}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="h-5 w-5 text-gray-500" />
                          </button>

                          {showActionMenu === request.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-2">
                              <button
                                onClick={() => updateRequestStatus(request.id, 'approved')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-emerald-50 text-emerald-700 flex items-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve Request
                              </button>
                              <button
                                onClick={() => updateRequestStatus(request.id, 'rejected')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-700 flex items-center gap-2"
                              >
                                <XCircle className="h-4 w-4" />
                                Decline Request
                              </button>
                              <hr className="my-2" />
                              <Link
                                to="/inbox"
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                              >
                                <MessageSquare className="h-4 w-4" />
                                Message Investor
                              </Link>
                              {request.investor?.phone_number && (
                                <a
                                  href={`tel:${request.investor.phone_number}`}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                                >
                                  <Phone className="h-4 w-4" />
                                  Call Investor
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {request.status !== 'pending' && (
                        <Link
                          to="/inbox"
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Message Investor"
                        >
                          <MessageSquare className="h-5 w-5 text-gray-500" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

