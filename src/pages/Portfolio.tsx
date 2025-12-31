import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Building2, MapPin, TrendingUp, DollarSign,
  MessageSquare, ChevronRight, Clock, CheckCircle, Heart,
  ExternalLink
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface DealInterest {
  id: string;
  deal_id: string;
  created_at: string;
  deal: {
    id: string;
    title: string;
    slug: string;
    location: string;
    cover_image_url: string | null;
    target_irr: number | null;
    minimum_investment: number | null;
    status: string;
    syndicator: {
      company_name: string;
      company_logo_url: string | null;
    };
  };
  investment_request: {
    amount: number;
    status: string;
    created_at: string;
  } | null;
}

export function Portfolio() {
  const { user } = useAuthStore();
  const [interests, setInterests] = useState<DealInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'requested' | 'contacted'>('all');

  useEffect(() => {
    if (user) {
      fetchInterests();
    }
  }, [user]);

  async function fetchInterests() {
    if (!user) return;

    try {
      // Fetch deal interests with deal details
      const { data: interestData, error } = await supabase
        .from('deal_interests')
        .select(`
          id,
          deal_id,
          created_at,
          deal:deals (
            id,
            title,
            slug,
            location,
            cover_image_url,
            target_irr,
            minimum_investment,
            status,
            syndicator:syndicators (
              company_name,
              company_logo_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch investment requests
      const { data: requestData } = await supabase
        .from('investment_requests')
        .select('deal_id, amount, status, created_at')
        .eq('user_id', user.id);

      // Combine data
      const combined = (interestData || []).map(interest => ({
        ...interest,
        investment_request: requestData?.find(r => r.deal_id === interest.deal_id) || null
      }));

      setInterests(combined);
    } catch (error) {
      console.error('Error fetching interests:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const getStatusBadge = (request: DealInterest['investment_request']) => {
    if (!request) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Interested</span>;
    }
    switch (request.status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Request Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Approved</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Contacted</span>;
    }
  };

  const filteredInterests = interests.filter(interest => {
    if (filter === 'all') return true;
    if (filter === 'requested') return interest.investment_request !== null;
    if (filter === 'contacted') return interest.investment_request === null;
    return true;
  });

  const stats = {
    total: interests.length,
    requested: interests.filter(i => i.investment_request).length,
    totalRequested: interests.reduce((sum, i) => sum + (i.investment_request?.amount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Interests</h1>
          <p className="text-gray-600">Track deals you're interested in and investment requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Heart className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-gray-500 text-sm">Deals Interested</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-gray-500 text-sm">Requests Sent</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.requested}</p>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-gray-500 text-sm">Total Interest</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRequested)}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your Deal Interests</h2>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('requested')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'requested' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Requested ({stats.requested})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : filteredInterests.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No deals yet</h3>
              <p className="text-gray-500 mb-6">Browse deals and express interest to track them here</p>
              <Link
                to="/find"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Browse Deals
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredInterests.map((interest) => (
                <div key={interest.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Deal Image */}
                    <Link 
                      to={`/deals/${interest.deal?.slug}`}
                      className="w-24 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0"
                    >
                      {interest.deal?.cover_image_url ? (
                        <img 
                          src={interest.deal.cover_image_url} 
                          alt={interest.deal.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                    </Link>
                    
                    {/* Deal Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Link 
                            to={`/deals/${interest.deal?.slug}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {interest.deal?.title}
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="h-3.5 w-3.5" />
                            {interest.deal?.location}
                            <span>•</span>
                            <span>{interest.deal?.syndicator?.company_name}</span>
                          </div>
                        </div>
                        {getStatusBadge(interest.investment_request)}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        {interest.deal?.minimum_investment && (
                          <div>
                            <span className="text-gray-500">Min:</span>
                            <span className="ml-1 font-semibold text-gray-900">
                              {formatCurrency(interest.deal.minimum_investment)}
                            </span>
                          </div>
                        )}
                        {interest.deal?.target_irr && (
                          <div>
                            <span className="text-gray-500">Target IRR:</span>
                            <span className="ml-1 font-semibold text-emerald-600">
                              {interest.deal.target_irr}%
                            </span>
                          </div>
                        )}
                        {interest.investment_request && (
                          <div>
                            <span className="text-gray-500">Your interest:</span>
                            <span className="ml-1 font-semibold text-blue-600">
                              {formatCurrency(interest.investment_request.amount)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        Interested {new Date(interest.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/deals/${interest.deal?.slug}`}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        View Deal
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This page tracks deals you've expressed interest in. 
            Actual investments and legal agreements are handled directly with each syndicator.
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
