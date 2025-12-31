import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, Heart, MessageSquare, Search, DollarSign, 
  Building2, ChevronRight, Star, Clock, Bell, Target,
  Briefcase, MapPin, Users, CheckCircle, ArrowUpRight, Trophy, Zap
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { useGamification } from '../Gamification/useGamification';
import { WelcomeBackCard, NextStepsCard } from '../Gamification/NextSteps';
import { ProgressCard, LevelBadge } from '../Gamification/ProgressCard';
import { AchievementsModal } from '../Gamification/AchievementsModal';
import { AchievementUnlocked } from '../Gamification/AchievementUnlocked';

interface InvestorDashboardProps {
  // Optional props for customization
}

export function InvestorDashboard() {
  const { user, profile } = useAuthStore();
  const gamification = useGamification();
  const [showAchievements, setShowAchievements] = useState(false);
  const [stats, setStats] = useState({
    favoriteDeals: 0,
    interestedDeals: 0,
    messagesUnread: 0,
    activeDeals: 0,
  });
  const [recentDeals, setRecentDeals] = useState<any[]>([]);
  const [favoriteDeals, setFavoriteDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

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

  const firstName = profile?.full_name?.split(' ')[0] || 'Investor';
  const nextIncomplete = gamification.nextSteps.find(s => !s.completed);

  return (
    <div className="space-y-8">
      {/* Gamified Welcome Section */}
      <WelcomeBackCard
        userName={firstName}
        streak={gamification.streak}
        todayPoints={0}
        nextStep={nextIncomplete}
      />
      
      {/* Level and Progress Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
              {gamification.level.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl lg:text-2xl font-bold">
                  Level {gamification.level.level}: {gamification.level.title}
                </h1>
              </div>
              <div className="flex items-center gap-3 text-blue-100">
                <span className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-yellow-300" />
                  {gamification.totalPoints} pts
                </span>
                <span>•</span>
                <button 
                  onClick={() => setShowAchievements(true)}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <Trophy className="h-4 w-4" />
                  {gamification.achievementCount}/{gamification.totalAchievements} badges
                </button>
              </div>
            </div>
          </div>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            <Search className="h-5 w-5" />
            Browse Deals
          </Link>
        </div>
        
        {/* Progress to next level */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-blue-200 mb-1">
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
          to="/browse"
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
              to="/browse" 
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
              <Link to="/browse" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
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
                <Link to="/browse" className="text-blue-600 hover:underline text-xs">
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

