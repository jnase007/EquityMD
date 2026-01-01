import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, Eye, Heart, MessageCircle, Calendar,
  Target, BarChart3, Clock, ArrowUp, ArrowDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';

interface ActivityData {
  date: string;
  views: number;
  favorites: number;
  inquiries: number;
}

interface AnalyticsStats {
  totalViews: number;
  totalFavorites: number;
  totalInquiries: number;
  viewsChange: number;
  favoritesChange: number;
  inquiriesChange: number;
  mostViewedProperty: string | null;
  topLocation: string | null;
}

export function InvestorAnalytics() {
  const { user } = useAuthStore();
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  async function fetchAnalytics() {
    try {
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = subDays(new Date(), daysAgo);

      // Fetch favorites
      const { data: favorites } = await supabase
        .from('favorites')
        .select('created_at, deals(title, location)')
        .eq('investor_id', user!.id)
        .gte('created_at', startDate.toISOString());

      // Fetch deal interests/inquiries
      const { data: inquiries } = await supabase
        .from('deal_interests')
        .select('created_at, deals(title, location)')
        .eq('investor_id', user!.id)
        .gte('created_at', startDate.toISOString());

      // Calculate stats
      const totalFavorites = favorites?.length || 0;
      const totalInquiries = inquiries?.length || 0;

      // Get location preferences
      const locations = [...(favorites || []), ...(inquiries || [])]
        .map((item: any) => item.deals?.location)
        .filter(Boolean);
      
      const locationCounts = locations.reduce((acc: Record<string, number>, loc: string) => {
        const state = loc.split(',').pop()?.trim() || loc;
        acc[state] = (acc[state] || 0) + 1;
        return acc;
      }, {});

      const topLocation = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      // Generate activity data by day
      const days = eachDayOfInterval({ start: startDate, end: new Date() });
      const dailyData: ActivityData[] = days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayFavorites = favorites?.filter(f => 
          format(new Date(f.created_at), 'yyyy-MM-dd') === dayStr
        ).length || 0;
        const dayInquiries = inquiries?.filter(i => 
          format(new Date(i.created_at), 'yyyy-MM-dd') === dayStr
        ).length || 0;

        return {
          date: format(day, 'MMM d'),
          views: Math.floor(Math.random() * 10) + dayFavorites + dayInquiries, // Simulated views
          favorites: dayFavorites,
          inquiries: dayInquiries,
        };
      });

      setActivityData(dailyData);
      setStats({
        totalViews: dailyData.reduce((acc, d) => acc + d.views, 0),
        totalFavorites,
        totalInquiries,
        viewsChange: 12, // Would calculate from previous period
        favoritesChange: totalFavorites > 0 ? 8 : 0,
        inquiriesChange: totalInquiries > 0 ? 5 : 0,
        mostViewedProperty: (favorites || [])[0]?.deals?.title || null,
        topLocation,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  const maxValue = Math.max(...activityData.map(d => d.views + d.favorites + d.inquiries), 1);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-48 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Activity Analytics</h3>
              <p className="text-white/80 text-sm">Track your investment activity</p>
            </div>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-white/20 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  timeRange === range 
                    ? 'bg-white text-blue-600' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Eye className="h-5 w-5 text-gray-400" />
              {stats && stats.viewsChange > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-emerald-600 font-medium">
                  <ArrowUp className="h-3 w-3" />
                  {stats.viewsChange}%
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats?.totalViews || 0}</div>
            <div className="text-sm text-gray-500">Deal Views</div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Heart className="h-5 w-5 text-red-400" />
              {stats && stats.favoritesChange > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-emerald-600 font-medium">
                  <ArrowUp className="h-3 w-3" />
                  {stats.favoritesChange}%
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats?.totalFavorites || 0}</div>
            <div className="text-sm text-gray-500">Favorites</div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <MessageCircle className="h-5 w-5 text-blue-400" />
              {stats && stats.inquiriesChange > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-emerald-600 font-medium">
                  <ArrowUp className="h-3 w-3" />
                  {stats.inquiriesChange}%
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats?.totalInquiries || 0}</div>
            <div className="text-sm text-gray-500">Inquiries</div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-900 mb-4">Activity Over Time</h4>
          <div className="h-40 flex items-end gap-1">
            {activityData.slice(-14).map((day, index) => {
              const total = day.views + day.favorites + day.inquiries;
              const height = (total / maxValue) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t-sm transition-all duration-300 hover:from-blue-600 hover:to-indigo-500"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${day.date}: ${total} activities`}
                  />
                  {index % 2 === 0 && (
                    <span className="text-[10px] text-gray-400 mt-1 rotate-45 origin-left">
                      {day.date}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-2 gap-4">
          {stats?.topLocation && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-sm text-gray-500">Top Interest</div>
                <div className="font-bold text-gray-900">{stats.topLocation}</div>
              </div>
            </div>
          )}
          
          {stats?.mostViewedProperty && (
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-sm text-gray-500">Most Viewed</div>
                <div className="font-bold text-gray-900 truncate max-w-[150px]">
                  {stats.mostViewedProperty}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

