import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { format, subDays, startOfDay, endOfDay, subMonths } from 'date-fns';
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MessageSquare,
  Heart,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  Target,
  Sparkles,
  Bell,
  RefreshCw,
  ExternalLink,
  Mail,
  UserPlus,
  Building,
  Star,
  Filter,
  Calendar
} from 'lucide-react';

interface RealTimeMetrics {
  // Core KPIs
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  userGrowthPercent: number;
  
  totalDeals: number;
  activeDeals: number;
  newDealsThisWeek: number;
  
  totalInvestors: number;
  totalSyndicators: number;
  
  // Engagement Metrics
  totalDealViews: number;
  viewsToday: number;
  totalFavorites: number;
  favoritesToday: number;
  
  // Investment Interest
  totalInvestmentRequests: number;
  requestsThisWeek: number;
  pendingRequests: number;
  
  // Messages
  totalMessages: number;
  messagesToday: number;
  unreadMessages: number;
  
  // Verification
  pendingVerifications: number;
  pendingClaims: number;
  
  // Blog
  totalBlogPosts: number;
  publishedPosts: number;
  blogViewsThisWeek: number;
}

interface ActivityItem {
  id: string;
  type: 'user_signup' | 'deal_created' | 'investment_request' | 'message' | 'verification' | 'claim' | 'favorite';
  title: string;
  description: string;
  timestamp: string;
  link?: string;
  icon: React.ReactNode;
  iconBg: string;
}

interface TopDeal {
  id: string;
  title: string;
  location: string;
  views: number;
  favorites: number;
  investmentRequests: number;
  syndicator: string;
}

