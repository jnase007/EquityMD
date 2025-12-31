import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Search, Filter, ChevronRight, MessageSquare,
  DollarSign, Clock, CheckCircle, AlertCircle, Phone,
  Mail, Calendar, Building2, TrendingUp, Loader2,
  ChevronDown, Eye, Star
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

interface PipelineInvestor {
  id: string;
  investor_id: string;
  deal_id: string | null;
  stage: 'interested' | 'contacted' | 'qualified' | 'negotiating' | 'committed' | 'funded';
  notes: string | null;
  last_contact_at: string | null;
  created_at: string;
  investor: {
    id: string;
    email: string;
    profile: {
      full_name: string;
      avatar_url: string | null;
      phone: string | null;
    } | null;
    accreditation: {
      status: string;
    } | null;
  };
  deal: {
    id: string;
    title: string;
    slug: string;
  } | null;
  investment_requests: {
    amount: number;
    status: string;
  }[];
}

const PIPELINE_STAGES = [
  { value: 'interested', label: 'Interested', color: 'bg-gray-100 text-gray-700', icon: Eye },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-700', icon: MessageSquare },
  { value: 'qualified', label: 'Qualified', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
  { value: 'negotiating', label: 'Negotiating', color: 'bg-orange-100 text-orange-700', icon: TrendingUp },
  { value: 'committed', label: 'Committed', color: 'bg-emerald-100 text-emerald-700', icon: Star },
  { value: 'funded', label: 'Funded', color: 'bg-green-100 text-green-700', icon: DollarSign },
];

export function InvestorPipeline() {
  const { user } = useAuthStore();
  const [investors, setInvestors] = useState<PipelineInvestor[]>([]);
  const [loading, setLoading] = useState(true);
  const [syndicatorId, setSyndicatorId] = useState<string | null>(null);
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterDeal, setFilterDeal] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchSyndicatorAndData();
    }
  }, [user]);

  async function fetchSyndicatorAndData() {
    try {
      // Get user's syndicator
      const { data: syndicatorData } = await supabase
        .from('syndicators')
        .select('id')
        .eq('claimed_by', user!.id)
        .single();

      if (!syndicatorData) {
        setLoading(false);
        return;
      }

      setSyndicatorId(syndicatorData.id);

      // Fetch deals
      const { data: dealsData } = await supabase
        .from('deals')
        .select('id, title, slug')
        .eq('syndicator_id', syndicatorData.id);

      setDeals(dealsData || []);

      // Fetch pipeline investors
      await fetchInvestors(syndicatorData.id);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchInvestors(syncId: string) {
    try {
      // Get all deal interests for syndicator's deals
      const { data: interests } = await supabase
        .from('deal_interests')
        .select(`
          id,
          user_id,
          deal_id,
          created_at,
          deal:deals!inner (
            id,
            title,
            slug,
            syndicator_id
          )
        `)
        .eq('deal.syndicator_id', syncId);

      // Get investment requests
      const { data: requests } = await supabase
        .from('investment_requests')
        .select(`
          id,
          user_id,
          deal_id,
          amount,
          status,
          created_at,
          deal:deals!inner (
            id,
            title,
            slug,
            syndicator_id
          )
        `)
        .eq('deal.syndicator_id', syncId);

      // Get pipeline data
      const { data: pipelineData } = await supabase
        .from('investor_pipeline')
        .select('*')
        .eq('syndicator_id', syncId);

      // Get profiles for all unique users
      const userIds = new Set([
        ...(interests?.map(i => i.user_id) || []),
        ...(requests?.map(r => r.user_id) || []),
      ]);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, phone')
        .in('id', Array.from(userIds));

      const { data: accreditations } = await supabase
        .from('investor_accreditation')
        .select('user_id, status')
        .in('user_id', Array.from(userIds));

      // Build investor list
      const investorMap = new Map<string, PipelineInvestor>();

      interests?.forEach(interest => {
        const profile = profiles?.find(p => p.id === interest.user_id);
        const accred = accreditations?.find(a => a.user_id === interest.user_id);
        const pipeline = pipelineData?.find(p => p.investor_id === interest.user_id && p.deal_id === interest.deal_id);
        const investorRequests = requests?.filter(r => r.user_id === interest.user_id && r.deal_id === interest.deal_id) || [];

        const key = `${interest.user_id}-${interest.deal_id}`;
        if (!investorMap.has(key)) {
          investorMap.set(key, {
            id: pipeline?.id || interest.id,
            investor_id: interest.user_id,
            deal_id: interest.deal_id,
            stage: pipeline?.stage || (investorRequests.length > 0 ? 'negotiating' : 'interested'),
            notes: pipeline?.notes || null,
            last_contact_at: pipeline?.last_contact_at || null,
            created_at: interest.created_at,
            investor: {
              id: interest.user_id,
              email: '', // Would need to fetch from auth.users
              profile: profile || null,
              accreditation: accred || null,
            },
            deal: interest.deal as any,
            investment_requests: investorRequests.map(r => ({ amount: r.amount, status: r.status })),
          });
        }
      });

      setInvestors(Array.from(investorMap.values()));
    } catch (error) {
      console.error('Error fetching investors:', error);
    }
  }

  async function updateStage(investorId: string, dealId: string, newStage: string) {
    if (!syndicatorId) return;

    try {
      // Upsert pipeline record
      const { error } = await supabase
        .from('investor_pipeline')
        .upsert({
          syndicator_id: syndicatorId,
          investor_id: investorId,
          deal_id: dealId,
          stage: newStage,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'syndicator_id,deal_id,investor_id'
        });

      if (error) throw error;

      toast.success(`Moved to ${PIPELINE_STAGES.find(s => s.value === newStage)?.label}`);
      fetchInvestors(syndicatorId);
    } catch (error) {
      console.error('Error updating stage:', error);
      toast.error('Failed to update stage');
    }
  }

  const filteredInvestors = investors.filter(inv => {
    if (filterStage !== 'all' && inv.stage !== filterStage) return false;
    if (filterDeal !== 'all' && inv.deal_id !== filterDeal) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const name = inv.investor.profile?.full_name?.toLowerCase() || '';
      return name.includes(search);
    }
    return true;
  });

  const stageCount = (stage: string) => investors.filter(i => i.stage === stage).length;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Investor Pipeline</h1>
          <p className="text-gray-600">Track and manage your investor relationships</p>
        </div>

        {/* Pipeline Stage Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {PIPELINE_STAGES.map(stage => (
            <button
              key={stage.value}
              onClick={() => setFilterStage(filterStage === stage.value ? 'all' : stage.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                filterStage === stage.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg ${stage.color} flex items-center justify-center mb-2`}>
                <stage.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stageCount(stage.value)}</p>
              <p className="text-sm text-gray-500">{stage.label}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search investors..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-0 focus:border-blue-500"
              />
            </div>
          </div>
          
          <select
            value={filterDeal}
            onChange={(e) => setFilterDeal(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-0 focus:border-blue-500"
          >
            <option value="all">All Deals</option>
            {deals.map(deal => (
              <option key={deal.id} value={deal.id}>{deal.title}</option>
            ))}
          </select>
          
          <button
            onClick={() => {
              setFilterStage('all');
              setFilterDeal('all');
              setSearchTerm('');
            }}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Investors List */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
            </div>
          ) : filteredInvestors.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No investors found</h3>
              <p className="text-gray-500">Investors will appear here when they express interest in your deals</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredInvestors.map((investor) => {
                const currentStage = PIPELINE_STAGES.find(s => s.value === investor.stage);
                const totalRequested = investor.investment_requests.reduce((sum, r) => sum + r.amount, 0);
                
                return (
                  <div key={`${investor.investor_id}-${investor.deal_id}`} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {investor.investor.profile?.avatar_url ? (
                          <img 
                            src={investor.investor.profile.avatar_url} 
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {investor.investor.profile?.full_name || 'Anonymous Investor'}
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              {investor.deal && (
                                <Link 
                                  to={`/deals/${investor.deal.slug}`}
                                  className="flex items-center gap-1 hover:text-blue-600"
                                >
                                  <Building2 className="h-3.5 w-3.5" />
                                  {investor.deal.title}
                                </Link>
                              )}
                              {investor.investor.accreditation?.status === 'verified' && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  Accredited
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Stage Dropdown */}
                          <div className="relative group">
                            <button className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 ${currentStage?.color}`}>
                              {currentStage?.label}
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10 hidden group-hover:block min-w-[160px]">
                              {PIPELINE_STAGES.map(stage => (
                                <button
                                  key={stage.value}
                                  onClick={() => updateStage(investor.investor_id, investor.deal_id || '', stage.value)}
                                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                                    investor.stage === stage.value ? 'bg-gray-50 font-medium' : ''
                                  }`}
                                >
                                  <div className={`w-6 h-6 rounded ${stage.color} flex items-center justify-center`}>
                                    <stage.icon className="h-3 w-3" />
                                  </div>
                                  {stage.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Stats Row */}
                        <div className="flex items-center gap-6 text-sm">
                          {totalRequested > 0 && (
                            <div className="flex items-center gap-1 text-emerald-600">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">{formatCurrency(totalRequested)}</span>
                              <span className="text-gray-400">requested</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-gray-500">
                            <Calendar className="h-4 w-4" />
                            First contact: {new Date(investor.created_at).toLocaleDateString()}
                          </div>
                          {investor.last_contact_at && (
                            <div className="flex items-center gap-1 text-gray-500">
                              <Clock className="h-4 w-4" />
                              Last: {new Date(investor.last_contact_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        {/* Notes */}
                        {investor.notes && (
                          <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {investor.notes}
                          </p>
                        )}
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="flex gap-2">
                        <Link
                          to={`/inbox?user=${investor.investor_id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Send message"
                        >
                          <MessageSquare className="h-5 w-5" />
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

