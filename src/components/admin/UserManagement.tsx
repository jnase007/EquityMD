import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, User, Building2, Shield, CheckCircle, XCircle, AlertCircle, Check } from 'lucide-react';
import { useAutoSave } from '../../hooks/useAutoSave';
import { AutoSaveIndicator } from '../AutoSaveIndicator';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  user_type: 'investor' | 'syndicator';
  is_admin: boolean;
  is_verified: boolean;
  created_at: string;
  avatar_url?: string;
}

interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'investors' | 'syndicators' | 'admins'>('all');
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, Partial<UserData>>>({});

  // Auto-save hook for user updates
  const autoSave = useAutoSave(pendingUpdates, {
    delay: 1500, // Save after 1.5 seconds of no changes
    onSave: async (updates: Record<string, Partial<UserData>>) => {
      // Process all pending updates
      const updatePromises = Object.entries(updates).map(async ([userId, updateData]) => {
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);
        
        if (error) throw new Error(`Failed to update user ${userId}: ${error.message}`);
        
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, ...updateData } : user
        ));
      });

      await Promise.all(updatePromises);
      
      // Clear pending updates after successful save
      setPendingUpdates({});
    },
    onSuccess: () => {
      console.log('User updates saved successfully');
    },
    onError: (error) => {
      console.error('Failed to save user updates:', error);
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched users:', data?.length || 0);
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
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

  const toggleUserStatus = async (userId: string, field: 'is_verified' | 'is_admin') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newValue = !user[field];
    
    // Update pending updates for auto-save
    autoSave.updateData(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: newValue
      }
    }));

    // Optimistically update the UI
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, [field]: newValue } : u
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold">User Management</h2>
          <AutoSaveIndicator 
            state={autoSave.state} 
            className="ml-4"
            showDetails={false}
          />
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
        </div>
      </div>

      {/* Auto-save status details */}
      {(autoSave.hasUnsavedChanges || autoSave.lastSaved) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <AutoSaveIndicator 
            state={autoSave.state} 
            showDetails={true}
          />
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-500">
          Loading users...
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const hasPendingUpdates = pendingUpdates[user.id];
                return (
                  <tr key={user.id} className={hasPendingUpdates ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name || 'User'}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.full_name || 'Unnamed User'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.user_type === 'investor' ? (
                          <User className="h-5 w-5 text-blue-600 mr-2" />
                        ) : (
                          <Building2 className="h-5 w-5 text-green-600 mr-2" />
                        )}
                        <span className="capitalize">{user.user_type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserStatus(user.id, 'is_verified')}
                        className={`flex items-center px-3 py-1 rounded-full text-sm transition-colors ${
                          user.is_verified
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        {user.is_verified ? (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        {user.is_verified ? 'Verified' : 'Unverified'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserStatus(user.id, 'is_admin')}
                        className={`flex items-center px-3 py-1 rounded-full text-sm transition-colors ${
                          user.is_admin
                            ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        {user.is_admin ? 'Admin' : 'User'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
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
            ? 'No users match your search criteria' 
            : 'No users found in the system'}
        </div>
      )}
    </div>
  );
}