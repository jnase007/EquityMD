import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Target, MapPin, Building2, DollarSign, 
  ArrowRight, Bell, Check, TrendingUp, Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

interface MatchedDeal {
  id: string;
  title: string;
  slug: string;
  location: string;
  property_type: string;
  target_irr: number;
  minimum_investment: number;
  cover_image_url: string;
  match_score: number;
  match_reasons: string[];
}

export function SmartMatchingCard() {
  const { user } = useAuthStore();
  const [matchedDeals, setMatchedDeals] = useState<MatchedDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<any>(null);
  const [emailEnabled, setEmailEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMatchedDeals();
      fetchEmailPreference();
    }
  }, [user]);

  async function fetchEmailPreference() {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('email_notifications')
        .eq('id', user!.id)
        .single();
      
      setEmailEnabled(data?.email_notifications ?? false);
    } catch (error) {
      console.error('Error fetching email preference:', error);
    }
  }

  async function toggleEmailAlerts() {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ email_notifications: !emailEnabled })
        .eq('id', user!.id);

      if (error) throw error;
      
      setEmailEnabled(!emailEnabled);
      toast.success(emailEnabled ? 'Deal alerts disabled' : 'Deal alerts enabled! 🎯');
    } catch (error) {
      console.error('Error toggling email alerts:', error);
      toast.error('Failed to update preference');
    }
  }

  async function fetchMatchedDeals() {
    try {
      // Fetch investor preferences
      const { data: investorProfile } = await supabase
        .from('investor_profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      setPreferences(investorProfile);

      // Fetch active deals
      const { data: deals } = await supabase
        .from('deals')
        .select(`
          *,
          syndicators (
            company_name,
            verification_status
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!deals) {
        setMatchedDeals([]);
        return;
      }

      // Calculate match scores
      const scored = deals.map(deal => {
        let score = 0;
        const reasons: string[] = [];

        // Property type match
        if (investorProfile?.preferred_property_types?.includes(deal.property_type)) {
          score += 30;
          reasons.push('Matches your property type preference');
        }

        // Location match
        const dealState = deal.location?.split(',').pop()?.trim();
        if (investorProfile?.preferred_locations?.some((loc: string) => 
          deal.location?.toLowerCase().includes(loc.toLowerCase())
        )) {
          score += 25;
          reasons.push('In your preferred location');
        }

        // Budget match
        if (investorProfile?.minimum_investment) {
          const minBudget = investorProfile.minimum_investment;
          if (deal.minimum_investment <= minBudget * 2) {
            score += 25;
            reasons.push('Within your investment budget');
          }
        }

        // Verified syndicator bonus
        if (deal.syndicators?.verification_status === 'verified' || 
            deal.syndicators?.verification_status === 'premier') {
          score += 10;
          reasons.push('Verified syndicator');
        }

        // Recent deal bonus
        const daysSincePosted = Math.floor(
          (Date.now() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSincePosted <= 7) {
          score += 10;
          reasons.push('New listing');
        }

        return {
          ...deal,
          match_score: Math.min(score, 100),
          match_reasons: reasons,
        };
      });

      // Sort by match score and take top 4
      const topMatches = scored
        .filter(d => d.match_score > 0)
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, 4);

      setMatchedDeals(topMatches);
    } catch (error) {
      console.error('Error fetching matched deals:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700';
    if (score >= 60) return 'bg-blue-100 text-blue-700';
    if (score >= 40) return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-sm border border-indigo-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <Target className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Smart Matches</h3>
            <p className="text-sm text-gray-500">Deals tailored to your preferences</p>
          </div>
        </div>
        
        <button
          onClick={toggleEmailAlerts}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            emailEnabled 
              ? 'bg-indigo-600 text-white' 
              : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
          }`}
        >
          {emailEnabled ? <Check className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          {emailEnabled ? 'Alerts On' : 'Get Alerts'}
        </button>
      </div>

      {/* Matched Deals */}
      {matchedDeals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matchedDeals.map((deal) => (
            <Link
              key={deal.id}
              to={`/deals/${deal.slug}`}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition group"
            >
              <div className="flex gap-3">
                <img
                  src={deal.cover_image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'}
                  alt={deal.title}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{deal.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getScoreColor(deal.match_score)}`}>
                      {deal.match_score}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3" />
                    {deal.location}
                  </p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-indigo-600 font-medium">{deal.target_irr}% IRR</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{formatCurrency(deal.minimum_investment)} min</span>
                  </div>
                </div>
              </div>
              
              {/* Match Reasons */}
              {deal.match_reasons.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1">
                    {deal.match_reasons.slice(0, 2).map((reason, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        <Sparkles className="h-3 w-3" />
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Complete your profile to get personalized matches</p>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Update Preferences
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* See All Link */}
      {matchedDeals.length > 0 && (
        <Link
          to="/find"
          className="flex items-center justify-center gap-2 mt-4 py-2 text-indigo-600 font-medium hover:text-indigo-700 transition"
        >
          Browse All Deals
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

