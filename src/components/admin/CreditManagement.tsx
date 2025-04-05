import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign, CreditCard, TrendingUp, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CreditStats {
  totalCredits: number;
  creditsUsed: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  revenueByTier: {
    name: string;
    revenue: number;
    subscribers: number;
  }[];
  creditTransactions: {
    date: string;
    credits: number;
  }[];
}

export function CreditManagement() {
  const [stats, setStats] = useState<CreditStats>({
    totalCredits: 0,
    creditsUsed: 0,
    activeSubscriptions: 0,
    monthlyRecurringRevenue: 0,
    revenueByTier: [],
    creditTransactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreditStats();
  }, []);

  async function fetchCreditStats() {
    try {
      // Get active subscriptions and revenue
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          tier:subscription_tiers(
            name,
            monthly_price,
            annual_price
          )
        `)
        .eq('status', 'active');

      if (subError) throw subError;

      // Calculate revenue by tier
      const tierRevenue = new Map<string, { revenue: number; subscribers: number }>();
      let totalMRR = 0;

      subscriptions?.forEach(sub => {
        const monthlyRevenue = sub.billing_interval === 'monthly'
          ? sub.tier.monthly_price
          : sub.tier.annual_price / 12;

        totalMRR += monthlyRevenue;

        const existing = tierRevenue.get(sub.tier.name) || { revenue: 0, subscribers: 0 };
        tierRevenue.set(sub.tier.name, {
          revenue: existing.revenue + monthlyRevenue,
          subscribers: existing.subscribers + 1
        });
      });

      // Get credit balances and usage
      const { data: credits, error: creditError } = await supabase
        .from('credits')
        .select('balance');

      if (creditError) throw creditError;

      const totalCredits = credits?.reduce((sum, c) => sum + c.balance, 0) || 0;

      // Get credit transactions
      const { data: transactions, error: transError } = await supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (transError) throw transError;

      // Process transactions for chart
      const transactionsByDate = new Map<string, number>();
      transactions?.forEach(trans => {
        const date = new Date(trans.created_at).toLocaleDateString();
        const existing = transactionsByDate.get(date) || 0;
        transactionsByDate.set(date, existing + trans.amount);
      });

      setStats({
        totalCredits,
        creditsUsed: transactions?.reduce((sum, t) => 
          t.type === 'usage' ? sum + Math.abs(t.amount) : sum, 0
        ) || 0,
        activeSubscriptions: subscriptions?.length || 0,
        monthlyRecurringRevenue: totalMRR,
        revenueByTier: Array.from(tierRevenue.entries()).map(([name, data]) => ({
          name,
          ...data
        })),
        creditTransactions: Array.from(transactionsByDate.entries()).map(([date, credits]) => ({
          date,
          credits
        }))
      });
    } catch (error) {
      console.error('Error fetching credit stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const downloadReport = () => {
    const csvContent = [
      ['Date', 'Revenue', 'Active Subscriptions', 'Credits Used'],
      [
        new Date().toLocaleDateString(),
        `$${stats.monthlyRecurringRevenue.toLocaleString()}`,
        stats.activeSubscriptions,
        stats.creditsUsed
      ]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div>Loading credit statistics...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <button
              onClick={downloadReport}
              className="text-blue-600 hover:text-blue-700"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              ${stats.monthlyRecurringRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Monthly Recurring Revenue</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              {stats.activeSubscriptions}
            </div>
            <div className="text-sm text-gray-500">Active Subscriptions</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalCredits.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Active Credits</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-orange-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              {stats.creditsUsed.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Credits Used</div>
          </div>
        </div>
      </div>

      {/* Revenue by Tier */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold mb-6">Revenue by Tier</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.revenueByTier}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#2563eb" />
              <YAxis yAxisId="right" orientation="right" stroke="#16a34a" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" name="Monthly Revenue" fill="#2563eb" />
              <Bar yAxisId="right" dataKey="subscribers" name="Subscribers" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Credit Usage Over Time */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold mb-6">Credit Usage Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.creditTransactions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="credits" name="Credits" fill="#9333ea" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}