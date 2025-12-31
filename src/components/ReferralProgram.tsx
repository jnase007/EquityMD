import React, { useState, useEffect } from 'react';
import { 
  Gift, Users, Copy, CheckCircle, Share2, 
  DollarSign, Trophy, Star, ChevronRight, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalEarned: number;
}

interface Referral {
  id: string;
  referred_id: string;
  status: 'pending' | 'completed' | 'rewarded';
  reward_amount: number | null;
  created_at: string;
  referred: {
    profile: {
      full_name: string;
    } | null;
  };
}

const REWARDS = [
  { referrals: 1, reward: '$25 credit', description: 'Refer your first investor' },
  { referrals: 5, reward: '$150 credit', description: 'Refer 5 investors' },
  { referrals: 10, reward: 'Featured Placement', description: 'Get featured on the homepage' },
  { referrals: 25, reward: 'Premium Badge', description: 'Stand out with a verified referrer badge' },
];

export function ReferralProgram() {
  const { user, profile } = useAuthStore();
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    pendingReferrals: 0,
    completedReferrals: 0,
    totalEarned: 0,
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      generateOrFetchCode();
      fetchReferrals();
    }
  }, [user]);

  async function generateOrFetchCode() {
    if (!user) return;

    // Generate a unique referral code based on user ID
    const code = `EQ${user.id.substring(0, 8).toUpperCase()}`;
    setReferralCode(code);
  }

  async function fetchReferrals() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred:referred_id (
            profile:profiles (full_name)
          )
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const referralData = data || [];
      setReferrals(referralData);

      // Calculate stats
      const total = referralData.length;
      const pending = referralData.filter(r => r.status === 'pending').length;
      const completed = referralData.filter(r => ['completed', 'rewarded'].includes(r.status)).length;
      const earned = referralData
        .filter(r => r.status === 'rewarded')
        .reduce((sum, r) => sum + (r.reward_amount || 0), 0);

      setStats({
        totalReferrals: total,
        pendingReferrals: pending,
        completedReferrals: completed,
        totalEarned: earned,
      });
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  }

  function copyReferralLink() {
    const link = `${window.location.origin}/signup/start?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  function shareReferral() {
    const link = `${window.location.origin}/signup/start?ref=${referralCode}`;
    const text = `Join me on EquityMD - the premier platform for real estate syndication investments. Sign up with my link: ${link}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join EquityMD',
        text: text,
        url: link,
      });
    } else {
      copyReferralLink();
    }
  }

  const getNextReward = () => {
    const completed = stats.completedReferrals;
    return REWARDS.find(r => r.referrals > completed) || REWARDS[REWARDS.length - 1];
  };

  const progressToNextReward = () => {
    const nextReward = getNextReward();
    const prevThreshold = REWARDS[REWARDS.indexOf(nextReward) - 1]?.referrals || 0;
    const progress = ((stats.completedReferrals - prevThreshold) / (nextReward.referrals - prevThreshold)) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Referral Program</h3>
            <p className="text-pink-100">Earn rewards for every investor you refer</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
            <p className="text-sm text-gray-500">Total Referrals</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.completedReferrals}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Trophy className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{REWARDS.filter(r => stats.completedReferrals >= r.referrals).length}</p>
            <p className="text-sm text-gray-500">Rewards Unlocked</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <DollarSign className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-600">${stats.totalEarned}</p>
            <p className="text-sm text-gray-500">Total Earned</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 mb-8 border border-pink-200">
          <h4 className="font-semibold text-gray-900 mb-3">Your Referral Link</h4>
          <div className="flex gap-3">
            <div className="flex-1 bg-white rounded-lg border border-pink-200 px-4 py-3 font-mono text-sm text-gray-700 overflow-hidden overflow-ellipsis">
              {`${window.location.origin}/signup/start?ref=${referralCode}`}
            </div>
            <button
              onClick={copyReferralLink}
              className={`px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-pink-600 text-white hover:bg-pink-700'
              }`}
            >
              {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={shareReferral}
              className="px-4 py-3 bg-white border border-pink-200 text-pink-600 rounded-lg font-medium hover:bg-pink-50 transition-colors flex items-center gap-2"
            >
              <Share2 className="h-5 w-5" />
              Share
            </button>
          </div>
        </div>

        {/* Progress to Next Reward */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900">Next Reward</h4>
              <p className="text-sm text-gray-500">{getNextReward().description}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-pink-600">{getNextReward().reward}</p>
              <p className="text-sm text-gray-500">
                {stats.completedReferrals} / {getNextReward().referrals} referrals
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-pink-500 to-rose-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressToNextReward()}%` }}
            />
          </div>
        </div>

        {/* Rewards Tiers */}
        <div className="mb-8">
          <h4 className="font-semibold text-gray-900 mb-4">Rewards Tiers</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {REWARDS.map((reward, idx) => {
              const isUnlocked = stats.completedReferrals >= reward.referrals;
              
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isUnlocked 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                    isUnlocked ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {isUnlocked ? <CheckCircle className="h-5 w-5" /> : <Star className="h-5 w-5" />}
                  </div>
                  <p className="font-semibold text-gray-900">{reward.reward}</p>
                  <p className="text-sm text-gray-500">{reward.referrals} referrals</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Referrals */}
        {referrals.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Recent Referrals</h4>
            <div className="space-y-3">
              {referrals.slice(0, 5).map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {referral.referred?.profile?.full_name || 'New User'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    referral.status === 'rewarded' 
                      ? 'bg-green-100 text-green-700' 
                      : referral.status === 'completed'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-8 p-6 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-4">How It Works</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-pink-600">1</span>
              </div>
              <h5 className="font-medium text-gray-900 mb-1">Share Your Link</h5>
              <p className="text-sm text-gray-500">Send your unique referral link to friends and colleagues</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-pink-600">2</span>
              </div>
              <h5 className="font-medium text-gray-900 mb-1">They Sign Up</h5>
              <p className="text-sm text-gray-500">When they create an account using your link</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-pink-600">3</span>
              </div>
              <h5 className="font-medium text-gray-900 mb-1">Earn Rewards</h5>
              <p className="text-sm text-gray-500">Get credits and perks for each successful referral</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

