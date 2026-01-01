import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, User, Building2, Shield, CheckCircle, XCircle, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Plus, Mail } from 'lucide-react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  user_type: 'investor' | 'syndicator';
  is_admin: boolean;
  is_verified: boolean;
  is_active?: boolean;
  created_at: string;
  avatar_url?: string;
}

type SortField = 'created_at' | 'full_name' | 'email';
type SortDirection = 'asc' | 'desc';

export function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'investors' | 'syndicators' | 'admins'>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Create user modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUserData, setCreateUserData] = useState({
    email: '',
    full_name: '',
    user_type: 'investor' as 'investor' | 'syndicator'
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [profileDetails, setProfileDetails] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUserType, setInviteUserType] = useState<'investor' | 'syndicator'>('investor');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [sortField, sortDirection]);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) throw error;
      
      console.log('Fetched users:', data?.length || 0, 'sorted by', sortField, sortDirection);
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4 text-blue-600" /> : 
      <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  // Add deactivate/reactivate logic
  const toggleActiveStatus = async (userId: string, currentStatus: boolean) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'reactivate'} this user?`)) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId)
        .select();
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, is_active: !currentStatus });
      }
    } catch (err) {
      alert('Failed to update user status.');
    }
  };

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
    try {
      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      console.log(`Attempting to toggle ${field} for user:`, user.email, 'from', user[field], 'to', !user[field]);

      const { data, error } = await supabase
        .from('profiles')
        .update({ [field]: !user[field] })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Update successful:', data);

      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, [field]: !u[field] } : u
      ));

      // Show success message
      const action = field === 'is_admin' ? (user[field] ? 'removed admin access from' : 'granted admin access to') : (user[field] ? 'unverified' : 'verified');
      console.log(`Successfully ${action} ${user.email}`);

    } catch (err) {
      console.error('Error toggling user status:', err);
      setError('Failed to update user status. Please try again.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setCreateError(null);
    setCreateSuccess(false);

    try {
      // Validate input
      if (!createUserData.email || !createUserData.full_name) {
        throw new Error('Please fill in all required fields');
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: createUserData.email,
        password: tempPassword,
        options: {
          data: {
            full_name: createUserData.full_name,
            user_type: createUserData.user_type
          }
        }
      });

      if (authError) throw authError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user!.id,
          email: createUserData.email,
          full_name: createUserData.full_name,
          user_type: createUserData.user_type,
          is_verified: true
        }]);

      if (profileError) throw profileError;

      // Create user-specific profile if needed
      if (createUserData.user_type === 'investor') {
        const { error: investorError } = await supabase
          .from('investor_profiles')
          .insert([{
            id: authData.user!.id,
            accredited_status: false,
            minimum_investment: 0,
            investment_preferences: {
              specialty: [],
              hospital: '',
              location: ''
            }
          }]);

        if (investorError) throw investorError;
      } else if (createUserData.user_type === 'syndicator') {
        const { error: syndicatorError } = await supabase
          .from('syndicator_profiles')
          .insert([{
            id: authData.user!.id,
            company_name: createUserData.full_name,
            company_description: '',
            is_verified: false
          }]);

        if (syndicatorError) throw syndicatorError;
      }

      // Send invitation email
      await supabase.functions.invoke('send-email', {
        body: {
          to: createUserData.email,
          subject: 'Welcome to EquityMD - Your Account Has Been Created',
          content: `
Hello ${createUserData.full_name},

Welcome to EquityMD! Your account has been created by our admin team.

Your login credentials:
Email: ${createUserData.email}
Temporary Password: ${tempPassword}

Please log in at https://equitymd.com and change your password immediately for security.

Account Type: ${createUserData.user_type === 'investor' ? 'Investor' : 'Syndicator'}

If you have any questions, please contact us at hello@equitymd.com.

