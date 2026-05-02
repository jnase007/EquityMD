import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { Users, MapPin, Shield, BadgeCheck, TrendingUp, Clock, Mail, Briefcase, Lock, Star, ChevronRight, AlertCircle } from 'lucide-react';

interface InvestorCard {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  location: string | null;
  accredited_status: boolean;
  preferred_property_types: string[];
  preferred_locations: string[];
  risk_tolerance: string | null;
  investment_goals: string | null;
  created_at: string;
}

// Placeholder data for blurred cards (non-subscribed view)
const PLACEHOLDER_INVESTORS: InvestorCard[] = [
  {
    id: '1', full_name: 'Michael Richardson', email: '', avatar_url: null,
    location: 'Los Angeles, CA', accredited_status: true,
    preferred_property_types: ['Multifamily', 'Industrial'],
    preferred_locations: ['Southern California', 'Texas'],
    risk_tolerance: 'Moderate', investment_goals: 'Cash flow + appreciation',
    created_at: new Date().toISOString(),
  },
  {
    id: '2', full_name: 'Sarah Chen', email: '', avatar_url: null,
    location: 'San Francisco, CA', accredited_status: true,
    preferred_property_types: ['Office', 'Mixed-Use'],
    preferred_locations: ['Bay Area', 'Pacific Northwest'],
    risk_tolerance: 'Conservative', investment_goals: 'Stable returns',
    created_at: new Date().toISOString(),
  },
  {
    id: '3', full_name: 'David Thompson', email: '', avatar_url: null,
    location: 'Austin, TX', accredited_status: false,
    preferred_property_types: ['Multifamily'],
    preferred_locations: ['Texas', 'Southeast'],
    risk_tolerance: 'Aggressive', investment_goals: 'High growth',
    created_at: new Date().toISOString(),
  },
  {
    id: '4', full_name: 'Jennifer Park', email: '', avatar_url: null,
    location: 'New York, NY', accredited_status: true,
    preferred_property_types: ['Retail', 'Multifamily', 'Industrial'],
    preferred_locations: ['Northeast', 'Mid-Atlantic'],
    risk_tolerance: 'Moderate', investment_goals: 'Diversification',
    created_at: new Date().toISOString(),
  },
];

