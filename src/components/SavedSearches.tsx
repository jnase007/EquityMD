import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, BellOff, Plus, Trash2, Edit, 
  MapPin, DollarSign, TrendingUp, Building2, X, Loader2,
  Mail, Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

interface SavedSearch {
  id: string;
  name: string;
  filters: {
    location?: string;
    propertyType?: string;
    minInvestment?: number;
    maxInvestment?: number;
    minIrr?: number;
    keyword?: string;
  };
  email_alerts: boolean;
  alert_frequency: 'instant' | 'daily' | 'weekly';
  last_alerted_at: string | null;
  created_at: string;
}

const PROPERTY_TYPES = [
  'Multifamily',
  'Office',
  'Retail',
  'Industrial',
  'Mixed-Use',
  'Self-Storage',
  'Medical Office',
  'Senior Living',
];

const ALERT_FREQUENCIES = [
  { value: 'instant', label: 'Instant', description: 'Get notified immediately' },
  { value: 'daily', label: 'Daily Digest', description: 'Once per day' },
  { value: 'weekly', label: 'Weekly Digest', description: 'Once per week' },
];

export function SavedSearches() {
  const { user } = useAuthStore();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSearch, setShowNewSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minInvestment, setMinInvestment] = useState('');
  const [maxInvestment, setMaxInvestment] = useState('');
  const [minIrr, setMinIrr] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [alertFrequency, setAlertFrequency] = useState<'instant' | 'daily' | 'weekly'>('daily');

  useEffect(() => {
    if (user) {
      fetchSearches();
    }
  }, [user]);

  async function fetchSearches() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSearches(data || []);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName('');
    setLocation('');
    setPropertyType('');
    setMinInvestment('');
    setMaxInvestment('');
    setMinIrr('');
    setEmailAlerts(true);
    setAlertFrequency('daily');
    setEditingSearch(null);
  }

  function openEdit(search: SavedSearch) {
    setEditingSearch(search);
    setName(search.name);
    setLocation(search.filters.location || '');
    setPropertyType(search.filters.propertyType || '');
    setMinInvestment(search.filters.minInvestment?.toString() || '');
    setMaxInvestment(search.filters.maxInvestment?.toString() || '');
    setMinIrr(search.filters.minIrr?.toString() || '');
    setEmailAlerts(search.email_alerts);
    setAlertFrequency(search.alert_frequency);
    setShowNewSearch(true);
  }

  async function saveSearch() {
    if (!user || !name.trim()) {
      toast.error('Please enter a name for this search');
      return;
    }

    setSaving(true);
    try {
      const searchData = {
        user_id: user.id,
        name: name.trim(),
        filters: {
          location: location || undefined,
          propertyType: propertyType || undefined,
          minInvestment: minInvestment ? parseInt(minInvestment) : undefined,
          maxInvestment: maxInvestment ? parseInt(maxInvestment) : undefined,
          minIrr: minIrr ? parseFloat(minIrr) : undefined,
        },
        email_alerts: emailAlerts,
        alert_frequency: alertFrequency,
        updated_at: new Date().toISOString(),
      };

      if (editingSearch) {
        const { error } = await supabase
          .from('saved_searches')
          .update(searchData)
          .eq('id', editingSearch.id);

        if (error) throw error;
        toast.success('Search updated successfully');
      } else {
        const { error } = await supabase
          .from('saved_searches')
          .insert(searchData);

        if (error) throw error;
        toast.success('Search saved! You\'ll get alerts for matching deals.');
      }

      setShowNewSearch(false);
      resetForm();
      fetchSearches();
    } catch (error: any) {
      console.error('Error saving search:', error);
      toast.error(error.message || 'Failed to save search');
    } finally {
      setSaving(false);
    }
  }

  async function deleteSearch(searchId: string) {
    if (!confirm('Delete this saved search?')) return;

    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId);

      if (error) throw error;
      
      toast.success('Search deleted');
      fetchSearches();
    } catch (error) {
      console.error('Error deleting search:', error);
      toast.error('Failed to delete search');
    }
  }

  async function toggleAlerts(search: SavedSearch) {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .update({ email_alerts: !search.email_alerts })
        .eq('id', search.id);

      if (error) throw error;
      
      toast.success(search.email_alerts ? 'Alerts disabled' : 'Alerts enabled');
      fetchSearches();
    } catch (error) {
      console.error('Error toggling alerts:', error);
    }
  }

  const formatFilters = (filters: SavedSearch['filters']) => {
    const parts = [];
    if (filters.location) parts.push(filters.location);
    if (filters.propertyType) parts.push(filters.propertyType);
    if (filters.minInvestment || filters.maxInvestment) {
      if (filters.minInvestment && filters.maxInvestment) {
        parts.push(`$${(filters.minInvestment / 1000)}K - $${(filters.maxInvestment / 1000)}K`);
      } else if (filters.minInvestment) {
        parts.push(`$${(filters.minInvestment / 1000)}K+`);
      } else if (filters.maxInvestment) {
        parts.push(`Up to $${(filters.maxInvestment / 1000)}K`);
      }
    }
    if (filters.minIrr) parts.push(`${filters.minIrr}%+ IRR`);
    return parts.length > 0 ? parts.join(' • ') : 'All deals';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Search className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Saved Searches</h3>
              <p className="text-blue-100 text-sm">Get alerted when new deals match your criteria</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setShowNewSearch(true);
            }}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Search
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* New/Edit Search Form */}
        {showNewSearch && (
          <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">
                {editingSearch ? 'Edit Search' : 'Create Saved Search'}
              </h4>
              <button 
                onClick={() => {
                  setShowNewSearch(false);
                  resetForm();
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Dallas Multifamily Deals"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-0 focus:border-blue-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or State"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-0 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-0 focus:border-blue-500"
                >
                  <option value="">Any Type</option>
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Min Investment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Investment</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={minInvestment}
                    onChange={(e) => setMinInvestment(e.target.value)}
                    placeholder="25,000"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-0 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Max Investment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Investment</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={maxInvestment}
                    onChange={(e) => setMaxInvestment(e.target.value)}
                    placeholder="100,000"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-0 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Min IRR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Target IRR (%)</label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={minIrr}
                    onChange={(e) => setMinIrr(e.target.value)}
                    placeholder="15"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-0 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Alert Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alert Frequency</label>
                <select
                  value={alertFrequency}
                  onChange={(e) => setAlertFrequency(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-0 focus:border-blue-500"
                >
                  {ALERT_FREQUENCIES.map(freq => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>

              {/* Email Alerts Toggle */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Email Notifications</span>
                    <p className="text-sm text-gray-500">Get notified when new deals match this search</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowNewSearch(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSearch}
                disabled={!name.trim() || saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    {editingSearch ? 'Update Search' : 'Save Search'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Searches List */}
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
          </div>
        ) : searches.length === 0 && !showNewSearch ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No saved searches</h4>
            <p className="text-gray-500 mb-4">Save your search criteria to get deal alerts</p>
            <button
              onClick={() => setShowNewSearch(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create First Search
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {searches.map((search) => (
              <div
                key={search.id}
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-gray-900">{search.name}</h5>
                      {search.email_alerts ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          <Bell className="h-3 w-3" />
                          {search.alert_frequency}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                          <BellOff className="h-3 w-3" />
                          Off
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{formatFilters(search.filters)}</p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleAlerts(search)}
                      className={`p-2 rounded-lg transition-colors ${
                        search.email_alerts 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-200'
                      }`}
                      title={search.email_alerts ? 'Disable alerts' : 'Enable alerts'}
                    >
                      {search.email_alerts ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(search)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteSearch(search.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

