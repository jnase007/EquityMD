import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Filter, ChevronDown, ChevronUp,
  Eye, Heart, MessageCircle, DollarSign, MapPin,
  Building2, TrendingUp, Star, Clock, Send,
  CheckCircle, XCircle, User, Mail
} from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';

interface InvestorProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  accredited_status: boolean;
  minimum_investment: number;
  preferred_property_types: string[];
  preferred_locations: string[];
  last_active?: string;
  deals_viewed: number;
  inquiries_sent: number;
  engagement_score: number;
}

interface DealView {
  deal_id: string;
  deal_title: string;
  viewed_at: string;
}

interface InvestorMatchingProps {
  syndicatorId: string;
  dealId?: string;
}

export function InvestorMatching({ syndicatorId, dealId }: InvestorMatchingProps) {
  const { user } = useAuthStore();
  const [investors, setInvestors] = useState<InvestorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorProfile | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    minInvestment: '',
    maxInvestment: '',
    accreditedOnly: true,
    propertyTypes: [] as string[],
    locations: [] as string[],
    sortBy: 'engagement' as 'engagement' | 'recent' | 'investment',
  });

  useEffect(() => {
    fetchInvestors();
  }, [syndicatorId, dealId]);

  const fetchInvestors = async () => {
    try {
      // Fetch investors who have viewed syndicator's deals or shown interest
      let query = supabase
        .from('investor_profiles')
        .select(`
          *,
          profiles:id (
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('accredited_status', true);

      const { data, error } = await query;
      if (error) throw error;

      // Calculate engagement scores and format data
      const formattedInvestors: InvestorProfile[] = (data || []).map((inv: any) => ({
        id: inv.id,
        user_id: inv.id,
        full_name: inv.profiles?.full_name || 'Anonymous Investor',
        email: inv.profiles?.email || '',
        avatar_url: inv.profiles?.avatar_url,
        accredited_status: inv.accredited_status,
        minimum_investment: inv.minimum_investment || 25000,
        preferred_property_types: inv.preferred_property_types || [],
        preferred_locations: inv.preferred_locations || [],
        last_active: inv.updated_at,
        deals_viewed: Math.floor(Math.random() * 20) + 1, // Simulated
        inquiries_sent: Math.floor(Math.random() * 5),    // Simulated
        engagement_score: Math.floor(Math.random() * 100), // Simulated
      }));

      setInvestors(formattedInvestors);
    } catch (error) {
      console.error('Error fetching investors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvestors = useMemo(() => {
    let result = [...investors];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(inv => 
        inv.full_name.toLowerCase().includes(query) ||
        inv.preferred_locations.some(loc => loc.toLowerCase().includes(query))
      );
    }

    // Filters
    if (filters.minInvestment) {
      result = result.filter(inv => inv.minimum_investment >= Number(filters.minInvestment));
    }
    if (filters.maxInvestment) {
      result = result.filter(inv => inv.minimum_investment <= Number(filters.maxInvestment));
    }
    if (filters.accreditedOnly) {
      result = result.filter(inv => inv.accredited_status);
    }
    if (filters.propertyTypes.length > 0) {
      result = result.filter(inv => 
        inv.preferred_property_types.some(type => filters.propertyTypes.includes(type))
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'engagement':
        result.sort((a, b) => b.engagement_score - a.engagement_score);
        break;
      case 'recent':
        result.sort((a, b) => 
          new Date(b.last_active || 0).getTime() - new Date(a.last_active || 0).getTime()
        );
        break;
      case 'investment':
        result.sort((a, b) => b.minimum_investment - a.minimum_investment);
        break;
    }

    return result;
  }, [investors, searchQuery, filters]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getEngagementLevel = (score: number) => {
    if (score >= 80) return { label: 'Hot Lead', color: 'text-red-600', bg: 'bg-red-100' };
    if (score >= 60) return { label: 'Warm', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (score >= 40) return { label: 'Interested', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'New', color: 'text-blue-600', bg: 'bg-blue-100' };
  };

  const propertyTypes = ['Multifamily', 'Office', 'Retail', 'Industrial', 'Mixed-Use', 'Self-Storage'];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Investor Matching</h3>
              <p className="text-white/80 text-sm">Find investors for your deals</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-white/20 rounded-full text-white text-sm">
            {filteredInvestors.length} investors
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 border-b">
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search investors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition ${
              showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Investment
              </label>
              <select
                value={filters.minInvestment}
                onChange={(e) => setFilters(prev => ({ ...prev, minInvestment: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="">Any</option>
                <option value="25000">$25,000+</option>
                <option value="50000">$50,000+</option>
                <option value="100000">$100,000+</option>
                <option value="250000">$250,000+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="engagement">Engagement Score</option>
                <option value="recent">Recently Active</option>
                <option value="investment">Investment Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Interests
              </label>
              <div className="flex flex-wrap gap-1">
                {propertyTypes.slice(0, 4).map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        propertyTypes: prev.propertyTypes.includes(type)
                          ? prev.propertyTypes.filter(t => t !== type)
                          : [...prev.propertyTypes, type]
                      }));
                    }}
                    className={`px-2 py-1 text-xs rounded-full transition ${
                      filters.propertyTypes.includes(type)
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Investors List */}
      <div className="max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading investors...</div>
        ) : filteredInvestors.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">No Matching Investors</h4>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredInvestors.map(investor => {
              const engagement = getEngagementLevel(investor.engagement_score);
              
              return (
                <div 
                  key={investor.id}
                  className="p-4 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setSelectedInvestor(investor)}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    {investor.avatar_url ? (
                      <img 
                        src={investor.avatar_url} 
                        alt={investor.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                        {investor.full_name.charAt(0)}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{investor.full_name}</h4>
                        {investor.accredited_status && (
                          <CheckCircle className="h-4 w-4 text-emerald-500" title="Accredited" />
                        )}
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${engagement.bg} ${engagement.color}`}>
                          {engagement.label}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(investor.minimum_investment)}+ min
                        </span>
                        {investor.preferred_locations.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {investor.preferred_locations.slice(0, 2).join(', ')}
                          </span>
                        )}
                      </div>

                      {investor.preferred_property_types.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {investor.preferred_property_types.slice(0, 3).map(type => (
                            <span 
                              key={type}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="text-right hidden md:block">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1" title="Deals Viewed">
                          <Eye className="h-4 w-4" />
                          {investor.deals_viewed}
                        </span>
                        <span className="flex items-center gap-1" title="Inquiries Sent">
                          <MessageCircle className="h-4 w-4" />
                          {investor.inquiries_sent}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Score: {investor.engagement_score}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Investor Detail Modal */}
      {selectedInvestor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  {selectedInvestor.avatar_url ? (
                    <img 
                      src={selectedInvestor.avatar_url} 
                      alt={selectedInvestor.full_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                      {selectedInvestor.full_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedInvestor.full_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedInvestor.accredited_status && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                          Accredited
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInvestor(null)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(selectedInvestor.minimum_investment)}
                  </div>
                  <div className="text-xs text-gray-500">Min Investment</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedInvestor.deals_viewed}
                  </div>
                  <div className="text-xs text-gray-500">Deals Viewed</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-600">
                    {selectedInvestor.engagement_score}
                  </div>
                  <div className="text-xs text-gray-500">Engagement</div>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-4 mb-6">
                {selectedInvestor.preferred_property_types.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Property Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedInvestor.preferred_property_types.map(type => (
                        <span key={type} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedInvestor.preferred_locations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Preferred Locations</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedInvestor.preferred_locations.map(loc => (
                        <span key={loc} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {loc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Deal Update
                </button>
                <button className="px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition">
                  <Mail className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hot Leads Widget for Dashboard
export function HotLeadsWidget({ syndicatorId }: { syndicatorId: string }) {
  const [hotLeads, setHotLeads] = useState<InvestorProfile[]>([]);

  useEffect(() => {
    // Fetch top engaged investors - simulated
    setHotLeads([
      {
        id: '1',
        user_id: '1',
        full_name: 'John Smith',
        email: 'john@example.com',
        accredited_status: true,
        minimum_investment: 100000,
        preferred_property_types: ['Multifamily'],
        preferred_locations: ['Texas'],
        deals_viewed: 12,
        inquiries_sent: 3,
        engagement_score: 92,
      },
      {
        id: '2',
        user_id: '2',
        full_name: 'Sarah Johnson',
        email: 'sarah@example.com',
        accredited_status: true,
        minimum_investment: 250000,
        preferred_property_types: ['Office'],
        preferred_locations: ['California'],
        deals_viewed: 8,
        inquiries_sent: 2,
        engagement_score: 85,
      },
    ]);
  }, [syndicatorId]);

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-orange-600" />
          <span className="font-medium text-orange-800">Hot Leads</span>
        </div>
        <span className="text-xs text-orange-600">Top engaged</span>
      </div>
      <div className="space-y-2">
        {hotLeads.map(lead => (
          <div key={lead.id} className="flex items-center gap-3 p-2 bg-white rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-sm font-bold">
              {lead.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{lead.full_name}</div>
              <div className="text-xs text-gray-500">{lead.deals_viewed} views</div>
            </div>
            <div className="text-sm font-bold text-orange-600">{lead.engagement_score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

