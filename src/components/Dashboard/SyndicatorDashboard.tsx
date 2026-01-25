import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Building2, Users, 
  MessageSquare, Eye, CheckCircle, AlertCircle,
  Sparkles, Trophy, Zap, Edit, MapPin,
  Camera, Clock, ArrowRight, Globe, XCircle,
  DollarSign, User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { useGamification } from '../Gamification/useGamification';
import { AchievementsModal } from '../Gamification/AchievementsModal';
import { AchievementUnlocked } from '../Gamification/AchievementUnlocked';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface InvestmentRequest {
  id: string;
  deal_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  created_at: string;
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

export function SyndicatorDashboard() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const gamification = useGamification();
  const [showAchievements, setShowAchievements] = useState(false);
  const achievementsButtonRef = useRef<HTMLButtonElement>(null);
  const [syndicator, setSyndicator] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [investmentRequests, setInvestmentRequests] = useState<InvestmentRequest[]>([]);
  const [stats, setStats] = useState({
    activeDeals: 0,
    totalInvestors: 0,
    pendingRequests: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateBusiness, setShowCreateBusiness] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showEditBusiness, setShowEditBusiness] = useState(false);
  const [editForm, setEditForm] = useState({ companyName: '', companyDescription: '' });
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [integrationsNotify, setIntegrationsNotify] = useState(() => {
    // Check localStorage for saved preference
    return localStorage.getItem('integrations_notify') === 'true';
  });

  useEffect(() => {
    if (user && profile) {
      fetchData();
    }
  }, [user, profile]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  async function fetchData() {
    try {
      // Fetch syndicator (just get the first one - single business model)
      // Using maybeSingle() pattern without .single() to avoid errors with 0 or multiple rows
      const { data: syndicatorsArray, error: syndicatorError } = await supabase
        .from('syndicators')
        .select('*')
        .eq('claimed_by', user!.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (syndicatorError) {
        console.error('Error fetching syndicator:', syndicatorError);
      }

      // Get first syndicator from array (or null if empty)
      const syndicatorData = syndicatorsArray && syndicatorsArray.length > 0 ? syndicatorsArray[0] : null;
      setSyndicator(syndicatorData);

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
          pendingRequests,
          unreadMessages: unreadCount || 0,
        });

        // Fetch investment requests with details
        await fetchInvestmentRequests(syndicatorData.id, dealsData || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchInvestmentRequests(syndicatorId: string, dealsData: any[]) {
    try {
      if (!dealsData || dealsData.length === 0) {
        setInvestmentRequests([]);
        return;
      }

      const dealIds = dealsData.map(d => d.id);

      // Get investment requests for these deals
      const { data: requestsData, error: requestsError } = await supabase
        .from('investment_requests')
        .select('*')
        .in('deal_id', dealIds)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Get investor profiles
      const investorIds = [...new Set(requestsData?.map(r => r.user_id) || [])];
      
      let investorProfiles: any[] = [];
      if (investorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url, phone_number')
          .in('id', investorIds);
        investorProfiles = profiles || [];
      }

      // Combine data
      const enrichedRequests = requestsData?.map(request => ({
        ...request,
        deal: dealsData.find(d => d.id === request.deal_id),
        investor: investorProfiles?.find(p => p.id === request.user_id),
      })) || [];

      setInvestmentRequests(enrichedRequests);
    } catch (error) {
      console.error('Error fetching investment requests:', error);
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
      setInvestmentRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: newStatus } : r
      ));

      // Update pending count in stats
      setStats(prev => ({
        ...prev,
        pendingRequests: prev.pendingRequests - 1
      }));

      // Get the request to notify the investor
      const request = investmentRequests.find(r => r.id === requestId);
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
          : 'Investment request declined'
      );

      setShowActionMenu(null);
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
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

  function openEditBusiness() {
    if (syndicator) {
      setEditForm({
        companyName: syndicator.company_name || '',
        companyDescription: syndicator.company_description || '',
      });
      setShowEditBusiness(true);
    }
  }

  async function saveBusinessProfile() {
    if (!syndicator) return;
    setSavingBusiness(true);
    try {
      const { error } = await supabase
        .from('syndicators')
        .update({
          company_name: editForm.companyName.trim(),
          company_description: editForm.companyDescription.trim(),
        })
        .eq('id', syndicator.id);

      if (error) throw error;

      setSyndicator({
        ...syndicator,
        company_name: editForm.companyName.trim(),
        company_description: editForm.companyDescription.trim(),
      });
      setShowEditBusiness(false);
      toast.success('Business profile updated! ✨');
    } catch (error: any) {
      console.error('Error updating business:', error);
      toast.error('Failed to update business profile');
    } finally {
      setSavingBusiness(false);
    }
  }

  async function handleLogoUpdate(url: string) {
    if (!syndicator) return;
    try {
      const { error } = await supabase
        .from('syndicators')
        .update({ company_logo_url: url })
        .eq('id', syndicator.id);

      if (error) throw error;

      setSyndicator({ ...syndicator, company_logo_url: url });
      setShowLogoUpload(false);
      toast.success('Logo updated! 🎨');
    } catch (error) {
      console.error('Error updating logo:', error);
      toast.error('Failed to update logo');
    }
  }

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
            
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-purple-200 text-sm">
                Just want to browse deals?{' '}
                <button
                  onClick={() => {
                    // Reset to investor view
                    if (user) {
                      supabase
                        .from('profiles')
                        .update({ dashboard_preference: 'investor' })
                        .eq('id', user.id)
                        .then(() => {
                          window.location.reload();
                        });
                    }
                  }}
                  className="text-white underline hover:no-underline font-medium"
                >
                  Switch to Investor View
                </button>
              </p>
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

  // Get pending requests for display
  const pendingRequests = investmentRequests.filter(r => r.status === 'pending');
  const recentRequests = investmentRequests.slice(0, 5);

  // Has business - show streamlined dashboard
  return (
    <div className="space-y-6">
      {/* Launch Promotion Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-white text-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <span className="font-bold text-lg">Launch Promotion!</span>
          </div>
          <span className="text-emerald-50">
            All listing fees waived until <strong>June 2026</strong> — Start listing for FREE!
          </span>
          <span className="text-2xl hidden sm:block">🎁</span>
        </div>
        <p className="text-center text-emerald-100/70 text-xs mt-2">
          Pricing and promotions subject to change at EquityMD's discretion.
        </p>
      </div>

      {/* Business Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Your Business
            </h2>
            <button
              onClick={openEditBusiness}
              className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Business
            </button>
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
                <button
                  onClick={openEditBusiness}
                  className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="h-6 w-6 text-white" />
                </button>
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
                  <button onClick={openEditBusiness} className="text-purple-600 hover:underline">
                    add one to attract investors
                  </button>
                </p>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                {syndicator.slug && (
                  <a
                    href={`/syndicators/${syndicator.slug}`}
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
              </div>
            </div>

            {/* Gamification */}
            <div className="hidden lg:flex flex-col items-end gap-2">
              <button
                ref={achievementsButtonRef}
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
              <button
                onClick={openEditBusiness}
                className="px-4 py-2 bg-amber-200 text-amber-800 font-medium rounded-lg hover:bg-amber-300 transition-colors"
              >
                Complete Now
              </button>
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
        
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-gray-500 text-sm">Pending</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</p>
        </div>
        
        <Link 
          to="/inbox"
          className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:border-purple-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-gray-500 text-sm">Messages</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.unreadMessages}</p>
        </Link>
      </div>

      {/* Investment Requests Section */}
      {investmentRequests.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Investment Requests</h2>
                <p className="text-gray-500 text-sm">
                  {pendingRequests.length > 0 
                    ? `${pendingRequests.length} pending review`
                    : 'All requests processed'}
                </p>
              </div>
            </div>
            {pendingRequests.length > 0 && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                {pendingRequests.length} Pending
              </span>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {/* Show pending first, then recent */}
            {[...pendingRequests, ...investmentRequests.filter(r => r.status !== 'pending').slice(0, 3)].slice(0, 5).map((request) => (
              <div 
                key={request.id}
                className={`p-5 hover:bg-gray-50 transition-colors ${
                  request.status === 'pending' ? 'bg-orange-50/50' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Deal & Investor Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {request.deal?.cover_image_url ? (
                        <img 
                          src={request.deal.cover_image_url} 
                          alt={request.deal.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                          {request.investor?.avatar_url ? (
                            <img 
                              src={request.investor.avatar_url} 
                              alt={`${request.investor.full_name}'s avatar`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900 truncate">
                          {request.investor?.full_name || 'Unknown'}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500 truncate">
                          {request.deal?.title}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">
                        {formatCurrency(request.amount)}
                      </p>
                      <p className="text-xs text-gray-500">Investment</p>
                    </div>

                    {/* Status / Actions */}
                    {request.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateRequestStatus(request.id, 'approved')}
                          className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => updateRequestStatus(request.id, 'rejected')}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          title="Decline"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                        <Link
                          to="/inbox"
                          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Message"
                        >
                          <MessageSquare className="h-5 w-5" />
                        </Link>
                      </div>
                    ) : (
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        request.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : request.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {request.status === 'approved' && <CheckCircle className="h-3 w-3 inline mr-1" />}
                        {request.status === 'rejected' && <XCircle className="h-3 w-3 inline mr-1" />}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {investmentRequests.length === 0 && (
            <div className="p-8 text-center">
              <DollarSign className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No investment requests yet</p>
            </div>
          )}
        </div>
      )}

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

      {/* Integrations Coming Soon */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Integrations
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  Coming Soon
                </span>
              </h2>
              <p className="text-gray-500 text-sm">Connect your existing platforms to import deals automatically</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* CashFlow Portal */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 opacity-75">
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  Coming Soon
                </span>
              </div>
              <div className="h-12 flex items-center mb-4">
                <img 
                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos//cashflow_logo.jpg`}
                  alt="CashFlow Portal"
                  className="h-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden text-lg font-bold text-gray-700">CashFlow Portal</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">CashFlow Portal</h3>
              <p className="text-sm text-gray-500 mb-3">Import deals directly from CashFlow Portal with one click</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-gray-400" />
                  Direct deal import
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-gray-400" />
                  Investment terms sync
                </li>
              </ul>
            </div>

            {/* AppFolio */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 opacity-75">
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  Coming Soon
                </span>
              </div>
              <div className="h-12 flex items-center mb-4">
                <img 
                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos//appfolio_logo.png`}
                  alt="AppFolio"
                  className="h-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden text-lg font-bold text-gray-700">AppFolio</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">AppFolio</h3>
              <p className="text-sm text-gray-500 mb-3">Seamlessly sync property data from AppFolio</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-gray-400" />
                  One-click property import
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-gray-400" />
                  Automatic data sync
                </li>
              </ul>
            </div>

            {/* Juniper Square */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 opacity-75">
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  Coming Soon
                </span>
              </div>
              <div className="h-12 flex items-center mb-4">
                <img 
                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos//Juniper_Square.png`}
                  alt="Juniper Square"
                  className="h-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden text-lg font-bold text-gray-700">Juniper Square</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Juniper Square</h3>
              <p className="text-sm text-gray-500 mb-3">Leverage Juniper Square for enhanced investor management</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-gray-400" />
                  Investor reporting
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-gray-400" />
                  Distribution management
                </li>
              </ul>
            </div>
          </div>

          {/* Interest Form */}
          <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-medium text-purple-900">
                  {integrationsNotify ? "You're on the list! 🎉" : "Want to be notified when integrations launch?"}
                </p>
                <p className="text-sm text-purple-700">
                  {integrationsNotify 
                    ? "We'll email you as soon as these integrations become available."
                    : "We'll let you know as soon as these become available."
                  }
                </p>
              </div>
              {integrationsNotify ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  Subscribed
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setIntegrationsNotify(true);
                    localStorage.setItem('integrations_notify', 'true');
                    toast.success("You're on the list! We'll notify you when integrations launch.");
                  }}
                  className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Notify Me
                </button>
              )}
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
        anchorRef={achievementsButtonRef}
      />
      
      {/* Achievement Unlocked Animation */}
      {gamification.newAchievement && (
        <AchievementUnlocked
          achievement={gamification.newAchievement}
          onClose={gamification.clearNewAchievement}
        />
      )}

      {/* Edit Business Modal */}
      {showEditBusiness && syndicator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Edit Business Profile</h2>
                </div>
                <button
                  onClick={() => setShowEditBusiness(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Logo Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Company Logo</label>
                <div className="flex items-center gap-4">
                  {syndicator.company_logo_url ? (
                    <img
                      src={syndicator.company_logo_url}
                      alt={syndicator.company_name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Building2 className="h-7 w-7 text-gray-400" />
                    </div>
                  )}
                  <button
                    onClick={() => setShowLogoUpload(true)}
                    className="px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition text-sm font-medium"
                  >
                    {syndicator.company_logo_url ? 'Change Logo' : 'Upload Logo'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={editForm.companyName}
                  onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                  placeholder="Your company name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
                <textarea
                  value={editForm.companyDescription}
                  onChange={(e) => setEditForm({ ...editForm, companyDescription: e.target.value })}
                  placeholder="Tell investors about your company, track record, and investment philosophy..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowEditBusiness(false)}
                className="flex-1 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveBusinessProfile}
                disabled={savingBusiness || !editForm.companyName.trim()}
                className="flex-1 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingBusiness ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logo Upload Modal */}
      {showLogoUpload && syndicator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Upload Company Logo</h3>
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl mb-4">
              <Camera className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm mb-3">Drag & drop your logo or click to browse</p>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  try {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${syndicator.id}/logo.${fileExt}`;
                    
                    const { error: uploadError } = await supabase.storage
                      .from('logos')
                      .upload(fileName, file, { upsert: true });
                    
                    if (uploadError) throw uploadError;
                    
                    const { data } = supabase.storage.from('logos').getPublicUrl(fileName);
                    handleLogoUpdate(data.publicUrl);
                  } catch (error) {
                    console.error('Upload error:', error);
                    toast.error('Failed to upload logo');
                  }
                }}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="cursor-pointer px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
              >
                Choose File
              </label>
            </div>
            <button
              onClick={() => setShowLogoUpload(false)}
              className="w-full py-2 text-gray-600 hover:text-gray-800 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