Best regards,
The EquityMD Team
          `,
          type: 'invitation'
        }
      });

      setCreateSuccess(true);
      setCreateUserData({ email: '', full_name: '', user_type: 'investor' });
      
      // Refresh user list
      await fetchUsers();

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess(false);
      }, 2000);

    } catch (err) {
      console.error('Error creating user:', err);
      setCreateError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(false);
    try {
      // Call your email service or Supabase function to send invite
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: inviteEmail,
          subject: 'You are invited to join EquityMD',
          content: `
Hello,

You have been invited to join EquityMD as a ${inviteUserType === 'investor' ? 'Investor' : 'Syndicator'}.

${inviteMessage ? `Personal message: ${inviteMessage}\n\n` : ''}
Click the link below to sign up and get started:

https://equitymd.com/signup/start?email=${encodeURIComponent(inviteEmail)}&type=${inviteUserType}

If you have any questions, contact us at hello@equitymd.com.

Best regards,\nThe EquityMD Team
          `,
          type: 'invitation'
        }
      });
      if (error) throw error;
      setInviteSuccess(true);
      setInviteEmail('');
      setInviteUserType('investor');
      setInviteMessage('');
    } catch (err) {
      setInviteError('Failed to send invitation. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  }

  // Fetch full profile details for drawer
  const openUserDrawer = async (user: UserData) => {
    setSelectedUser(user);
    setDrawerOpen(true);
    setProfileLoading(true);
    try {
      // Fetch investor or syndicator profile
      let details = null;
      if (user.user_type === 'investor') {
        const { data } = await supabase
          .from('investor_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        details = data;
      } else {
        const { data } = await supabase
          .from('syndicator_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        details = data;
      }
      setProfileDetails(details);
    } catch (err) {
      setProfileDetails(null);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Invite User
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create User
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Users</option>
            <option value="investors">Investors</option>
            <option value="syndicators">Syndicators</option>
            <option value="admins">Admins</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-1">
                    Joined
                    {getSortIcon('created_at')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50 ${user.is_active === false ? 'bg-gray-100 opacity-60' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={`${user.full_name || 'User'} avatar`} className="h-10 w-10 rounded-full" />
                        ) : (
                          <User className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>{new Date(user.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(user.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.user_type === 'investor' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.user_type === 'investor' ? (
                        <User className="h-3 w-3 mr-1" />
                      ) : (
                        <Building2 className="h-3 w-3 mr-1" />
                      )}
                      {user.user_type === 'investor' ? 'Investor' : 'Syndicator'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleUserStatus(user.id, 'is_verified')}
                      className={`flex items-center px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80 ${
                        user.is_verified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
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
                      className={`flex items-center px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80 ${
                        user.is_admin
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      {user.is_admin ? 'Admin' : 'User'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActiveStatus(user.id, user.is_active !== false)}
                      className={`flex items-center px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80 ${user.is_active === false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {user.is_active === false ? 'Reactivate' : 'Deactivate'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openUserDrawer(user)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Detail Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        direction="right"
        size={400}
        className="p-0"
      >
        <div className="p-6 h-full flex flex-col">
          {selectedUser && (
            <>
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt={`${selectedUser.full_name || 'User'} avatar`} className="h-12 w-12 rounded-full" />
                  ) : (
                    <User className="h-6 w-6 text-gray-600" />
                  )}
                </div>
                <div className="ml-4">
                  <div className="text-lg font-bold">{selectedUser.full_name}</div>
                  <div className="text-sm text-gray-500">{selectedUser.email}</div>
                  <div className="text-xs text-gray-400 mt-1">{selectedUser.user_type === 'investor' ? 'Investor' : 'Syndicator'}</div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-xs text-gray-500">Joined: {new Date(selectedUser.created_at).toLocaleDateString()}</div>
                <div className="text-xs text-gray-500">Status: {selectedUser.is_verified ? 'Verified' : 'Unverified'}</div>
                <div className="text-xs text-gray-500">Admin: {selectedUser.is_admin ? 'Yes' : 'No'}</div>
                <div className="text-xs text-gray-500">Active: {selectedUser.is_active === false ? 'No' : 'Yes'}</div>
              </div>
              {/* Deactivate/Reactivate button in drawer */}
              <button
                onClick={() => toggleActiveStatus(selectedUser.id, selectedUser.is_active !== false)}
                className={`mb-4 w-full px-4 py-2 rounded-lg ${selectedUser.is_active === false ? 'bg-green-600 text-white' : 'bg-red-600 text-white'} font-semibold`}
              >
                {selectedUser.is_active === false ? 'Reactivate User' : 'Deactivate User'}
              </button>
              {profileLoading ? (
                <div className="text-center py-8">Loading profile...</div>
              ) : profileDetails ? (
                <div className="space-y-4 overflow-y-auto flex-1">
                  {selectedUser.user_type === 'investor' ? (
                    <>
                      <div>
                        <div className="font-semibold text-gray-700 mb-1">Investment Range</div>
                        <div className="text-gray-900">${profileDetails.minimum_investment?.toLocaleString() || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700 mb-1">Property Types</div>
                        <div className="text-gray-900">{profileDetails.preferred_property_types?.join(', ') || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700 mb-1">Preferred Locations</div>
                        <div className="text-gray-900">{profileDetails.preferred_locations?.join(', ') || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700 mb-1">Experience Level</div>
                        <div className="text-gray-900">{profileDetails.investment_preferences?.experience_level || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700 mb-1">Years Investing</div>
                        <div className="text-gray-900">{profileDetails.investment_preferences?.years_investing || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700 mb-1">Bio</div>
                        <div className="text-gray-900">{profileDetails.investment_preferences?.bio || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700 mb-1">Accredited</div>
                        <div className="text-gray-900">{profileDetails.accredited_status ? 'Yes' : 'No'}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="font-semibold text-gray-700 mb-1">Company Name</div>
                        <div className="text-gray-900">{profileDetails.company_name}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700 mb-1">Description</div>
                        <div className="text-gray-900">{profileDetails.company_description}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700 mb-1">Website</div>
                        <div className="text-gray-900">{profileDetails.website_url || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700 mb-1">LinkedIn</div>
                        <div className="text-gray-900">{profileDetails.linkedin_url || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700 mb-1">Years in Business</div>
                        <div className="text-gray-900">{profileDetails.years_in_business || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700 mb-1">Total Deal Volume</div>
                        <div className="text-gray-900">${profileDetails.total_deal_volume?.toLocaleString() || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700 mb-1">Location</div>
                        <div className="text-gray-900">{profileDetails.city}, {profileDetails.state}</div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No profile details found.</div>
              )}
              {/* Admin Actions (future: verify, deactivate, etc.) */}
            </>
          )}
        </div>
      </Drawer>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Create New User</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={createUserData.email}
                    onChange={(e) => setCreateUserData({...createUserData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={createUserData.full_name}
                    onChange={(e) => setCreateUserData({...createUserData, full_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Type *
                  </label>
                  <select
                    value={createUserData.user_type}
                    onChange={(e) => setCreateUserData({...createUserData, user_type: e.target.value as 'investor' | 'syndicator'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="investor">Investor</option>
                    <option value="syndicator">Syndicator</option>
                  </select>
                </div>
              </div>

              {createError && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
                  {createError}
                </div>
              )}

              {createSuccess && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  User created successfully! Invitation email sent.
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creatingUser ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Create & Send Invitation
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Invite New User</h2>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSendInvite} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Type *
                  </label>
                  <select
                    value={inviteUserType}
                    onChange={e => setInviteUserType(e.target.value as 'investor' | 'syndicator')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="investor">Investor</option>
                    <option value="syndicator">Syndicator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Personal Message (optional)
                  </label>
                  <textarea
                    value={inviteMessage}
                    onChange={e => setInviteMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
              </div>
              {inviteError && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">{inviteError}</div>
              )}
              {inviteSuccess && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Invitation sent successfully!
                </div>
              )}
              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {inviteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}