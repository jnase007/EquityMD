import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, MessageSquare, 
  Building2, ChevronRight, Target,
  Briefcase, MapPin, Users, CheckCircle, ArrowUpRight, Trophy, ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { useGamification } from '../Gamification/useGamification';
import { NextStepsCard } from '../Gamification/NextSteps';
import { AchievementsModal } from '../Gamification/AchievementsModal';
import { AchievementUnlocked } from '../Gamification/AchievementUnlocked';
import { ProfileNudge } from './WelcomeBanner';
import { calculateProfileCompletion } from '../../lib/profileCompletion';
import { PersonalizedGreeting } from './PersonalizedGreeting';
import { ActivityFeed } from './ActivityFeed';
import { SmartRecommendations } from './SmartRecommendations';

export function InvestorDashboard() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const gamification = useGamification();
  const [showAchievements, setShowAchievements] = useState(false);
  const achievementsButtonRef = useRef<HTMLButtonElement>(null);
  const [stats, setStats] = useState({
    favoriteDeals: 0,
    interestedDeals: 0,
    messagesUnread: 0,
    activeDeals: 0,
  });
  const [recentDeals, setRecentDeals] = useState<any[]>([]);
  const [favoriteDeals, setFavoriteDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [investorPrefs, setInvestorPrefs] = useState<any>(null);
  const [lastViewedDeal, setLastViewedDeal] = useState<{ title: string; slug: string } | null>(null);

  useEffect(() => {
    if (user && profile) {
      fetchDashboardData();
      fetchProfileCompletion();
    }
  }, [user, profile]);

  async function fetchProfileCompletion() {
    try {
      const { data: investorProfile } = await supabase
        .from('investor_profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (investorProfile) {
        setInvestorPrefs(investorProfile);
        const completion = calculateProfileCompletion(profile, investorProfile);
        setProfileCompletion(completion.percentage);
      }
    } catch (error) {
      console.error('Error fetching profile completion:', error);
    }
  }

  async function fetchDashboardData() {
    try {
      // Fetch favorites count
      const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('investor_id', user!.id);

      // Fetch interests count
      const { count: interestsCount } = await supabase
        .from('deal_interests')
        .select('*', { count: 'exact', head: true })
        .eq('investor_id', user!.id);

      // Fetch unread messages
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user!.id)
        .eq('is_read', false);

      // Fetch active deals count
      const { count: activeDealsCount } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      setStats({
        favoriteDeals: favoritesCount || 0,
        interestedDeals: interestsCount || 0,
        messagesUnread: unreadCount || 0,
        activeDeals: activeDealsCount || 0,
      });

      // Fetch recent active deals
      const { data: recentDealsData } = await supabase
        .from('deals')
        .select(`
          *,
          syndicators (
            company_name,
            company_logo_url,
            verification_status
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(4);

      setRecentDeals(recentDealsData || []);

      // Fetch recommended deals based on investor preferences
      const { data: investorProfile } = await supabase
        .from('investor_profiles')
        .select('preferred_property_types, preferred_locations, investment_range_min, investment_range_max')
        .eq('id', user!.id)
        .single();

      if (investorProfile) {
        let recommendedQuery = supabase
          .from('deals')
          .select(`
            *,
            syndicators (
              company_name,
              company_logo_url,
              verification_status
            )
          `)
          .eq('status', 'active');

        // Filter by property type if preferences exist
        if (investorProfile.preferred_property_types?.length > 0) {
          recommendedQuery = recommendedQuery.in('property_type', investorProfile.preferred_property_types);
        }

        // Filter by investment range
        if (investorProfile.investment_range_min) {
          recommendedQuery = recommendedQuery.gte('minimum_investment', 0)
            .lte('minimum_investment', investorProfile.investment_range_max || 10000000);
        }

        const { data: recommendedData } = await recommendedQuery
          .order('created_at', { ascending: false })
          .limit(4);

        setRecommendedDeals(recommendedData || []);
      }

      // Fetch favorite deals
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select(`
          deals (
            *,
            syndicators (
              company_name,
              verification_status
            )
          )
        `)
        .eq('investor_id', user!.id)
        .limit(3);

      setFavoriteDeals(favoritesData?.map(f => f.deals).filter(Boolean) || []);

      // Fetch last viewed deal from deal_views
      const { data: lastViewed } = await supabase
        .from('deal_views')
        .select('deal_id, deals(title, slug)')
        .eq('viewer_id', user!.id)
        .order('viewed_at', { ascending: false })
        .limit(1)
        .single();

      if (lastViewed?.deals) {
        setLastViewedDeal({
          title: (lastViewed.deals as any).title,
          slug: (lastViewed.deals as any).slug
        });
      }

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

  return (
    <div className="space-y-6">
      {/* Personalized Greeting with Stats */}
      <PersonalizedGreeting
        userName={profile?.full_name || 'Investor'}
        streak={gamification.streak}
        points={gamification.totalPoints}
        level={gamification.level.level}
        levelTitle={gamification.level.title}
        profileCompletion={profileCompletion}
        lastViewedDeal={lastViewedDeal}
        onViewAchievements={() => setShowAchievements(true)}
        achievementsButtonRef={achievementsButtonRef}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          to="/favorites"
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.favoriteDeals}</p>
          <p className="text-sm text-gray-500">Saved Deals</p>
        </Link>

        <Link 
          to="/dashboard"
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <Target className="h-5 w-5 text-emerald-500" />
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.interestedDeals}</p>
          <p className="text-sm text-gray-500">Interested In</p>
        </Link>

        <Link 
          to="/inbox"
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group relative"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.messagesUnread}</p>
          <p className="text-sm text-gray-500">Unread Messages</p>
          {stats.messagesUnread > 0 && (
            <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </Link>

        <Link 
          to="/find"
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Building2 className="h-5 w-5 text-purple-500" />
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.activeDeals}</p>
          <p className="text-sm text-gray-500">Active Deals</p>
        </Link>
      </div>

      {/* Prominent Unread Messages Alert Banner */}
      {stats.messagesUnread > 0 && (
        <Link 
          to="/inbox"
          className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  You have {stats.messagesUnread} unread message{stats.messagesUnread !== 1 ? 's' : ''}!
                </h3>
                <p className="text-blue-100 text-sm">
                  Syndicators have responded to your investment inquiries
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <span className="font-medium">View Messages</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      )}

      {/* Deals Matching Your Filters - Moved to top */}
      <SmartRecommendations
        userId={user?.id || ''}
        preferredTypes={investorPrefs?.preferred_property_types || []}
        preferredLocations={investorPrefs?.preferred_locations || []}
        investmentMin={investorPrefs?.investment_range_min}
        investmentMax={investorPrefs?.investment_range_max}
      />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Opportunities */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Latest Opportunities</h2>
              <p className="text-sm text-gray-500">Newly listed investment deals</p>
            </div>
            <Link 
              to="/find" 
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : recentDeals.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No active deals at the moment</p>
              <Link to="/find" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                Browse all listings
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentDeals.map((deal) => (
                <Link 
                  key={deal.id}
                  to={`/deals/${deal.slug}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {deal.cover_image_url ? (
                      <img 
                        src={deal.cover_image_url} 
                        alt={deal.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{deal.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {deal.location}
                      {deal.syndicators?.verification_status === 'verified' && (
                        <span className="text-emerald-500 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{deal.target_irr}%</p>
                    <p className="text-xs text-gray-500">Target IRR</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Live Activity Feed */}
          <ActivityFeed />

          {/* Saved Deals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold text-gray-900">Saved Deals</h3>
              </div>
              <Link to="/favorites" className="text-blue-600 hover:text-blue-700 text-sm">
                View All
              </Link>
            </div>
            
            {favoriteDeals.length === 0 ? (
              <div className="p-6 text-center">
                <Heart className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No saved deals yet</p>
                <Link to="/find" className="text-blue-600 hover:underline text-xs">
                  Start exploring
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {favoriteDeals.map((deal: any) => (
                  <Link 
                    key={deal.id}
                    to={`/deals/${deal.slug}`}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {deal.cover_image_url ? (
                        <img 
                          src={deal.cover_image_url} 
                          alt={deal.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{deal.title}</h4>
                      <p className="text-xs text-gray-500">{formatCurrency(deal.minimum_investment)} min</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Gamification - Next Steps */}
          {gamification.nextSteps.some(s => !s.completed) && (
            <NextStepsCard
              steps={gamification.nextSteps}
              title="Your Journey"
              subtitle="Complete these to earn points"
            />
          )}

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                to="/profile"
                className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Users className="h-5 w-5" />
                <span className="text-sm">Complete Your Profile</span>
              </Link>
              <Link 
                to="/directory"
                className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Briefcase className="h-5 w-5" />
                <span className="text-sm">Browse Syndicators</span>
              </Link>
              <button 
                onClick={() => setShowAchievements(true)}
                className="w-full flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Trophy className="h-5 w-5" />
                <span className="text-sm">View Achievements</span>
              </button>
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
      
      {/* Achievement Unlock Celebration */}
      {gamification.newAchievement && (
        <AchievementUnlocked
          achievement={gamification.newAchievement}
          onClose={gamification.clearNewAchievement}
        />
      )}

      {/* Syndicator CTA Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="font-bold text-lg">Are you a real estate syndicator?</h3>
              <p className="text-white/80 text-sm">List your deals and reach 7,400+ accredited investors</p>
            </div>
          </div>
          <Link
            to="/deals/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Briefcase className="h-5 w-5" />
            List a Deal
          </Link>
        </div>
      </div>

      {/* Floating Profile Completion Nudge */}
      <ProfileNudge 
        percentage={profileCompletion} 
        onClick={() => navigate('/profile')} 
      />
    </div>
  );
}