export function CommandCenter() {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [topDeals, setTopDeals] = useState<TopDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchAllData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  async function fetchAllData() {
    try {
      const [metricsData, activitiesData, topDealsData] = await Promise.all([
        fetchMetrics(),
        fetchRecentActivity(),
        fetchTopDeals()
      ]);
      
      setMetrics(metricsData);
      setActivities(activitiesData);
      setTopDeals(topDealsData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching command center data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMetrics(): Promise<RealTimeMetrics> {
    const now = new Date();
    const todayStart = startOfDay(now).toISOString();
    const weekAgo = subDays(now, 7).toISOString();
    const monthAgo = subMonths(now, 1).toISOString();

    // Parallel fetch all metrics
    const [
      usersResult,
      newUsersTodayResult,
      newUsersWeekResult,
      usersMonthAgoResult,
      dealsResult,
      activeDealsResult,
      newDealsWeekResult,
      investorsResult,
      syndicatorsResult,
      viewsResult,
      viewsTodayResult,
      favoritesResult,
      favoritesTodayResult,
      investmentRequestsResult,
      requestsWeekResult,
      pendingRequestsResult,
      messagesResult,
      messagesTodayResult,
      pendingVerificationsResult,
      pendingClaimsResult,
      blogPostsResult,
      publishedPostsResult
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).lte('created_at', monthAgo),
      supabase.from('deals').select('*', { count: 'exact', head: true }),
      supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('deals').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'investor'),
      supabase.from('syndicators').select('*', { count: 'exact', head: true }),
      supabase.from('deal_views').select('*', { count: 'exact', head: true }),
      supabase.from('deal_views').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('favorites').select('*', { count: 'exact', head: true }),
      supabase.from('favorites').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('investment_requests').select('*', { count: 'exact', head: true }),
      supabase.from('investment_requests').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabase.from('investment_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('syndicators').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
      supabase.from('claim_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('is_published', true)
    ]);

    const totalUsers = usersResult.count || 0;
    const usersMonthAgo = usersMonthAgoResult.count || 0;
    const userGrowthPercent = usersMonthAgo > 0 
      ? ((totalUsers - usersMonthAgo) / usersMonthAgo) * 100 
      : 0;

    return {
      totalUsers,
      newUsersToday: newUsersTodayResult.count || 0,
      newUsersThisWeek: newUsersWeekResult.count || 0,
      userGrowthPercent,
      totalDeals: dealsResult.count || 0,
      activeDeals: activeDealsResult.count || 0,
      newDealsThisWeek: newDealsWeekResult.count || 0,
      totalInvestors: investorsResult.count || 0,
      totalSyndicators: syndicatorsResult.count || 0,
      totalDealViews: viewsResult.count || 0,
      viewsToday: viewsTodayResult.count || 0,
      totalFavorites: favoritesResult.count || 0,
      favoritesToday: favoritesTodayResult.count || 0,
      totalInvestmentRequests: investmentRequestsResult.count || 0,
      requestsThisWeek: requestsWeekResult.count || 0,
      pendingRequests: pendingRequestsResult.count || 0,
      totalMessages: messagesResult.count || 0,
      messagesToday: messagesTodayResult.count || 0,
      unreadMessages: 0, // Would need read status tracking
      pendingVerifications: pendingVerificationsResult.count || 0,
      pendingClaims: pendingClaimsResult.count || 0,
      totalBlogPosts: blogPostsResult.count || 0,
      publishedPosts: publishedPostsResult.count || 0,
      blogViewsThisWeek: 0 // Would need blog view tracking
    };
  }

  async function fetchRecentActivity(): Promise<ActivityItem[]> {
    const activities: ActivityItem[] = [];
    const yesterday = subDays(new Date(), 1).toISOString();

    // Fetch recent signups
    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('id, full_name, user_type, created_at')
      .gte('created_at', yesterday)
      .order('created_at', { ascending: false })
      .limit(5);

    recentUsers?.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user_signup',
        title: 'New User Signup',
        description: `${user.full_name || 'Anonymous'} joined as ${user.user_type}`,
        timestamp: user.created_at,
        icon: <UserPlus className="h-4 w-4" />,
        iconBg: 'bg-green-100 text-green-600'
      });
    });

    // Fetch recent investment requests
    const { data: recentRequests } = await supabase
      .from('investment_requests')
      .select(`
        id, created_at, amount,
        deal:deal_id (title),
        investor:investor_id (full_name)
      `)
      .gte('created_at', yesterday)
      .order('created_at', { ascending: false })
      .limit(5);

    recentRequests?.forEach((req: any) => {
      activities.push({
        id: `request-${req.id}`,
        type: 'investment_request',
        title: 'Investment Request',
        description: `${req.investor?.full_name || 'Investor'} requested $${(req.amount || 0).toLocaleString()} for ${req.deal?.title || 'a deal'}`,
        timestamp: req.created_at,
        icon: <DollarSign className="h-4 w-4" />,
        iconBg: 'bg-blue-100 text-blue-600'
      });
    });

    // Sort by timestamp
    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 10);
  }

  async function fetchTopDeals(): Promise<TopDeal[]> {
    // Fetch deals with their engagement metrics
    const { data: deals } = await supabase
      .from('deals')
      .select(`
        id, title, location,
        syndicator:syndicator_id (company_name)
      `)
      .eq('status', 'active')
      .limit(10);

    if (!deals) return [];

    // For each deal, fetch engagement metrics
    const dealsWithMetrics = await Promise.all(
      deals.map(async (deal: any) => {
        const [viewsResult, favoritesResult, requestsResult] = await Promise.all([
          supabase.from('deal_views').select('*', { count: 'exact', head: true }).eq('deal_id', deal.id),
          supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('deal_id', deal.id),
          supabase.from('investment_requests').select('*', { count: 'exact', head: true }).eq('deal_id', deal.id)
        ]);

        return {
          id: deal.id,
          title: deal.title,
          location: deal.location,
          views: viewsResult.count || 0,
          favorites: favoritesResult.count || 0,
          investmentRequests: requestsResult.count || 0,
          syndicator: deal.syndicator?.company_name || 'Unknown'
        };
      })
    );

    // Sort by total engagement
    return dealsWithMetrics
      .sort((a, b) => (b.views + b.favorites * 5 + b.investmentRequests * 10) - (a.views + a.favorites * 5 + a.investmentRequests * 10))
      .slice(0, 5);
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Command Center</h2>
          <p className="text-gray-500 text-sm">
            Real-time platform overview • Last updated {format(lastRefresh, 'h:mm:ss a')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-green-600 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live
          </div>
          <button
            onClick={fetchAllData}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Urgent Actions Bar */}
      {metrics && (metrics.pendingVerifications > 0 || metrics.pendingClaims > 0 || metrics.pendingRequests > 0) && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">Action Required</span>
            </div>
            {metrics.pendingVerifications > 0 && (
              <Link
                to="#"
                onClick={() => {/* Navigate to verification tab */}}
                className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-100 transition"
              >
                <CheckCircle className="h-4 w-4" />
                {metrics.pendingVerifications} Pending Verifications
              </Link>
            )}
            {metrics.pendingClaims > 0 && (
              <Link
                to="#"
                className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-100 transition"
              >
                <Building className="h-4 w-4" />
                {metrics.pendingClaims} Claim Requests
              </Link>
            )}
            {metrics.pendingRequests > 0 && (
              <span className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-amber-700">
                <DollarSign className="h-4 w-4" />
                {metrics.pendingRequests} Pending Investment Requests
              </span>
            )}
          </div>
        </div>
      )}

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{metrics?.totalUsers.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              +{metrics?.newUsersToday} today
            </span>
            <span className="text-gray-500">
              +{metrics?.newUsersThisWeek} this week
            </span>
          </div>
        </div>

        {/* Active Deals */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Deals</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{metrics?.activeDeals}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              +{metrics?.newDealsThisWeek} this week
            </span>
            <span className="text-gray-500">
              {metrics?.totalDeals} total
            </span>
          </div>
        </div>

        {/* Deal Views */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Deal Views</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{metrics?.totalDealViews.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              +{metrics?.viewsToday} today
            </span>
          </div>
        </div>

        {/* Investment Requests */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Investment Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{metrics?.totalInvestmentRequests}</p>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              +{metrics?.requestsThisWeek} this week
            </span>
            <span className="text-amber-600">
              {metrics?.pendingRequests} pending
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span className="text-sm">Investors</span>
          </div>
          <p className="text-xl font-bold mt-1">{metrics?.totalInvestors}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Building className="h-4 w-4" />
            <span className="text-sm">Syndicators</span>
          </div>
          <p className="text-xl font-bold mt-1">{metrics?.totalSyndicators}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Heart className="h-4 w-4" />
            <span className="text-sm">Favorites</span>
          </div>
          <p className="text-xl font-bold mt-1">{metrics?.totalFavorites}</p>
          <p className="text-xs text-gray-500">+{metrics?.favoritesToday} today</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">Messages</span>
          </div>
          <p className="text-xl font-bold mt-1">{metrics?.totalMessages}</p>
          <p className="text-xs text-gray-500">+{metrics?.messagesToday} today</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <FileText className="h-4 w-4" />
            <span className="text-sm">Blog Posts</span>
          </div>
          <p className="text-xl font-bold mt-1">{metrics?.publishedPosts}</p>
          <p className="text-xs text-gray-500">{metrics?.totalBlogPosts} total</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Deals */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Top Performing Deals
            </h3>
            <Link to="/admin?tab=properties" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View All <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topDeals.map((deal, index) => (
              <div key={deal.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{deal.title}</p>
                  <p className="text-sm text-gray-500">{deal.location} • {deal.syndicator}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Eye className="h-4 w-4" /> {deal.views}
                  </span>
                  <span className="flex items-center gap-1 text-red-500">
                    <Heart className="h-4 w-4" /> {deal.favorites}
                  </span>
                  <span className="flex items-center gap-1 text-green-600">
                    <DollarSign className="h-4 w-4" /> {deal.investmentRequests}
                  </span>
                </div>
              </div>
            ))}
            {topDeals.length === 0 && (
              <p className="text-gray-500 text-center py-8">No deals yet</p>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Recent Activity
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${activity.iconBg}`}>
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                  <p className="text-gray-500 text-xs truncate">{activity.description}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <button className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition">
            <UserPlus className="h-5 w-5" />
            <span className="text-sm">Invite User</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition">
            <Building2 className="h-5 w-5" />
            <span className="text-sm">Add Deal</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition">
            <FileText className="h-5 w-5" />
            <span className="text-sm">New Blog Post</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition">
            <Mail className="h-5 w-5" />
            <span className="text-sm">Send Email</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm">View Reports</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm">Generate Blog</span>
          </button>
        </div>
      </div>
    </div>
  );
}

