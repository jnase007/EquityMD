import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, Star, TrendingUp, Users, Building2, Award, 
  Crown, Flame, ArrowUp, ChevronRight, Sparkles,
  Medal, Target, Zap
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { supabase } from '../lib/supabase';

interface SyndicatorRanking {
  id: string;
  slug: string;
  company_name: string;
  company_logo_url: string;
  deal_count: number;
  total_interest: number;
  avg_rating: number;
  verification_status: string;
  years_in_business: number;
}

export function Leaderboard() {
  const [rankings, setRankings] = useState<SyndicatorRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'deals' | 'interest' | 'rating'>('deals');

  useEffect(() => {
    fetchRankings();
  }, [timeFilter, categoryFilter]);

  async function fetchRankings() {
    try {
      // Fetch syndicators with their deal counts
      const { data: syndicators } = await supabase
        .from('syndicators')
        .select(`
          id,
          slug,
          company_name,
          company_logo_url,
          verification_status,
          years_in_business,
          deals (id)
        `)
        .not('company_name', 'is', null);

      // Fetch deal interests
      const { data: interests } = await supabase
        .from('deal_interests')
        .select('deal_id, deals(syndicator_id)');

      // Fetch reviews
      const { data: reviews } = await supabase
        .from('syndicator_reviews')
        .select('syndicator_id, rating');

      // Calculate rankings
      const rankingsData: SyndicatorRanking[] = (syndicators || []).map((s: any) => {
        const dealCount = s.deals?.length || 0;
        const syndicatorInterests = interests?.filter((i: any) => 
          i.deals?.syndicator_id === s.id
        ) || [];
        const syndicatorReviews = reviews?.filter((r: any) => r.syndicator_id === s.id) || [];
        const avgRating = syndicatorReviews.length > 0 
          ? syndicatorReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / syndicatorReviews.length 
          : 0;

        return {
          id: s.id,
          slug: s.slug || s.company_name.toLowerCase().replace(/\s+/g, '-'),
          company_name: s.company_name,
          company_logo_url: s.company_logo_url,
          deal_count: dealCount,
          total_interest: syndicatorInterests.length,
          avg_rating: avgRating,
          verification_status: s.verification_status,
          years_in_business: s.years_in_business || 0,
        };
      });

      // Sort by selected category
      rankingsData.sort((a, b) => {
        if (categoryFilter === 'deals') return b.deal_count - a.deal_count;
        if (categoryFilter === 'interest') return b.total_interest - a.total_interest;
        return b.avg_rating - a.avg_rating;
      });

      setRankings(rankingsData.slice(0, 20));
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</span>;
  };

  const getVerificationBadge = (status: string) => {
    if (status === 'premier') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
          <Sparkles className="h-3 w-3" />
          Premier
        </span>
      );
    }
    if (status === 'verified') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          <Star className="h-3 w-3" />
          Verified
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 py-16 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full text-white mb-6">
              <Trophy className="h-5 w-5" />
              <span className="font-medium">Top Syndicators</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Leaderboard
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Discover the most active and highest-rated syndicators on EquityMD
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-10">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{rankings.length}+</div>
                <div className="text-white/70">Active Syndicators</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {rankings.reduce((acc, r) => acc + r.deal_count, 0)}+
                </div>
                <div className="text-white/70">Total Deals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {rankings.filter(r => r.verification_status === 'verified' || r.verification_status === 'premier').length}
                </div>
                <div className="text-white/70">Verified Partners</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm">
            {(['deals', 'interest', 'rating'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  categoryFilter === cat 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat === 'deals' && 'Most Deals'}
                {cat === 'interest' && 'Most Interest'}
                {cat === 'rating' && 'Top Rated'}
              </button>
            ))}
          </div>
        </div>

        {/* Rankings Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : rankings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No syndicators found
            </div>
          ) : (
            <div className="divide-y">
              {rankings.map((syndicator, index) => (
                <Link
                  key={syndicator.id}
                  to={`/syndicator/${syndicator.slug}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition group"
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-10">
                    {getRankBadge(index + 1)}
                  </div>

                  {/* Logo */}
                  <div className="flex-shrink-0">
                    {syndicator.company_logo_url ? (
                      <img
                        src={syndicator.company_logo_url}
                        alt={syndicator.company_name}
                        className="w-12 h-12 rounded-lg object-contain bg-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{syndicator.company_name}</h3>
                      {getVerificationBadge(syndicator.verification_status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {syndicator.deal_count} deals
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {syndicator.total_interest} interests
                      </span>
                      {syndicator.avg_rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {syndicator.avg_rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score/Badge */}
                  <div className="flex-shrink-0 text-right">
                    {index < 3 && (
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        #{index + 1}
                      </div>
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 mt-2" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Rising Stars Section */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Rising Stars</h2>
          </div>
          <p className="text-gray-600 mb-6">New syndicators making waves on the platform</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rankings.slice(-3).reverse().map((syndicator) => (
              <Link
                key={syndicator.id}
                to={`/syndicator/${syndicator.slug}`}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition border border-orange-100"
              >
                <div className="flex items-center gap-3 mb-3">
                  {syndicator.company_logo_url ? (
                    <img
                      src={syndicator.company_logo_url}
                      alt={syndicator.company_name}
                      className="w-10 h-10 rounded-lg object-contain bg-gray-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-orange-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">{syndicator.company_name}</h3>
                    <div className="flex items-center gap-1 text-orange-600 text-sm">
                      <ArrowUp className="h-3 w-3" />
                      New
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {syndicator.deal_count} {syndicator.deal_count === 1 ? 'deal' : 'deals'} listed
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

