import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from '../../lib/supabase';
import { format, subMonths, eachMonthOfInterval } from 'date-fns';
import { Users, Building2, DollarSign, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

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
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className={`flex items-center ${data.metrics.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.metrics.userGrowth >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              <span className="ml-1">{Math.abs(data.metrics.userGrowth).toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold">{data.metrics.totalUsers}</div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-100 rounded-lg">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <div className={`flex items-center ${data.metrics.dealGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.metrics.dealGrowth >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              <span className="ml-1">{Math.abs(data.metrics.dealGrowth).toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold">{data.metrics.totalDeals}</div>
            <div className="text-sm text-gray-500">Active Deals</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className={`flex items-center ${data.metrics.investmentGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.metrics.investmentGrowth >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              <span className="ml-1">{Math.abs(data.metrics.investmentGrowth).toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold">${(data.metrics.totalInvestment / 1000000).toFixed(1)}M</div>
            <div className="text-sm text-gray-500">Total Investment</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold">{data.metrics.averageIRR.toFixed(1)}%</div>
            <div className="text-sm text-gray-500">Average Target IRR</div>
          </div>
        </div>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4">User Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" name="Users" stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Investment Growth */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4">Investment Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.investmentGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value) => `$${(value as number / 1000000).toFixed(1)}M`} />
                <Legend />
                <Line type="monotone" dataKey="amount" name="Investment" stroke="#16a34a" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Property Types and Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Property Types */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4">Property Type Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.propertyTypes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Properties" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Locations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4">Top Markets</h3>
          <div className="space-y-4">
            {data.topLocations.map((location, index) => (
              <div key={index} className="flex items-center">
                <div className="w-32 text-gray-600">{location.location}</div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full"
                      style={{ 
                        width: `${(location.deals / data.topLocations[0].deals) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right font-medium">{location.deals}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}