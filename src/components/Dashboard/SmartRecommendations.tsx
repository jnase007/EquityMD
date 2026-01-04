import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, MapPin, Building2, CheckCircle, TrendingUp, Clock, ArrowRight, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Deal {
  id: string;
  title: string;
  slug: string;
  location: string;
  property_type: string;
  target_irr: number;
  minimum_investment: number;
  cover_image_url: string;
  closing_date?: string;
  syndicators?: {
    company_name: string;
    verification_status: string;
  };
}

interface SmartRecommendationsProps {
  userId: string;
  preferredTypes?: string[];
  preferredLocations?: string[];
  investmentMin?: number;
  investmentMax?: number;
}

export function SmartRecommendations({
  userId,
  preferredTypes = [],
  preferredLocations = [],
  investmentMin,
  investmentMax
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'matched' | 'closing_soon' | 'popular'>('matched');

  useEffect(() => {
    fetchRecommendations();
  }, [activeFilter, preferredTypes, preferredLocations]);

  async function fetchRecommendations() {
    setLoading(true);
    try {
      let query = supabase
        .from('deals')
        .select(`
          *,
          syndicators (
            company_name,
            verification_status
          )
        `)
        .eq('status', 'active');

      if (activeFilter === 'matched' && preferredTypes.length > 0) {
        query = query.in('property_type', preferredTypes);
      }

      if (activeFilter === 'closing_soon') {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        query = query
          .not('closing_date', 'is', null)
          .lte('closing_date', thirtyDaysFromNow.toISOString())
          .order('closing_date', { ascending: true });
      } else if (activeFilter === 'popular') {
        query = query.order('view_count', { ascending: false, nullsFirst: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(4);

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const getDaysUntilClose = (closingDate: string) => {
    const days = Math.ceil((new Date(closingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const filters = [
    { id: 'matched', label: 'My Filters', icon: <Filter className="h-3.5 w-3.5" /> },
    { id: 'closing_soon', label: 'Closing Soon', icon: <Clock className="h-3.5 w-3.5" /> },
    { id: 'popular', label: 'Most Viewed', icon: <TrendingUp className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
            <SlidersHorizontal className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Deals Matching Your Filters</h2>
            <p className="text-sm text-gray-600">
              {preferredTypes.length > 0 
                ? `Filtered by: ${preferredTypes.slice(0, 2).join(', ')}`
                : 'Set your investment filters in profile settings'}
            </p>
          </div>
        </div>
        
        {/* Filter Pills */}
        <div className="flex gap-2">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {filter.icon}
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <Filter className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No deals match this filter</p>
          <Link to="/find" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
            Browse all deals
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((deal) => (
            <Link
              key={deal.id}
              to={`/deals/${deal.slug}`}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-blue-200"
            >
              {/* Image */}
              <div className="h-32 bg-gray-100 relative overflow-hidden">
                {deal.cover_image_url ? (
                  <img
                    src={deal.cover_image_url}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                    <Building2 className="h-10 w-10 text-blue-300" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {deal.syndicators?.verification_status === 'verified' && (
                    <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Verified
                    </span>
                  )}
                  {deal.closing_date && getDaysUntilClose(deal.closing_date) <= 14 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {getDaysUntilClose(deal.closing_date)}d left
                    </span>
                  )}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {deal.title}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" /> {deal.location || 'Location TBD'}
                </p>
                
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-blue-600 font-bold">
                    {deal.target_irr}% IRR
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatCurrency(deal.minimum_investment)} min
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* View All Link */}
      <div className="mt-6 text-center">
        <Link
          to="/find"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          View All Deals
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

