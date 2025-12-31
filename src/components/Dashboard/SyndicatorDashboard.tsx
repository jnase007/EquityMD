import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Building2, Users, TrendingUp, DollarSign, 
  MessageSquare, Eye, CheckCircle, AlertCircle,
  Sparkles, Trophy, Zap, Edit, MapPin, ExternalLink,
  Camera, Clock, ArrowRight, Globe, Upload
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { useGamification } from '../Gamification/useGamification';
import { AchievementsModal } from '../Gamification/AchievementsModal';
import { AchievementUnlocked } from '../Gamification/AchievementUnlocked';
import toast from 'react-hot-toast';

export function SyndicatorDashboard() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const gamification = useGamification();
  const [showAchievements, setShowAchievements] = useState(false);
  const [syndicator, setSyndicator] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeDeals: 0,
    totalInvestors: 0,
    totalRaised: 0,
    pendingRequests: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateBusiness, setShowCreateBusiness] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    try {
      // Fetch syndicator (just get the first one - single business model)
      const { data: syndicatorData, error: syndicatorError } = await supabase
        .from('syndicators')
        .select('*')
        .eq('claimed_by', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (syndicatorError && syndicatorError.code !== 'PGRST116') {
        console.error('Error fetching syndicator:', syndicatorError);
      }

      setSyndicator(syndicatorData || null);

      if (syndicatorData) {
        // Fetch deals for this syndicator
        const { data: dealsData, error: dealsError } = await supabase
          .from('deals')
          .select(`
            *,
            deal_interests (id),
            investment_requests (id, status, amount)
          `)
          .eq('syndicator_id', syndicatorData.id)
          .order('created_at', { ascending: false });

        if (dealsError) throw dealsError;
        setDeals(dealsData || []);

        // Calculate stats
        const activeDeals = dealsData?.filter(d => d.status === 'active').length || 0;
        const totalInvestors = dealsData?.reduce((sum, d) => sum + (d.deal_interests?.length || 0), 0) || 0;
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
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createBusiness() {
    if (!newBusinessName.trim() || !user) return;
    
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('syndicators')
        .insert([{
          company_name: newBusinessName.trim(),
          claimed_by: user.id,
          claimed_at: new Date().toISOString(),
          claimable: false,
          verification_status: 'unverified',
        }])
        .select()
        .single();

      if (error) throw error;
      
      setSyndicator(data);
      setShowCreateBusiness(false);
      setNewBusinessName('');
      toast.success('Business created! Now add your first deal.');
    } catch (error: any) {
      console.error('Error creating business:', error);
      toast.error(error.message || 'Failed to create business');
    } finally {
      setCreating(false);
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-gray-200 rounded-2xl" />
        <div className="h-24 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  // No business yet - show setup
  if (!syndicator) {
    return (
      <div className="max-w-2xl mx-auto">
        {!showCreateBusiness ? (
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 lg:p-12 text-white text-center shadow-2xl">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">Welcome to EquityMD</h1>
            <p className="text-purple-100 text-lg mb-8 max-w-md mx-auto">
              Set up your business in 30 seconds and start connecting with accredited investors.
            </p>
            
            <button
              onClick={() => setShowCreateBusiness(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-700 font-bold text-lg rounded-xl hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Sparkles className="h-6 w-6" />
              Create Your Business
              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="mt-10 pt-8 border-t border-white/20">
              <p className="text-purple-200 text-sm mb-4">What you'll get:</p>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="bg-white/10 px-4 py-2 rounded-full text-sm">✓ Business Profile</span>
                <span className="bg-white/10 px-4 py-2 rounded-full text-sm">✓ Deal Listings</span>
                <span className="bg-white/10 px-4 py-2 rounded-full text-sm">✓ Investor Connections</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Create Your Business</h2>
              <p className="text-gray-500 mt-2">Enter your company or LLC name</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={newBusinessName}
                  onChange={(e) => setNewBusinessName(e.target.value)}
                  placeholder="e.g., Acme Real Estate Partners LLC"
                  className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-colors"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && createBusiness()}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateBusiness(false)}
                  className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={createBusiness}
                  disabled={!newBusinessName.trim() || creating}
                  className="flex-1 px-6 py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500">
                You can add logo and details after creating
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Has business - show streamlined dashboard
  return (
    <div className="space-y-6">
      {/* Business Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Your Business
            </h2>
            <Link
              to="/profile"
              className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-start gap-5">
            {/* Logo */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                {syndicator.company_logo_url ? (
                  <img 
                    src={syndicator.company_logo_url} 
                    alt={syndicator.company_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-gray-400" />
                )}
              </div>
              {!syndicator.company_logo_url && (
                <Link
                  to="/profile"
                  className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="h-6 w-6 text-white" />
                </Link>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900 truncate">
                  {syndicator.company_name}
                </h3>
                {syndicator.verification_status === 'verified' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    <Clock className="h-3 w-3" />
                    Unverified
                  </span>
                )}
              </div>
              
              {syndicator.company_description ? (
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {syndicator.company_description}
                </p>
              ) : (
                <p className="text-gray-400 text-sm italic mb-3">
                  No description yet –{' '}
                  <Link to="/profile" className="text-purple-600 hover:underline">
                    add one to attract investors
                  </Link>
                </p>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                {syndicator.slug && (
                  <a
                    href={`/syndicator/${syndicator.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    View Public Page
                  </a>
                )}
                <Link
                  to="/inbox"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors relative"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Messages
                  {stats.unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {stats.unreadMessages}
                    </span>
                  )}
                </Link>
                {stats.pendingRequests > 0 && (
                  <Link
                    to="/investment-requests"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {stats.pendingRequests} Pending Requests
                  </Link>
                )}
              </div>
            </div>

            {/* Gamification */}
            <div className="hidden lg:flex flex-col items-end gap-2">
              <button
                onClick={() => setShowAchievements(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Trophy className="h-4 w-4" />
                <span className="font-medium">{gamification.achievementCount} Badges</span>
              </button>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                {gamification.totalPoints} pts • Level {gamification.level.level}
              </div>
            </div>
          </div>

          {/* Missing profile warning */}
          {(!syndicator.company_logo_url || !syndicator.company_description) && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium text-amber-800">Complete your profile</p>
                  <p className="text-sm text-amber-600">
                    {!syndicator.company_logo_url && 'Add a logo'}
                    {!syndicator.company_logo_url && !syndicator.company_description && ' and '}
                    {!syndicator.company_description && 'add a description'}
                    {' to attract more investors'}
                  </p>
                </div>
              </div>
              <Link
                to="/profile"
                className="px-4 py-2 bg-amber-200 text-amber-800 font-medium rounded-lg hover:bg-amber-300 transition-colors"
              >
                Complete Now
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Building2 className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-gray-500 text-sm">Active Deals</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.activeDeals}</p>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-gray-500 text-sm">Interested</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalInvestors}</p>
        </div>
        
        <Link 
          to="/investment-requests"
          className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:border-orange-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-gray-500 text-sm">Pending</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</p>
        </Link>
        
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-gray-500 text-sm">Raised</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRaised)}</p>
        </div>
      </div>

      {/* Deals Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your Deals</h2>
            <p className="text-gray-500 text-sm">
              {deals.length === 0 ? 'Create your first investment opportunity' : `${deals.length} deal${deals.length !== 1 ? 's' : ''} listed`}
            </p>
          </div>
          <Link
            to="/deals/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
            New Deal
          </Link>
        </div>

        {deals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Create Your First Deal</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              List your investment opportunity and start connecting with accredited investors.
            </p>
            <Link
              to="/deals/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/25"
            >
              <Plus className="h-5 w-5" />
              Create Deal
            </Link>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {deals.map((deal) => {
                const interestCount = deal.deal_interests?.length || 0;
                const pendingCount = deal.investment_requests?.filter((r: any) => r.status === 'pending').length || 0;
                
                return (
                  <div 
                    key={deal.id}
                    className="group bg-white rounded-xl border-2 border-gray-100 overflow-hidden hover:border-emerald-300 hover:shadow-lg transition-all"
                  >
                    {/* Cover Image */}
                    <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                      {deal.cover_image_url ? (
                        <img 
                          src={deal.cover_image_url} 
                          alt={deal.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow ${
                          deal.status === 'active' 
                            ? 'bg-emerald-500 text-white'
                            : deal.status === 'draft'
                            ? 'bg-gray-700 text-white'
                            : 'bg-amber-500 text-white'
                        }`}>
                          {deal.status === 'active' ? '● Live' : deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                        </span>
                      </div>
                      
                      {/* Pending Badge */}
                      {pendingCount > 0 && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold shadow flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {pendingCount}
                          </span>
                        </div>
                      )}
                      
                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Link
                          to={`/deals/${deal.slug}/edit`}
                          className="px-4 py-2 bg-white text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-100 transition flex items-center gap-1.5 shadow-lg"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Link>
                        <Link
                          to={`/deals/${deal.slug}`}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition flex items-center gap-1.5 shadow-lg"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors mb-1">
                        {deal.title}
                      </h4>
                      
                      {deal.location && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">{deal.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          {deal.minimum_investment && (
                            <span className="text-gray-600">
                              <span className="font-semibold">${(deal.minimum_investment / 1000).toFixed(0)}K</span> min
                            </span>
                          )}
                          {deal.target_irr && (
                            <span className="text-emerald-600 font-semibold">
                              {deal.target_irr}% IRR
                            </span>
                          )}
                        </div>
                        
                        {interestCount > 0 && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Users className="h-4 w-4" />
                            {interestCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Add New Deal Card */}
              <Link
                to="/deals/new"
                className="group flex flex-col items-center justify-center min-h-[260px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:from-emerald-50 hover:to-teal-50 transition-all"
              >
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-md transition-all">
                  <Plus className="h-7 w-7 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <span className="font-semibold text-gray-600 group-hover:text-emerald-700 transition-colors">
                  Add New Deal
                </span>
                <span className="text-sm text-gray-400 group-hover:text-emerald-600 transition-colors">
                  List another property
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Achievements Modal */}
      <AchievementsModal 
        isOpen={showAchievements} 
        onClose={() => setShowAchievements(false)} 
      />
      
      {/* Achievement Unlocked Animation */}
      <AchievementUnlocked />
    </div>
  );
}
