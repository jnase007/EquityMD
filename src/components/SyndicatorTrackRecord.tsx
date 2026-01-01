import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Calendar, DollarSign, CheckCircle, 
  ArrowUp, BarChart3, Target, Award, Clock, Users
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PastDeal {
  id: string;
  name: string;
  location: string;
  property_type: string;
  irr_achieved: number;
  equity_multiple: number;
  investment_period: string;
  exit_year: number;
  total_raised: number;
  status: 'completed' | 'active' | 'exited';
}

interface TrackRecordStats {
  total_deals: number;
  exited_deals: number;
  avg_irr: number;
  avg_equity_multiple: number;
  total_raised: number;
  years_active: number;
}

interface SyndicatorTrackRecordProps {
  syndicatorId: string;
}

export function SyndicatorTrackRecord({ syndicatorId }: SyndicatorTrackRecordProps) {
  const [pastDeals, setPastDeals] = useState<PastDeal[]>([]);
  const [stats, setStats] = useState<TrackRecordStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrackRecord();
  }, [syndicatorId]);

  async function fetchTrackRecord() {
    try {
      // Fetch syndicator's deals
      const { data: deals } = await supabase
        .from('deals')
        .select('*')
        .eq('syndicator_id', syndicatorId);

      // Fetch syndicator info
      const { data: syndicator } = await supabase
        .from('syndicators')
        .select('years_in_business, created_at')
        .eq('id', syndicatorId)
        .single();

      // Calculate stats from deals
      const exitedDeals = deals?.filter(d => d.status === 'completed' || d.status === 'exited') || [];
      const activeDeals = deals?.filter(d => d.status === 'active') || [];

      const avgIrr = exitedDeals.length > 0
        ? exitedDeals.reduce((acc, d) => acc + (d.actual_irr || d.target_irr || 0), 0) / exitedDeals.length
        : 0;

      const avgMultiple = exitedDeals.length > 0
        ? exitedDeals.reduce((acc, d) => acc + (d.equity_multiple || 1.5), 0) / exitedDeals.length
        : 0;

      const totalRaised = deals?.reduce((acc, d) => acc + (d.total_equity || 0), 0) || 0;

      setStats({
        total_deals: deals?.length || 0,
        exited_deals: exitedDeals.length,
        avg_irr: avgIrr,
        avg_equity_multiple: avgMultiple,
        total_raised: totalRaised,
        years_active: syndicator?.years_in_business || 1,
      });

      // Create past deals list
      const pastDealsList: PastDeal[] = (deals || []).map(d => ({
        id: d.id,
        name: d.title,
        location: d.location,
        property_type: d.property_type,
        irr_achieved: d.actual_irr || d.target_irr,
        equity_multiple: d.equity_multiple || 1.5,
        investment_period: `${d.investment_term} years`,
        exit_year: new Date(d.created_at).getFullYear() + (d.investment_term || 3),
        total_raised: d.total_equity,
        status: d.status === 'active' ? 'active' : 'exited',
      }));

      setPastDeals(pastDealsList);
    } catch (error) {
      console.error('Error fetching track record:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats || stats.total_deals === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
        <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No track record data available yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Track Record</h3>
            <p className="text-white/80 text-sm">Historical performance data</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total_deals}</div>
            <div className="text-sm text-gray-500">Total Deals</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.avg_irr.toFixed(1)}%</div>
            <div className="text-sm text-gray-500">Avg IRR</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.avg_equity_multiple.toFixed(2)}x</div>
            <div className="text-sm text-gray-500">Avg Multiple</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.total_raised)}</div>
            <div className="text-sm text-gray-500">Total Raised</div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Performance</div>
              <div className="font-bold text-gray-900">
                {stats.avg_irr >= 15 ? 'Excellent' : stats.avg_irr >= 10 ? 'Good' : 'Average'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Years Active</div>
              <div className="font-bold text-gray-900">{stats.years_active}+ years</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="p-2 bg-amber-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Completed Exits</div>
              <div className="font-bold text-gray-900">{stats.exited_deals} deals</div>
            </div>
          </div>
        </div>

        {/* Past Deals List */}
        {pastDeals.length > 0 && (
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Deal History</h4>
            <div className="space-y-3">
              {pastDeals.slice(0, 5).map((deal) => (
                <div key={deal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-gray-900">{deal.name}</h5>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        deal.status === 'active' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {deal.status === 'active' ? 'Active' : 'Exited'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{deal.property_type}</span>
                      <span>•</span>
                      <span>{deal.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600">{deal.irr_achieved}% IRR</div>
                    <div className="text-sm text-gray-500">{deal.equity_multiple}x</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-amber-50 rounded-xl">
          <p className="text-xs text-amber-700">
            <strong>Disclaimer:</strong> Past performance is not indicative of future results. 
            All investments carry risk. Please review offering documents carefully before investing.
          </p>
        </div>
      </div>
    </div>
  );
}

