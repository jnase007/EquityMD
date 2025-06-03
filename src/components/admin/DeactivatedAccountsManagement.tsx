import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, User, Building2, Shield, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface DeactivatedUser {
  id: string;
  email: string;
  full_name: string;
  user_type: 'investor' | 'syndicator';
  is_admin: boolean;
  deactivated_at: string;
  deactivation_reason: string;
  deactivated_by: string;
  avatar_url?: string;
}

interface DeactivationStats {
  total: number;
  thisMonth: number;
  lastMonth: number;
  topReasons: { reason: string; count: number }[];
}

export function DeactivatedAccountsManagement() {
  const [users, setUsers] = useState<DeactivatedUser[]>([]);
  const [stats, setStats] = useState<DeactivationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'investors' | 'syndicators' | 'admins'>('all');
  const [reactivating, setReactivating] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDeactivatedUsers();
    fetchDeactivationStats();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  async function fetchDeactivatedUsers() {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', false)
        .order('deactivated_at', { ascending: false });

      if (error) throw error;
      
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching deactivated users:', err);
      setError('Failed to load deactivated users. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchDeactivationStats() {
    try {
      // Get total count
      const { count: total } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', false);

      // Get this month's count
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      thisMonthStart.setHours(0, 0, 0, 0);

      const { count: thisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', false)
        .gte('deactivated_at', thisMonthStart.toISOString());

      // Get last month's count
      const lastMonthStart = new Date(thisMonthStart);
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
      const lastMonthEnd = new Date(thisMonthStart);
      lastMonthEnd.setTime(lastMonthEnd.getTime() - 1);

      const { count: lastMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', false)
        .gte('deactivated_at', lastMonthStart.toISOString())
        .lte('deactivated_at', lastMonthEnd.toISOString());

      // Get top reasons (this would require aggregation in a real scenario)
      const { data: reasonsData } = await supabase
        .from('profiles')
        .select('deactivation_reason')
        .eq('is_active', false)
        .not('deactivation_reason', 'is', null);

      const reasonCounts: { [key: string]: number } = {};
      reasonsData?.forEach(item => {
        if (item.deactivation_reason) {
          reasonCounts[item.deactivation_reason] = (reasonCounts[item.deactivation_reason] || 0) + 1;
        }
      });

      const topReasons = Object.entries(reasonCounts)
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        total: total || 0,
        thisMonth: thisMonth || 0,
        lastMonth: lastMonth || 0,
        topReasons
      });
    } catch (err) {
      console.error('Error fetching deactivation stats:', err);
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filter === 'all' ||
      (filter === 'investors' && user.user_type === 'investor') ||
      (filter === 'syndicators' && user.user_type === 'syndicator') ||
      (filter === 'admins' && user.is_admin);

    return matchesSearch && matchesFilter;
  });

  const reactivateUser = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      setReactivating(prev => new Set(prev).add(userId));
      setError(null);

      const { error } = await supabase.rpc('reactivate_account', {
        p_user_id: userId,
        p_reason: 'Reactivated by admin'
      });

      if (error) throw error;

      // Remove user from local state
      setUsers(users.filter(u => u.id !== userId));
      setSuccessMessage(`Successfully reactivated account for ${user.full_name || user.email}`);

      // Refresh stats
      fetchDeactivationStats();
    } catch (error) {
      console.error('Error reactivating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to reactivate user: ${errorMessage}`);
    } finally {
      setReactivating(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Total Deactivated</div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">This Month</div>
                <div className="text-2xl font-bold text-gray-900">{stats.thisMonth}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Last Month</div>
                <div className="text-2xl font-bold text-gray-900">{stats.lastMonth}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-500 mb-2">Top Reason</div>
            <div className="text-lg font-semibold text-gray-900">
              {stats.topReasons[0]?.reason || 'No data'}
            </div>
            {stats.topReasons[0] && (
              <div className="text-sm text-gray-500">{stats.topReasons[0].count} users</div>
            )}
          </div>
        </div>
      )}

      {/* Main Management Interface */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Deactivated Users</h2>
            {successMessage && (
              <div className="mt-2 text-sm text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                {successMessage}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Users</option>
              <option value="investors">Investors</option>
              <option value="syndicators">Syndicators</option>
              <option value="admins">Admins</option>
            </select>
            <button
              onClick={() => {
                fetchDeactivatedUsers();
                fetchDeactivationStats();
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-gray-500">
            Loading deactivated users...
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deactivated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const isReactivating = reactivating.has(user.id);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.avatar_url ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={user.avatar_url}
                                alt={user.full_name || 'User'}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || 'No name'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.user_type === 'syndicator' ? (
                            <Building2 className="h-4 w-4 text-blue-600 mr-2" />
                          ) : (
                            <User className="h-4 w-4 text-green-600 mr-2" />
                          )}
                          <span className="text-sm text-gray-900 capitalize">
                            {user.user_type}
                          </span>
                          {user.is_admin && (
                            <Shield className="h-4 w-4 text-purple-600 ml-2" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.deactivated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {user.deactivation_reason || 'No reason provided'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => reactivateUser(user.id)}
                          disabled={isReactivating}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isReactivating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Reactivating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reactivate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            {searchTerm || filter !== 'all' 
              ? 'No deactivated users match your search criteria' 
              : 'No deactivated users found'}
          </div>
        )}
      </div>
    </div>
  );
} 