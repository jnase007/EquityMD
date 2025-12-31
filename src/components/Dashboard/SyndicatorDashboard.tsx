import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Building2, Users, TrendingUp, DollarSign, 
  MessageSquare, Eye, ChevronRight, BarChart3, 
  ArrowUpRight, Star, Clock, CheckCircle, AlertCircle,
  FileText, Sparkles, Trophy, Zap, Edit, MoreVertical,
  MapPin, Calendar, ExternalLink
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { useGamification } from '../Gamification/useGamification';
import { NextStepsCard } from '../Gamification/NextSteps';
import { AchievementsModal } from '../Gamification/AchievementsModal';
import { AchievementUnlocked } from '../Gamification/AchievementUnlocked';

export function SyndicatorDashboard() {
  const { user, profile } = useAuthStore();
  const gamification = useGamification();
  const [showAchievements, setShowAchievements] = useState(false);
  const [userSyndicators, setUserSyndicators] = useState<any[]>([]);
  const [selectedSyndicator, setSelectedSyndicator] = useState<string | null>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeDeals: 0,
    totalInvestors: 0,
    totalRaised: 0,
    pendingRequests: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserSyndicators();
    }
  }, [user]);

  useEffect(() => {
    if (selectedSyndicator) {
      fetchDashboardData();
    }
  }, [selectedSyndicator]);

  async function fetchUserSyndicators() {
    try {
      const { data, error } = await supabase
        .from('syndicators')
        .select('*')
        .eq('claimed_by', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setUserSyndicators(data || []);
      
      if (data && data.length > 0) {
        setSelectedSyndicator(data[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching syndicators:', error);
      setLoading(false);
    }
  }

  async function fetchDashboardData() {
    if (!selectedSyndicator) return;
    
    try {
      // Fetch deals for this syndicator
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select(`
          *,
          deal_interests (id),
          investment_requests (id, status, amount)
        `)
        .eq('syndicator_id', selectedSyndicator)
        .order('created_at', { ascending: false });

      if (dealsError) throw dealsError;
      
      setDeals(dealsData || []);

      // Calculate stats
      const activeDeals = dealsData?.filter(d => d.status === 'active').length || 0;
      const totalInvestors = new Set(
        dealsData?.flatMap(d => d.deal_interests?.map((i: any) => i.id) || [])
      ).size;
      const totalRaised = dealsData?.reduce((sum, d) => {
        const approved = d.investment_requests?.filter((r: any) => r.status === 'approved') || [];
        return sum + approved.reduce((s: number, r: any) => s + (r.amount || 0), 0);
      }, 0) || 0;
      const pendingRequests = dealsData?.reduce((sum, d) => {
        const pending = d.investment_requests?.filter((r: any) => r.status === 'pending') || [];
        return sum + pending.length;
      }, 0) || 0;

      // Fetch unread messages
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user!.id)
        .eq('is_read', false);

      setStats({
        activeDeals,
        totalInvestors,
        totalRaised,
        pendingRequests,
        unreadMessages: unreadCount || 0,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const selectedSyndicatorData = userSyndicators.find(s => s.id === selectedSyndicator);

  // No syndicators - prompt to create one
  if (!loading && userSyndicators.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Create Your Syndicator Profile</h2>
          <p className="text-gray-600 mb-6">
            Set up your company profile to start listing investment opportunities and connecting with accredited investors.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/25"
          >
            <Plus className="h-5 w-5" />
            Create Syndicator Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Syndicator Selector and Gamification */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Syndicator Logo with Level */}
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                {selectedSyndicatorData?.company_logo_url ? (
                  <img 
                    src={selectedSyndicatorData.company_logo_url} 
                    alt={selectedSyndicatorData.company_name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <Building2 className="h-7 w-7 text-white" />
                )}
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-lg">
                {gamification.level.icon}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {userSyndicators.length > 1 ? (
                  <select
                    value={selectedSyndicator || ''}
                    onChange={(e) => setSelectedSyndicator(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    {userSyndicators.map((s) => (
                      <option key={s.id} value={s.id} className="text-gray-900">
                        {s.company_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <h1 className="text-xl lg:text-2xl font-bold">
                    {selectedSyndicatorData?.company_name || 'Dashboard'}
                  </h1>
                )}
                {selectedSyndicatorData?.verification_status === 'verified' && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-emerald-100">
                <span className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-yellow-300" />
                  {gamification.totalPoints} pts
                </span>
                <span>•</span>
                <span>Level {gamification.level.level}: {gamification.level.title}</span>
                <span>•</span>
                <button 
                  onClick={() => setShowAchievements(true)}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <Trophy className="h-4 w-4" />
                  {gamification.achievementCount} badges
                </button>
              </div>
            </div>
          </div>
          
          <Link
            to="/deals/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
          >
            <Sparkles className="h-5 w-5" />
            Create New Listing
          </Link>
        </div>
        
        {/* Progress to next level */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-emerald-200 mb-1">
            <span>Progress to next level</span>
            <span>{gamification.progressToNextLevel}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${gamification.progressToNextLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Building2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.activeDeals}</p>
          <p className="text-sm text-gray-500">Active Deals</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalInvestors}</p>
          <p className="text-sm text-gray-500">Interested Investors</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRaised)}</p>
          <p className="text-sm text-gray-500">Total Raised</p>
        </div>

        <Link 
          to="/investment-requests"
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all group relative"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
          <p className="text-sm text-gray-500">Pending Requests</p>
          {stats.pendingRequests > 0 && (
            <span className="absolute top-3 right-3 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
          )}
        </Link>

        <Link 
          to="/inbox"
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group relative"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
          <p className="text-sm text-gray-500">Messages</p>
          {stats.unreadMessages > 0 && (
            <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </Link>
      </div>

      {/* Your Deals Section - Full Width */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Investment Listings</h2>
            <p className="text-gray-500">Manage and track your deals</p>
          </div>
          <Link 
            to="/deals/new" 
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create New Deal
          </Link>
        </div>
        
        {loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-12 border border-emerald-100 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Your First Deal</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              List your investment opportunity and start connecting with accredited investors on EquityMD.
            </p>
            <Link 
              to="/deals/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25"
            >
              <Sparkles className="h-5 w-5" />
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {deals.map((deal) => {
              const pendingCount = deal.investment_requests?.filter((r: any) => r.status === 'pending').length || 0;
              const interestCount = deal.deal_interests?.length || 0;
              const approvedAmount = deal.investment_requests?.filter((r: any) => r.status === 'approved')
                .reduce((sum: number, r: any) => sum + (r.amount || 0), 0) || 0;
              
              return (
                <div 
                  key={deal.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
                >
                  {/* Cover Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {deal.cover_image_url ? (
                      <img 
                        src={deal.cover_image_url} 
                        alt={deal.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5 ${
                        deal.status === 'active' 
                          ? 'bg-emerald-500 text-white'
                          : deal.status === 'draft'
                          ? 'bg-gray-700/80 text-white backdrop-blur'
                          : 'bg-amber-500 text-white'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          deal.status === 'active' ? 'bg-white animate-pulse' : 'bg-white/60'
                        }`} />
                        {deal.status === 'active' ? 'Live' : deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                      </span>
                    </div>
                    
                    {/* Pending Badge */}
                    {pendingCount > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1.5 bg-orange-500 text-white rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {pendingCount} Pending
                        </span>
                      </div>
                    )}
                    
                    {/* Hover Overlay with Actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-2">
                      <Link
                        to={`/deals/${deal.slug}/edit`}
                        className="px-4 py-2 bg-white text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1.5 shadow-lg"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>
                      <Link
                        to={`/deals/${deal.slug}`}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-1.5 shadow-lg"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Link>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 truncate group-hover:text-emerald-600 transition-colors">
                      {deal.title}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{deal.location || 'Location not set'}</span>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">
                          {deal.minimum_investment ? `$${(deal.minimum_investment / 1000).toFixed(0)}K` : '—'}
                        </p>
                        <p className="text-xs text-gray-500">Min. Invest</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-emerald-600">
                          {deal.target_irr ? `${deal.target_irr}%` : '—'}
                        </p>
                        <p className="text-xs text-gray-500">Target IRR</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">
                          {deal.investment_term ? `${deal.investment_term}yr` : '—'}
                        </p>
                        <p className="text-xs text-gray-500">Term</p>
                      </div>
                    </div>
                    
                    {/* Interest & Investment Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-gray-700">{interestCount}</span>
                          <span className="text-gray-400">interested</span>
                        </div>
                      </div>
                      
                      {approvedAmount > 0 && (
                        <div className="text-sm">
                          <span className="text-gray-500">Raised: </span>
                          <span className="font-semibold text-emerald-600">
                            ${(approvedAmount / 1000).toFixed(0)}K
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Add New Deal Card */}
            <Link
              to="/deals/new"
              className="group flex flex-col items-center justify-center min-h-[380px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:from-emerald-50 hover:to-teal-50 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 group-hover:shadow-xl group-hover:scale-110 transition-all">
                <Plus className="h-8 w-8 text-gray-400 group-hover:text-emerald-500 transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-600 group-hover:text-emerald-700 transition-colors">
                Add New Listing
              </h3>
              <p className="text-sm text-gray-400 group-hover:text-emerald-600 transition-colors">
                Create another deal
              </p>
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions & Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Profile Card */}
        {selectedSyndicatorData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Company Profile</h3>
              <Link to="/profile" className="text-emerald-600 hover:text-emerald-700 text-sm">
                Edit
              </Link>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  selectedSyndicatorData.verification_status === 'verified'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedSyndicatorData.verification_status === 'verified' ? 'Verified' : 'Pending'}
                </span>
              </div>
              {selectedSyndicatorData.years_in_business && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Experience</span>
                  <span className="font-medium">{selectedSyndicatorData.years_in_business} years</span>
                </div>
              )}
            </div>
            
            {selectedSyndicatorData.slug && (
              <Link
                to={`/syndicators/${selectedSyndicatorData.slug}`}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4" />
                View Profile
              </Link>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link 
              to="/investment-requests"
              className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg hover:from-emerald-500/30 hover:to-teal-500/30 transition-colors relative"
            >
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium">Investment Requests</span>
              {stats.pendingRequests > 0 && (
                <span className="absolute right-2 px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                  {stats.pendingRequests}
                </span>
              )}
            </Link>
            <Link 
              to="/inbox"
              className="flex items-center gap-3 p-2.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">Messages</span>
            </Link>
            <Link 
              to="/profile"
              className="flex items-center gap-3 p-2.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm">Manage Profile</span>
            </Link>
          </div>
        </div>

        {/* Gamification - Next Steps */}
        {gamification.nextSteps.some(s => !s.completed) && (
          <NextStepsCard
            steps={gamification.nextSteps}
            title="Grow Your Profile"
            subtitle="Complete to earn badges"
          />
        )}

        {/* Tips */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
              <Star className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-semibold text-emerald-900 mb-1">Pro Tip</h4>
              <p className="text-sm text-emerald-700">
                Listings with high-quality photos receive 3x more investor interest.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        achievements={gamification.achievements}
        totalPoints={gamification.totalPoints}
      />
      
      {/* Achievement Unlock Celebration */}
      {gamification.newAchievement && (
        <AchievementUnlocked
          achievement={gamification.newAchievement}
          onClose={gamification.clearNewAchievement}
        />
      )}
    </div>
  );
}

