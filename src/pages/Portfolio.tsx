import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, DollarSign, TrendingUp, Calendar, Building2,
  PieChart, ArrowUpRight, ArrowDownRight, Clock, CheckCircle,
  AlertCircle, Download, ChevronRight, Filter, BarChart3
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface Investment {
  id: string;
  deal_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'funded' | 'active' | 'completed';
  invested_at: string;
  deal: {
    id: string;
    title: string;
    slug: string;
    location: string;
    cover_image_url: string | null;
    target_irr: number | null;
    investment_term: number | null;
    status: string;
    syndicator: {
      company_name: string;
      company_logo_url: string | null;
    };
  };
  distributions: Distribution[];
}

interface Distribution {
  id: string;
  amount: number;
  type: 'quarterly' | 'annual' | 'sale' | 'refinance';
  distributed_at: string;
  notes: string | null;
}

interface PortfolioStats {
  totalInvested: number;
  totalDistributions: number;
  activeInvestments: number;
  averageIrr: number;
  unrealizedValue: number;
}

export function Portfolio() {
  const { user } = useAuthStore();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({
    totalInvested: 0,
    totalDistributions: 0,
    activeInvestments: 0,
    averageIrr: 0,
    unrealizedValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    if (user) {
      fetchPortfolio();
    }
  }, [user]);

  async function fetchPortfolio() {
    if (!user) return;

    try {
      // Fetch investments with deal details
      const { data: investmentData, error } = await supabase
        .from('investments')
        .select(`
          *,
          deal:deals (
            id,
            title,
            slug,
            location,
            cover_image_url,
            target_irr,
            investment_term,
            status,
            syndicator:syndicators (
              company_name,
              company_logo_url
            )
          ),
          distributions:investment_distributions (
            id,
            amount,
            type,
            distributed_at,
            notes
          )
        `)
        .eq('user_id', user.id)
        .order('invested_at', { ascending: false });

      if (error) throw error;

      const investments = investmentData || [];
      setInvestments(investments);

      // Calculate stats
      const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
      const totalDistributions = investments.reduce((sum, inv) => 
        sum + (inv.distributions?.reduce((dSum: number, d: Distribution) => dSum + d.amount, 0) || 0), 0
      );
      const activeInvestments = investments.filter(inv => 
        ['approved', 'funded', 'active'].includes(inv.status)
      ).length;
      const avgIrr = investments.length > 0
        ? investments.reduce((sum, inv) => sum + (inv.deal?.target_irr || 0), 0) / investments.length
        : 0;

      setStats({
        totalInvested,
        totalDistributions,
        activeInvestments,
        averageIrr: avgIrr,
        unrealizedValue: totalInvested * 1.15, // Placeholder - would come from actual valuations
      });
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Approved</span>;
      case 'funded':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Funded</span>;
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">Completed</span>;
      default:
        return null;
    }
  };

  const filteredInvestments = investments.filter(inv => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['approved', 'funded', 'active'].includes(inv.status);
    if (filter === 'completed') return inv.status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Portfolio</h1>
          <p className="text-gray-600">Track your investments, distributions, and performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-gray-500 text-sm">Total Invested</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalInvested)}</p>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-gray-500 text-sm">Distributions</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalDistributions)}</p>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <PieChart className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-gray-500 text-sm">Est. Value</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.unrealizedValue)}</p>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-gray-500 text-sm">Avg. Target IRR</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{stats.averageIrr.toFixed(1)}%</p>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-gray-500 text-sm">Active Deals</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.activeInvestments}</p>
          </div>
        </div>

        {/* Investments List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your Investments</h2>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'active' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'completed' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : filteredInvestments.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No investments yet</h3>
              <p className="text-gray-500 mb-6">Browse deals and make your first investment</p>
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
              {filteredInvestments.map((investment) => {
                const totalDistributions = investment.distributions?.reduce((sum, d) => sum + d.amount, 0) || 0;
                const roi = ((totalDistributions / investment.amount) * 100).toFixed(1);
                
                return (
                  <div key={investment.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Deal Image */}
                      <div className="w-24 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {investment.deal?.cover_image_url ? (
                          <img 
                            src={investment.deal.cover_image_url} 
                            alt={investment.deal.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      
                      {/* Deal Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Link 
                              to={`/deals/${investment.deal?.slug}`}
                              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {investment.deal?.title}
                            </Link>
                            <p className="text-sm text-gray-500">{investment.deal?.location}</p>
                          </div>
                          {getStatusBadge(investment.status)}
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-gray-500">Invested:</span>
                            <span className="ml-1 font-semibold text-gray-900">
                              {formatCurrency(investment.amount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Target IRR:</span>
                            <span className="ml-1 font-semibold text-emerald-600">
                              {investment.deal?.target_irr || 0}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Distributions:</span>
                            <span className="ml-1 font-semibold text-green-600">
                              {formatCurrency(totalDistributions)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">ROI:</span>
                            <span className={`ml-1 font-semibold ${parseFloat(roi) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {roi}%
                            </span>
                          </div>
                        </div>
                        
                        {/* Distribution History */}
                        {investment.distributions && investment.distributions.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-2">Recent Distributions:</p>
                            <div className="flex flex-wrap gap-2">
                              {investment.distributions.slice(0, 3).map((dist) => (
                                <span 
                                  key={dist.id}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                                >
                                  <ArrowUpRight className="h-3 w-3" />
                                  {formatCurrency(dist.amount)} • {new Date(dist.distributed_at).toLocaleDateString()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Link
                          to={`/deals/${investment.deal?.slug}`}
                          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          View Deal
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

