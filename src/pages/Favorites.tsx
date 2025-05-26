import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Heart, Filter, Search, SortDesc } from 'lucide-react';
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
         ?.filter(fav => fav.deals) // Filter out any null deals
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

  // Only allow investors to view favorites
  if (profile?.user_type !== 'investor') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <SEO 
        title="My Favorites - EquityMD"
        description="View and manage your favorite real estate investment opportunities."
      />
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-red-500 fill-current" />
                <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
              </div>
              <p className="text-gray-600">
                Keep track of the deals you're most interested in
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Loading your favorite deals..." />
              </div>
            ) : favoriteDeals.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No favorites yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start exploring deals and click the heart icon to save your favorites
                </p>
                <Link
                  to="/browse"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Deals
                </Link>
              </div>
            ) : (
              <>
                {/* Filters and Search */}
                <div className="mb-6 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search favorites..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Property Type Filter */}
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={propertyTypeFilter}
                        onChange={(e) => setPropertyTypeFilter(e.target.value)}
                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="all">All Property Types</option>
                        {propertyTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <SortDesc className="w-5 h-5 text-gray-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'recent' | 'title' | 'investment')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="recent">Recently Favorited</option>
                      <option value="title">Deal Name</option>
                      <option value="investment">Min. Investment</option>
                    </select>
                  </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-gray-600">
                    {sortedDeals.length} favorite{sortedDeals.length !== 1 ? 's' : ''}
                    {searchTerm && ` matching "${searchTerm}"`}
                  </p>
                </div>

                                 {/* Deal Grid */}
                 {sortedDeals.length === 0 ? (
                   <div className="text-center py-8">
                     <p className="text-gray-600">No favorites match your current filters.</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {sortedDeals.map((deal) => (
                       <DealCard 
                         key={deal.id}
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
                     ))}
                   </div>
                 )}
              </>
            )}
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
} 