import React, { useState, useEffect } from 'react';
import { Users, Gift } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface InviteStats {
  totalInvites: number;
  pendingInvites: number;
  acceptedInvites: number;
  creditsEarned: number;
}

export function InviteStatus() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<InviteStats>({
    totalInvites: 0,
    pendingInvites: 0,
    acceptedInvites: 0,
    creditsEarned: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInviteStats();
  }, []);

  async function fetchInviteStats() {
    try {
      // Get invite counts
      const { data: invites, error: inviteError } = await supabase
        .from('invites')
        .select('status')
        .eq('sender_id', user?.id);

      if (inviteError) throw inviteError;

      // Get credits earned from invites
      const { data: credits, error: creditError } = await supabase
        .from('invite_credits')
        .select('amount')
        .eq('user_id', user?.id)
        .eq('type', 'earned');

      if (creditError) throw creditError;

      setStats({
        totalInvites: invites?.length || 0,
        pendingInvites: invites?.filter(i => i.status === 'pending').length || 0,
        acceptedInvites: invites?.filter(i => i.status === 'accepted').length || 0,
        creditsEarned: credits?.reduce((sum, c) => sum + c.amount, 0) || 0
      });
    } catch (error) {
      console.error('Error fetching invite stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading invite status...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6">Invite Status</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <div className="flex items-center mb-2">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <div className="text-sm text-gray-500">Total Invites</div>
          </div>
          <div className="text-2xl font-bold">{stats.totalInvites}</div>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <Users className="h-5 w-5 text-yellow-600 mr-2" />
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="text-2xl font-bold">{stats.pendingInvites}</div>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <Users className="h-5 w-5 text-green-600 mr-2" />
            <div className="text-sm text-gray-500">Accepted</div>
          </div>
          <div className="text-2xl font-bold">{stats.acceptedInvites}</div>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <Gift className="h-5 w-5 text-purple-600 mr-2" />
            <div className="text-sm text-gray-500">Credits Earned</div>
          </div>
          <div className="text-2xl font-bold">{stats.creditsEarned}</div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Pro Tip:</strong> Earn 50 credits for each friend who joins and completes their profile. Your friends will also receive 50 credits to get started!
        </p>
      </div>
    </div>
  );
}