function InvestorCardComponent({ investor, blurred = false }: { investor: InvestorCard; blurred?: boolean }) {
  return (
    <div className={`relative bg-gray-900 border border-gray-800 rounded-xl p-6 transition-all hover:border-gray-700 ${blurred ? 'select-none' : ''}`}>
      {blurred && (
        <div className="absolute inset-0 backdrop-blur-md bg-gray-900/30 rounded-xl z-10" />
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
            {investor.full_name.charAt(0)}
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{investor.full_name}</h3>
            {investor.location && (
              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <MapPin className="h-3 w-3" />
                {investor.location}
              </div>
            )}
          </div>
        </div>
        {investor.accredited_status && (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20">
            <BadgeCheck className="h-3.5 w-3.5" />
            Accredited
          </span>
        )}
      </div>

      <div className="space-y-3">
        {investor.preferred_property_types.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1.5">
              <Briefcase className="h-3 w-3" />
              INVESTMENT PREFERENCES
            </div>
            <div className="flex flex-wrap gap-1.5">
              {investor.preferred_property_types.map((type) => (
                <span key={type} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs border border-blue-500/20">
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {investor.preferred_locations.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1.5">
              <MapPin className="h-3 w-3" />
              PREFERRED LOCATIONS
            </div>
            <div className="flex flex-wrap gap-1.5">
              {investor.preferred_locations.map((loc) => (
                <span key={loc} className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs">
                  {loc}
                </span>
              ))}
            </div>
          </div>
        )}

        {investor.risk_tolerance && (
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-gray-400 text-sm">Risk: <span className="text-gray-300">{investor.risk_tolerance}</span></span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-gray-400 text-sm">
            Joined {new Date(investor.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {!blurred && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <a
            href={`mailto:${investor.email}`}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Mail className="h-4 w-4" />
            Contact Investor
          </a>
        </div>
      )}
    </div>
  );
}

export default function InvestorFeed() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [investors, setInvestors] = useState<InvestorCard[]>([]);
  const [syndicator, setSyndicator] = useState<any>(null);
  const [isSyndicator, setIsSyndicator] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        // Check if user is a syndicator
        const { data: syndData, error: syndError } = await supabase
          .from('syndicators')
          .select('*')
          .eq('claimed_by', user!.id)
          .maybeSingle();

        if (syndError) {
          // If column doesn't exist yet (pre-migration), treat as non-subscribed
          if (syndError.message?.includes('subscription_status')) {
            setSyndicator({ subscription_status: 'none' });
            setIsSyndicator(true);
            setLoading(false);
            return;
          }
          console.error('Error fetching syndicator:', syndError);
        }

        if (!syndData) {
          setIsSyndicator(false);
          setLoading(false);
          return;
        }

        setIsSyndicator(true);
        setSyndicator(syndData);

        // If subscribed, fetch investors
        const subscriptionStatus = syndData.subscription_status || 'none';
        if (subscriptionStatus === 'active' && syndData.subscribed_at) {
          const { data: investorData, error: invError } = await supabase
            .from('investor_profiles')
            .select(`
              id,
              accredited_status,
              location,
              preferred_property_types,
              preferred_locations,
              risk_tolerance,
              investment_goals,
              created_at
            `)
            .gte('created_at', syndData.subscribed_at)
            .order('created_at', { ascending: false });

          if (invError) {
            console.error('Error fetching investors:', invError);
            setError('Failed to load investor data');
          } else if (investorData) {
            // Fetch profiles for names
            const profileIds = investorData.map(ip => ip.id);
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, full_name, email, avatar_url')
              .in('id', profileIds);

            const profileMap = new Map(
              (profilesData || []).map(p => [p.id, p])
            );

            const merged: InvestorCard[] = investorData.map(ip => {
              const prof = profileMap.get(ip.id);
              return {
                id: ip.id,
                full_name: prof?.full_name || 'Anonymous Investor',
                email: prof?.email || '',
                avatar_url: prof?.avatar_url || null,
                location: ip.location,
                accredited_status: ip.accredited_status,
                preferred_property_types: ip.preferred_property_types || [],
                preferred_locations: ip.preferred_locations || [],
                risk_tolerance: ip.risk_tolerance,
                investment_goals: ip.investment_goals,
                created_at: ip.created_at,
              };
            });

            setInvestors(merged);
          }
        }
      } catch (err) {
        console.error('Error loading investor feed:', err);
        setError('Something went wrong loading the feed');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading investor feed...</p>
        </div>
      </div>
    );
  }

  // Non-syndicator view
  if (!isSyndicator) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12">
            <AlertCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-3">Syndicators Only</h1>
            <p className="text-gray-400 mb-6">
              The Investor Feed is exclusively available to syndicators on EquityMD.
              If you're a syndicator, claim your profile or list a deal to get started.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isSubscribed = syndicator?.subscription_status === 'active';

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-white">Investor Feed</h1>
          </div>
          {isSubscribed ? (
            <div className="flex items-center gap-4 text-gray-400">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-400 font-medium">{investors.length} investor{investors.length !== 1 ? 's' : ''} in your feed</span>
              </span>
              {syndicator?.subscribed_at && (
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-500" />
                  Member since {new Date(syndicator.subscribed_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
          ) : (
            <p className="text-gray-400">Access accredited investors looking for syndication opportunities</p>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {isSubscribed ? (
          /* Subscribed — show real investor cards */
          investors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investors.map((investor) => (
                <InvestorCardComponent key={investor.id} investor={investor} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Users className="h-16 w-16 text-gray-700 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No new investors yet</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                New investors who join after your subscription date will appear here.
                Check back soon — new investors join EquityMD every week.
              </p>
            </div>
          )
        ) : (
          /* Non-subscribed — blurred cards + CTA */
          <div className="relative">
            {/* Blurred cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PLACEHOLDER_INVESTORS.map((investor) => (
                <InvestorCardComponent key={investor.id} investor={investor} blurred />
              ))}
            </div>

            {/* CTA Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="bg-gray-900/95 border border-gray-700 rounded-2xl p-10 max-w-lg text-center shadow-2xl backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-6">
                  <Lock className="h-8 w-8 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Join the Investor Program
                </h2>
                <p className="text-3xl font-bold text-blue-400 mb-6">$1,000/mo</p>

                <ul className="text-left space-y-3 mb-8">
                  {[
                    'Get access to accredited investors actively looking for deals',
                    'New investors added weekly as EquityMD grows',
                    'Founding members see the full investor pool',
                    'Direct contact with qualified investors',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <ChevronRight className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <a
                  href="mailto:justin@brandastic.com?subject=EquityMD%20Investor%20Program"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors w-full justify-center"
                >
                  <Mail className="h-5 w-5" />
                  Contact Us
                </a>
                <p className="text-gray-500 text-sm mt-3">
                  Questions? Email justin@brandastic.com
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
