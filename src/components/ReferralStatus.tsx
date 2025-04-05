import React, { useState, useEffect } from 'react';
import { Users, Star, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  multiplierCredits: number;
  potentialReturn: number;
}

export function ReferralStatus() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    multiplierCredits: 0,
    potentialReturn: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralStats();
  }, []);

  async function fetchReferralStats() {
    try {
      // Get referral counts
      const { data: referrals, error: referralError } = await supabase
        .from('referrals')
        .select('status, investment_amount')
        .eq('referrer_id', user?.id);

      if (referralError) throw referralError;

      // Get multiplier credits
      const { data: profile, error: profileError } = await supabase
        .from('investor_profiles')
        .select('multiplier_credits')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      // Calculate potential return increase
      const baseReturn = referrals?.reduce((sum, ref) => sum + (ref.investment_amount || 0), 0) * 0.08;
      const multiplierReturn = baseReturn * 0.01 * (profile?.multiplier_credits || 0);

      setStats({
        totalReferrals: referrals?.length || 0,
        activeReferrals: referrals?.filter(r => r.status === 'completed').length || 0,
        multiplierCredits: profile?.multiplier_credits || 0,
        potentialReturn: multiplierReturn
      });
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading referral status...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6">Referral Status</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <div className="flex items-center mb-2">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <div className="text-sm text-gray-500">Total Referrals</div>
          </div>
          <div className="text-2xl font-bold">{stats.totalReferrals}</div>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <Users className="h-5 w-5 text-green-600 mr-2" />
            <div className="text-sm text-gray-500">Active Referrals</div>
          </div>
          <div className="text-2xl font-bold">{stats.activeReferrals}</div>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <Star className="h-5 w-5 text-yellow-600 mr-2" />
            <div className="text-sm text-gray-500">Multiplier Credits</div>
          </div>
          <div className="text-2xl font-bold">{stats.multiplierCredits}</div>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
            <div className="text-sm text-gray-500">Extra Return</div>
          </div>
          <div className="text-2xl font-bold">
            ${stats.potentialReturn.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>How it works:</strong> For each friend you refer who invests, you'll earn a Multiplier credit. 
          Each credit increases your potential return by 1% annually on your next investment. Your friends also 
          receive a Multiplier credit to boost their first investment!
        </p>
      </div>
    </div>
  );
}