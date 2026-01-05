import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from '../../lib/supabase';
import { format, subMonths, eachMonthOfInterval } from 'date-fns';
import { Users, Building2, DollarSign, TrendingUp, ArrowUp, ArrowDown, BarChart3, Calendar, Download } from 'lucide-react';

interface AnalyticsData {
  userGrowth: { date: string; count: number }[];
  investmentGrowth: { date: string; amount: number }[];
  dealGrowth: { date: string; count: number }[];
  propertyTypes: { type: string; count: number }[];
  topLocations: { location: string; deals: number }[];
  metrics: {
    totalUsers: number;
    userGrowth: number;
    totalDeals: number;
    dealGrowth: number;
    totalInvestment: number;
    investmentGrowth: number;
    averageIRR: number;
  };
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>({
    userGrowth: [],
    investmentGrowth: [],
    dealGrowth: [],
    propertyTypes: [],
    topLocations: [],
    metrics: {
      totalUsers: 0,
      userGrowth: 0,
      totalDeals: 0,
      dealGrowth: 0,
      totalInvestment: 0,
      investmentGrowth: 0,
      averageIRR: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const endDate = new Date();
      const startDate = subMonths(endDate, 12);
      const months = eachMonthOfInterval({ start: startDate, end: endDate });

      // Fetch user growth
      const userPromises = months.map(async (date) => {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .lte('created_at', date.toISOString());
        
        return {
          date: format(date, 'MMM yyyy'),
          count: count || 0
        };
      });

      // Fetch investment growth
      const investmentPromises = months.map(async (date) => {
        const { data: deals } = await supabase
          .from('deals')
          .select('total_equity')
          .lte('created_at', date.toISOString());

        const amount = deals?.reduce((sum, deal) => sum + (deal.total_equity || 0), 0) || 0;
        
        return {
          date: format(date, 'MMM yyyy'),
          amount
        };
      });

      // Fetch deal growth
      const dealPromises = months.map(async (date) => {
        const { count } = await supabase
          .from('deals')
          .select('*', { count: 'exact', head: true })
          .lte('created_at', date.toISOString());
        
        return {
          date: format(date, 'MMM yyyy'),
          count: count || 0
        };
      });

      // Fetch property type distribution
      const { data: propertyTypes } = await supabase
        .from('deals')
        .select('property_type')
        .eq('status', 'active');

      const typeCount = propertyTypes?.reduce((acc: Record<string, number>, deal) => {
        acc[deal.property_type] = (acc[deal.property_type] || 0) + 1;
        return acc;
      }, {});

      // Fetch top locations
      const { data: locations } = await supabase
        .from('deals')
        .select('location')
        .eq('status', 'active');

      const locationCount = locations?.reduce((acc: Record<string, number>, deal) => {
        acc[deal.location] = (acc[deal.location] || 0) + 1;
        return acc;
      }, {});

      // Calculate metrics
      const [userGrowth, investmentGrowth, dealGrowth] = await Promise.all([
        Promise.all(userPromises),
        Promise.all(investmentPromises),
        Promise.all(dealPromises)
      ]);

      const currentUsers = userGrowth[userGrowth.length - 1].count;
      const lastMonthUsers = userGrowth[userGrowth.length - 2].count;
      const userGrowthRate = ((currentUsers - lastMonthUsers) / lastMonthUsers) * 100;

      const currentDeals = dealGrowth[dealGrowth.length - 1].count;
      const lastMonthDeals = dealGrowth[dealGrowth.length - 2].count;
      const dealGrowthRate = ((currentDeals - lastMonthDeals) / lastMonthDeals) * 100;

      const currentInvestment = investmentGrowth[investmentGrowth.length - 1].amount;
      const lastMonthInvestment = investmentGrowth[investmentGrowth.length - 2].amount;
      const investmentGrowthRate = ((currentInvestment - lastMonthInvestment) / lastMonthInvestment) * 100;

      // Get average IRR
      const { data: deals } = await supabase
        .from('deals')
        .select('target_irr')
        .eq('status', 'active');

      const averageIRR = deals?.reduce((sum, deal) => sum + deal.target_irr, 0) / (deals?.length || 1);

      setData({
        userGrowth,
        investmentGrowth,
        dealGrowth,
        propertyTypes: Object.entries(typeCount || {}).map(([type, count]) => ({ type, count })),
        topLocations: Object.entries(locationCount || {})
          .map(([location, deals]) => ({ location, deals }))
          .sort((a, b) => b.deals - a.deals)
          .slice(0, 5),
        metrics: {
          totalUsers: currentUsers,
          userGrowth: userGrowthRate,
          totalDeals: currentDeals,
          dealGrowth: dealGrowthRate,
          totalInvestment: currentInvestment,
          investmentGrowth: investmentGrowthRate,
          averageIRR: averageIRR || 0
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-80 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-purple-300" />
              Analytics Dashboard
            </h2>
            <p className="text-purple-200 text-sm mt-1">
              Platform performance metrics and trends
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg text-sm">
              <Calendar className="h-4 w-4" />
              Last 12 Months
            </div>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition text-sm">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="h-6 w-6" />
            </div>
            <div className={`flex items-center px-2 py-1 rounded-full text-sm ${data.metrics.userGrowth >= 0 ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'}`}>
              {data.metrics.userGrowth >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              <span className="ml-1">{Math.abs(data.metrics.userGrowth).toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{data.metrics.totalUsers.toLocaleString()}</div>
            <div className="text-sm text-blue-100">Total Users</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Building2 className="h-6 w-6" />
            </div>
            <div className={`flex items-center px-2 py-1 rounded-full text-sm ${data.metrics.dealGrowth >= 0 ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'}`}>
              {data.metrics.dealGrowth >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              <span className="ml-1">{Math.abs(data.metrics.dealGrowth).toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{data.metrics.totalDeals}</div>
            <div className="text-sm text-emerald-100">Active Deals</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-violet-500/20">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className={`flex items-center px-2 py-1 rounded-full text-sm ${data.metrics.investmentGrowth >= 0 ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'}`}>
              {data.metrics.investmentGrowth >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              <span className="ml-1">{Math.abs(data.metrics.investmentGrowth).toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">${(data.metrics.totalInvestment / 1000000).toFixed(1)}M</div>
            <div className="text-sm text-violet-100">Total Investment</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{data.metrics.averageIRR.toFixed(1)}%</div>
            <div className="text-sm text-amber-100">Average Target IRR</div>
          </div>
        </div>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              User Growth
            </h3>
            <span className="text-sm text-gray-500">Last 12 months</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Line type="monotone" dataKey="count" name="Users" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Investment Growth */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Investment Volume
            </h3>
            <span className="text-sm text-gray-500">Last 12 months</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.investmentGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip 
                  formatter={(value) => `$${(value as number / 1000000).toFixed(1)}M`}
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Line type="monotone" dataKey="amount" name="Investment" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Property Types and Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Types */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-violet-600" />
            Property Type Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.propertyTypes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="count" name="Properties" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Locations */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            Top Markets
          </h3>
          <div className="space-y-4">
            {data.topLocations.map((location, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                <div className="w-28 text-gray-700 font-medium truncate">{location.location}</div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(location.deals / (data.topLocations[0]?.deals || 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right font-bold text-gray-900">{location.deals}</div>
              </div>
            ))}
            {data.topLocations.length === 0 && (
              <p className="text-gray-500 text-center py-8">No location data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}