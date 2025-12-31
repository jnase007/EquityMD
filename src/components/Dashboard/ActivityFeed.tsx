import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, TrendingUp, Users, Building2, Star, Clock, Eye, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ActivityItem {
  id: string;
  type: 'new_deal' | 'interest' | 'favorite' | 'message' | 'investor_joined';
  message: string;
  timestamp: Date;
  dealSlug?: string;
  dealTitle?: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
    
    // Set up real-time subscription for new deals
    const subscription = supabase
      .channel('public-activity')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'deals'
      }, () => {
        fetchRecentActivity();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchRecentActivity() {
    try {
      // Fetch recent deals
      const { data: recentDeals } = await supabase
        .from('deals')
        .select('id, title, slug, created_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch recent favorites count
      const { count: recentFavorites } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Fetch recent interests count
      const { count: recentInterests } = await supabase
        .from('deal_interests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const activityItems: ActivityItem[] = [];

      // Add recent deals
      recentDeals?.forEach(deal => {
        activityItems.push({
          id: `deal-${deal.id}`,
          type: 'new_deal',
          message: `New deal listed: ${deal.title}`,
          timestamp: new Date(deal.created_at),
          dealSlug: deal.slug,
          dealTitle: deal.title
        });
      });

      // Add aggregate activity
      if (recentFavorites && recentFavorites > 0) {
        activityItems.push({
          id: 'favorites-today',
          type: 'favorite',
          message: `${recentFavorites} deals saved by investors today`,
          timestamp: new Date()
        });
      }

      if (recentInterests && recentInterests > 0) {
        activityItems.push({
          id: 'interests-today',
          type: 'interest',
          message: `${recentInterests} investment inquiries today`,
          timestamp: new Date()
        });
      }

      // Sort by timestamp
      activityItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setActivities(activityItems.slice(0, 5));
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'new_deal':
        return <Building2 className="h-4 w-4 text-blue-500" />;
      case 'interest':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'favorite':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'investor_joined':
        return <Users className="h-4 w-4 text-indigo-500" />;
      default:
        return <Zap className="h-4 w-4 text-amber-500" />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h3 className="font-semibold text-gray-900">Live Activity</h3>
          </div>
          <span className="text-xs text-gray-400">Real-time updates</span>
        </div>
      </div>
      
      <div className="divide-y divide-gray-50">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Eye className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              {activity.dealSlug ? (
                <Link
                  to={`/deals/${activity.dealSlug}`}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 line-clamp-2">{activity.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{getTimeAgo(activity.timestamp)}</p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{activity.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{getTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

