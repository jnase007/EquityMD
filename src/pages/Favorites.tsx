import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Heart, Filter, Search, SortDesc, Sparkles, ArrowRight, Star, TrendingUp, MapPin } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { DealCard } from '../components/Cards';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SEO } from '../components/SEO';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import type { Deal, Favorite } from '../types/database';

interface FavoriteDeal extends Deal {
  favorited_at: string;
}

export function Favorites() {
  const { user, profile } = useAuthStore();
  const [favoriteDeals, setFavoriteDeals] = useState<FavoriteDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'investment'>('recent');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchFavoriteDeals();
    }
  }, [user]);

  async function fetchFavoriteDeals() {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          created_at,
          deals:deal_id (
            id,
            title,
            description,
            property_type,
            location,
            minimum_investment,
            target_irr,
            investment_term,
            total_equity,
            status,
            featured,
            cover_image_url,
            slug,
            created_at,
            updated_at,
            syndicator_id
          )
        `)
        .eq('investor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include favorited_at timestamp
      const transformedDeals: FavoriteDeal[] = data
        ?.filter(fav => fav.deals)
        ?.map(fav => ({
          ...(fav.deals as any as Deal),
          favorited_at: fav.created_at
        })) || [];

      setFavoriteDeals(transformedDeals);
    } catch (error) {
      console.error('Error fetching favorite deals:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter and sort deals
  const filteredDeals = favoriteDeals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = propertyTypeFilter === 'all' || deal.property_type === propertyTypeFilter;
    return matchesSearch && matchesType;
  });

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.favorited_at).getTime() - new Date(a.favorited_at).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'investment':
        return a.minimum_investment - b.minimum_investment;
      default:
        return 0;
    }
  });

  // Get unique property types for filter
  const propertyTypes = Array.from(new Set(favoriteDeals.map(deal => deal.property_type)));

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <SEO 
        title="My Favorites - EquityMD"
        description="View and manage your favorite real estate investment opportunities."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
        <Navbar />
        
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
          
          {/* Floating hearts decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <Heart 
                key={i}
                className="absolute text-white/10"
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  width: `${30 + i * 8}px`,
                  height: `${30 + i * 8}px`,
                  transform: `rotate(${-15 + i * 10}deg)`,
                }}
                fill="currentColor"
              />
            ))}
          </div>
          
          <div className="max-w-7xl mx-auto px-4 py-12 relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
                <Heart className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white">My Favorites</h1>
                <p className="text-white/80 mt-1">Your curated collection of investment opportunities</p>
              </div>
            </div>
            
            {!loading && favoriteDeals.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
                  <span className="text-white/70 text-sm">Total Saved</span>
                  <p className="text-white font-bold text-xl">{favoriteDeals.length} deals</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
                  <span className="text-white/70 text-sm">Avg. Target IRR</span>
                  <p className="text-white font-bold text-xl">
                    {(favoriteDeals.reduce((sum, d) => sum + (d.target_irr || 0), 0) / favoriteDeals.length).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
                  <span className="text-white/70 text-sm">Min. Investment</span>
                  <p className="text-white font-bold text-xl">
                    ${Math.min(...favoriteDeals.map(d => d.minimum_investment)).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your favorites...</p>
              </div>
            </div>
          ) : favoriteDeals.length === 0 ? (
            /* Empty State - Beautiful & Engaging */
            <div className="text-center py-16">
              <div className="relative inline-block mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-16 h-16 text-rose-300" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Start Building Your Watchlist
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Discover amazing investment opportunities and save your favorites to track them easily.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/find"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-2xl hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Search className="w-5 h-5" />
                  Explore Deals
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/directory"
                  className="inline-flex items-center gap-2 px-6 py-4 bg-white text-gray-700 font-medium rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
                >
                  Browse Syndicators
                </Link>
              </div>
              
              {/* Tips */}
              <div className="mt-12 grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Heart className="w-5 h-5 text-rose-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Save Deals</h4>
                  <p className="text-sm text-gray-500">Click the heart icon on any deal to add it here</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Compare Returns</h4>
                  <p className="text-sm text-gray-500">Easily compare IRR and investment terms</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Star className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Track Progress</h4>
                  <p className="text-sm text-gray-500">Stay updated on your favorite opportunities</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Filters and Search */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search your favorites..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-4 py-3 w-full sm:w-64 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Property Type Filter */}
                    <div className="relative">
                      <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={propertyTypeFilter}
                        onChange={(e) => setPropertyTypeFilter(e.target.value)}
                        className="pl-12 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                      >
                        <option value="all">All Types</option>
                        {propertyTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sort & Count */}
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 text-sm">
                      {sortedDeals.length} deal{sortedDeals.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                      <SortDesc className="w-4 h-4 text-gray-400" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'recent' | 'title' | 'investment')}
                        className="bg-transparent border-none focus:ring-0 text-sm cursor-pointer"
                      >
                        <option value="recent">Recently Saved</option>
                        <option value="title">Deal Name</option>
                        <option value="investment">Min. Investment</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deal Grid */}
              {sortedDeals.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No favorites match your filters.</p>
                  <button 
                    onClick={() => { setSearchTerm(''); setPropertyTypeFilter('all'); }}
                    className="mt-4 text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedDeals.map((deal) => (
                    <div key={deal.id} className="group relative">
                      <DealCard 
                        id={deal.id}
                        slug={deal.slug}
                        image={deal.cover_image_url || '/placeholder-property.jpg'}
                        title={deal.title}
                        location={deal.location}
                        metrics={{
                          target: `${deal.target_irr}% IRR`,
                          minimum: `$${deal.minimum_investment.toLocaleString()}`,
                          term: `${deal.investment_term} years`
                        }}
                        detailed={true}
                        isAuthenticated={true}
                      />
                      {/* Favorite badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <div className="p-2 bg-rose-500 rounded-full shadow-lg">
                          <Heart className="w-4 h-4 text-white" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </>
  );
}
