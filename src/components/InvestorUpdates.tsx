import React, { useState, useEffect } from 'react';
import { 
  Bell, Send, Users, DollarSign, FileText, Calendar,
  CheckCircle, Clock, X, Loader2, Plus, Edit, Trash2,
  TrendingUp, AlertCircle, ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

interface Update {
  id: string;
  deal_id: string;
  title: string;
  content: string;
  update_type: 'general' | 'distribution' | 'milestone' | 'financial';
  distribution_amount?: number;
  created_at: string;
  deal: {
    title: string;
    slug: string;
  };
}

interface InvestorUpdatesProps {
  dealId?: string;
  syndicatorId: string;
}

const UPDATE_TYPES = [
  { value: 'general', label: 'General Update', icon: Bell, color: 'blue' },
  { value: 'distribution', label: 'Distribution Notice', icon: DollarSign, color: 'green' },
  { value: 'milestone', label: 'Milestone Achieved', icon: TrendingUp, color: 'purple' },
  { value: 'financial', label: 'Financial Report', icon: FileText, color: 'orange' },
];

export function InvestorUpdates({ dealId, syndicatorId }: InvestorUpdatesProps) {
  const { user } = useAuthStore();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewUpdate, setShowNewUpdate] = useState(false);
  const [sending, setSending] = useState(false);
  const [deals, setDeals] = useState<any[]>([]);
  
  // Form state
  const [selectedDeal, setSelectedDeal] = useState(dealId || '');
  const [updateType, setUpdateType] = useState('general');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [distributionAmount, setDistributionAmount] = useState('');

  useEffect(() => {
    fetchUpdates();
    if (!dealId) {
      fetchDeals();
    }
  }, [syndicatorId, dealId]);

  async function fetchDeals() {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('id, title, slug')
        .eq('syndicator_id', syndicatorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
      if (data && data.length > 0 && !selectedDeal) {
        setSelectedDeal(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  }

  async function fetchUpdates() {
    try {
      let query = supabase
        .from('investor_updates')
        .select(`
          *,
          deal:deals (title, slug)
        `)
        .order('created_at', { ascending: false });

      if (dealId) {
        query = query.eq('deal_id', dealId);
      } else {
        // Get all updates for syndicator's deals
        const { data: dealIds } = await supabase
          .from('deals')
          .select('id')
          .eq('syndicator_id', syndicatorId);

        if (dealIds && dealIds.length > 0) {
          query = query.in('deal_id', dealIds.map(d => d.id));
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  }

  async function sendUpdate() {
    if (!selectedDeal || !title.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      // Create the update
      const { data: updateData, error: updateError } = await supabase
        .from('investor_updates')
        .insert({
          deal_id: selectedDeal,
          title: title.trim(),
          content: content.trim(),
          update_type: updateType,
          distribution_amount: updateType === 'distribution' ? parseFloat(distributionAmount) || 0 : null,
        })
        .select()
        .single();

      if (updateError) throw updateError;

      // Get all investors with interest in this deal
      const { data: interests } = await supabase
        .from('deal_interests')
        .select('user_id')
        .eq('deal_id', selectedDeal);

      // Get investors who have invested
      const { data: investments } = await supabase
        .from('investments')
        .select('user_id')
        .eq('deal_id', selectedDeal);

      // Combine unique user IDs
      const userIds = new Set([
        ...(interests?.map(i => i.user_id) || []),
        ...(investments?.map(i => i.user_id) || []),
      ]);

      // Create notifications for all investors
      const notifications = Array.from(userIds).map(userId => ({
        user_id: userId,
        type: 'deal_update',
        title: `New Update: ${title}`,
        content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        link: `/deals/${(deals.find(d => d.id === selectedDeal) || { slug: selectedDeal }).slug}`,
        is_read: false,
      }));

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
      }

      toast.success(`Update sent to ${userIds.size} investor${userIds.size !== 1 ? 's' : ''}!`);
      
      // Reset form
      setShowNewUpdate(false);
      setTitle('');
      setContent('');
      setDistributionAmount('');
      setUpdateType('general');
      
      fetchUpdates();
    } catch (error: any) {
      console.error('Error sending update:', error);
      toast.error(error.message || 'Failed to send update');
    } finally {
      setSending(false);
    }
  }

  async function deleteUpdate(updateId: string) {
    if (!confirm('Are you sure you want to delete this update?')) return;

    try {
      const { error } = await supabase
        .from('investor_updates')
        .delete()
        .eq('id', updateId);

      if (error) throw error;
      
      toast.success('Update deleted');
      fetchUpdates();
    } catch (error) {
      console.error('Error deleting update:', error);
      toast.error('Failed to delete update');
    }
  }

  const getUpdateIcon = (type: string) => {
    const updateType = UPDATE_TYPES.find(t => t.value === type);
    if (!updateType) return Bell;
    return updateType.icon;
  };

  const getUpdateColor = (type: string) => {
    switch (type) {
      case 'distribution': return 'bg-green-100 text-green-600';
      case 'milestone': return 'bg-purple-100 text-purple-600';
      case 'financial': return 'bg-orange-100 text-orange-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Investor Updates</h3>
              <p className="text-indigo-100 text-sm">Keep your investors informed</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowNewUpdate(true)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Update
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* New Update Form */}
        {showNewUpdate && (
          <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Create New Update</h4>
              <button onClick={() => setShowNewUpdate(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Deal Selector */}
              {!dealId && deals.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deal</label>
                  <select
                    value={selectedDeal}
                    onChange={(e) => setSelectedDeal(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-0 focus:border-indigo-500"
                  >
                    {deals.map(deal => (
                      <option key={deal.id} value={deal.id}>{deal.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Update Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {UPDATE_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setUpdateType(type.value)}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        updateType === type.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <type.icon className={`h-5 w-5 ${updateType === type.value ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className={`text-xs font-medium ${updateType === type.value ? 'text-indigo-600' : 'text-gray-600'}`}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Distribution Amount */}
              {updateType === 'distribution' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Distribution Amount (per share)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={distributionAmount}
                      onChange={(e) => setDistributionAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-0 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Q4 2024 Distribution Notice"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-0 focus:border-indigo-500"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your update message here..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-0 focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowNewUpdate(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendUpdate}
                  disabled={!title.trim() || !content.trim() || sending}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Update
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Updates List */}
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No updates yet</h4>
            <p className="text-gray-500 mb-4">Keep your investors engaged with regular updates</p>
            <button
              onClick={() => setShowNewUpdate(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create First Update
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => {
              const Icon = getUpdateIcon(update.update_type);
              
              return (
                <div
                  key={update.id}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getUpdateColor(update.update_type)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h5 className="font-semibold text-gray-900">{update.title}</h5>
                          <p className="text-sm text-gray-500">
                            {update.deal?.title} • {new Date(update.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => deleteUpdate(update.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-2">{update.content}</p>
                      
                      {update.update_type === 'distribution' && update.distribution_amount && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          <DollarSign className="h-3 w-3" />
                          ${update.distribution_amount.toLocaleString()} per share
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

