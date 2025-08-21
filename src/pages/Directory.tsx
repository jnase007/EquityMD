import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Star, MapPin, Search, Filter, TrendingUp, SlidersHorizontal, Globe, LayoutGrid, List, ChevronRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { getSyndicatorLogo, getSyndicatorLocation } from '../lib/syndicator-logos';
import { PageBanner } from '../components/PageBanner';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { isProfileCompleteForDirectory } from '../lib/syndicator-completion';
import { supabase } from '../lib/supabase';

interface Syndicator {
  id: string;
  company_name: string;
  company_logo_url: string | null;
  company_description: string | null;
  state: string;
  city: string;
  years_in_business: number | null;
  total_deal_volume: number | null;
  website_url: string | null;
  average_rating: number;
  total_reviews: number;
  active_deals: number;
  slug: string;
  specialties: string[];
  team_size: number;
  notable_projects: string[];
  investment_focus: string[];
  min_investment: number;
  target_markets: string[];
  certifications: string[];
}

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
  'Wisconsin', 'Wyoming'
];

const yearsInBusinessRanges = [
  { label: 'All', value: '0' },
  { label: '0-5 years', value: '5' },
  { label: '5-10 years', value: '10' },
  { label: '10-20 years', value: '20' },
  { label: '20+ years', value: '21' }
];

const dealVolumeRanges = [
  { label: 'All', value: '0' },
  { label: 'Under $100M', value: '100000000' },
  { label: '$100M - $500M', value: '500000000' },
  { label: '$500M - $1B', value: '1000000000' },
  { label: 'Over $1B', value: '1000000001' }
];

export function Directory() {
  const [syndicators, setSyndicators] = useState<Syndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState('0');
  const [dealVolume, setDealVolume] = useState('0');
  const [sortBy, setSortBy] = useState<'rating' | 'deals' | 'volume'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSyndicators();
  }, []);

  async function fetchSyndicators() {
    try {
      console.log('🔍 Fetching syndicators from database...');
      const { data: syndicatorData, error: syndicatorError } = await supabase
        .from('syndicator_profiles')
        .select()
        .in('verification_status', ['verified', 'premier']);

      if (syndicatorError) {
        console.error('❌ Error fetching syndicators:', syndicatorError);
        setSyndicators([]);
        setLoading(false);
        return;
      }

      console.log('📊 Raw syndicator data from database:', syndicatorData);
      console.log('📊 Number of syndicators found:', syndicatorData?.length || 0);

      if (!syndicatorData) {
        console.log('⚠️ No syndicator data returned from database');
        setSyndicators([]);
        setLoading(false);
        return;
      }

      const filteredData = syndicatorData
        .filter(s => s.company_name && s.company_name.length >= 3)
        .filter(s => !s.company_name.toLowerCase().includes('admin'))
        .filter(s => !s.company_name.toLowerCase().includes('test'))
        // .filter(s => s.company_name !== 'Metropolitan Real Estate')
        // .filter(s => s.company_name !== 'Evergreen Residential')
        .map(s => ({
          ...s,
          average_rating: s.average_rating || 0,
          total_reviews: s.total_reviews || 0,
          active_deals: s.active_deals || 0,
          total_deal_volume: s.total_deal_volume || 0,
          specialties: s.specialties || [],
          team_size: s.team_size || 0,
          notable_projects: s.notable_projects || [],
          investment_focus: s.investment_focus || [],
          min_investment: s.min_investment || 0,
          target_markets: s.target_markets || [],
          certifications: s.certifications || []
        }));

      console.log('✅ Final filtered data:', filteredData);
      console.log('✅ Final count:', filteredData.length);
      console.log('✅ Company names:', filteredData.map(s => s.company_name));

      setSyndicators(filteredData);
    } catch (error) {
      console.error('❌ Error fetching syndicators:', error);
      setSyndicators([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredSyndicators = syndicators
    .filter(syndicator => {
      const searchFields = [
        syndicator.company_name,
        syndicator.company_description,
        syndicator.city,
        syndicator.state,
        ...(syndicator.specialties || []),
        ...(syndicator.target_markets || [])
      ].map(field => field?.toLowerCase() || '');

      const matchesSearch = searchTerm === '' || searchFields.some(field => field.includes(searchTerm.toLowerCase()));
      const matchesState = !selectedState || syndicator.state === selectedState;
      const matchesYears = yearsInBusiness === '0' || 
        (yearsInBusiness === '21' ? (syndicator.years_in_business || 0) >= 20 :
        (syndicator.years_in_business || 0) <= parseInt(yearsInBusiness));
      const matchesDealVolume = dealVolume === '0' || 
        (dealVolume === '1000000001' ? (syndicator.total_deal_volume || 0) >= 1000000000 :
        (syndicator.total_deal_volume || 0) <= parseInt(dealVolume));
      
      return matchesSearch && matchesState && matchesYears && matchesDealVolume;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'deals':
          return (b.active_deals || 0) - (a.active_deals || 0);
        case 'volume':
          return (b.total_deal_volume || 0) - (a.total_deal_volume || 0);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEO 
          title="Top CRE Syndicator Directory | Deals on Equitymd.com"
          description="Discover premier CRE syndicators with multifamily, industrial deals. List yours to reach 10K elite investors on Equitymd.com. Browse free—join today!"
          keywords="CRE syndicator directory, real estate syndicators, multifamily syndicators, industrial real estate, commercial real estate directory"
          canonical="https://equitymd.com/directory"
        />
        <Navbar />

        <PageBanner 
          title="Syndicator Directory"
          subtitle="Connect with experienced real estate investment firms"
        />

        <div className="max-w-[1200px] mx-auto px-4 py-16">
          {/* Featured Syndicators Skeleton */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
            <LoadingSkeleton type="syndicator" count={3} />
          </div>

          {/* All Syndicators Header Skeleton */}
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="flex items-center space-x-4">
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index}>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Skeleton */}
          <LoadingSkeleton type="syndicator" count={6} />
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <SEO 
        title="Top CRE Syndicator Directory | Deals on Equitymd.com"
        description="Discover premier CRE syndicators with multifamily, industrial deals. List yours to reach 10K elite investors on Equitymd.com. Browse free—join today!"
        keywords="CRE syndicator directory, real estate syndicators, multifamily syndicators, industrial real estate, commercial real estate directory"
        canonical="https://equitymd.com/directory"
      />
      <Navbar />

      <PageBanner 
        title="Syndicator Directory"
        subtitle="Connect with experienced real estate investment firms"
      />

      <div className="max-w-[1200px] mx-auto px-4 py-16">
        {/* Featured Syndicators Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-6 w-6 text-yellow-400" fill="currentColor" />
            <h2 className="text-2xl font-bold text-gray-900">Featured Syndicators</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {syndicators
              .filter(s => s.average_rating >= 4.5 && s.total_reviews >= 10)
              .slice(0, 3)
              .map((syndicator) => (
                <Link
                  key={syndicator.id}
                  to={`/syndicators/${syndicator.slug || syndicator.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-md hover:shadow-lg transition p-6 border-2 border-blue-200 relative overflow-hidden"
                >
                  {/* Featured Badge */}
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star className="h-3 w-3" fill="currentColor" />
                    FEATURED
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    {getSyndicatorLogo(syndicator.company_name, syndicator.company_logo_url) ? (
                      <img
                        src={getSyndicatorLogo(syndicator.company_name, syndicator.company_logo_url)!}
                        alt={syndicator.company_name}
                        className="w-20 h-20 object-contain rounded-lg border bg-white p-2"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-blue-600" />
                      </div>
                    )}
                                         <div>
                       <h3 className="font-bold text-gray-900 text-lg">{syndicator.company_name}</h3>
                       <div className="flex items-center text-gray-600 text-sm">
                         <MapPin className="w-4 h-4 mr-1" />
                         {getSyndicatorLocation(syndicator.company_name, syndicator.city, syndicator.state).city}, {getSyndicatorLocation(syndicator.company_name, syndicator.city, syndicator.state).state}
                       </div>
                      <div className="flex items-center mt-1">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" />
                        <span className="font-medium text-sm">{syndicator.average_rating}</span>
                        <span className="text-sm text-gray-500 ml-1">({syndicator.total_reviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {syndicator.company_description}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {syndicator.specialties?.slice(0, 3).map((specialty, index) => (
                      <span
                        key={`${syndicator.id}-specialty-${index}`}
                        className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-600 text-sm">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {syndicator.total_deal_volume && syndicator.total_deal_volume > 0 ? 
                        `$${syndicator.total_deal_volume.toLocaleString()} volume` : 
                        'Volume not disclosed'
                      }
                    </div>
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      View Profile
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            All Syndicators ({filteredSyndicators.length})
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm"
            >
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium">Filters</span>
            </button>

            <div className="hidden md:flex items-center space-x-2 text-gray-600">
              <Filter className="h-5 w-5" />
              <span>Sort by: </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'deals' | 'volume')}
                className="border-none bg-transparent font-medium focus:ring-0"
              >
                <option value="rating">Rating</option>
                <option value="deals">Active Deals</option>
                <option value="volume">Deal Volume</option>
              </select>
            </div>

            <div className="hidden md:flex items-center space-x-2 border-l pl-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`bg-white rounded-lg shadow-sm p-6 mb-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search syndicators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years in Business
              </label>
              <select
                value={yearsInBusiness}
                onChange={(e) => setYearsInBusiness(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {yearsInBusinessRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deal Volume
              </label>
              <select
                value={dealVolume}
                onChange={(e) => setDealVolume(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {dealVolumeRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSyndicators.map((syndicator) => (
              <Link
                key={syndicator.id}
                to={`/syndicators/${syndicator.slug || syndicator.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                                  {getSyndicatorLogo(syndicator.company_name, syndicator.company_logo_url) ? (
                    <img
                    src={getSyndicatorLogo(syndicator.company_name, syndicator.company_logo_url)!}
                      alt={syndicator.company_name}
                      className="w-16 h-16 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">{syndicator.company_name}</h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {getSyndicatorLocation(syndicator.company_name, syndicator.city, syndicator.state).city}, {getSyndicatorLocation(syndicator.company_name, syndicator.city, syndicator.state).state}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Rating</div>
                    {syndicator.average_rating > 0 ? (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" />
                        <span className="font-medium">{syndicator.average_rating}</span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({syndicator.total_reviews})
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Not verified</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Active Deals</div>
                    <div className="font-medium">{syndicator.active_deals}</div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {syndicator.company_description}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {syndicator.specialties?.slice(0, 3).map((specialty, index) => (
                    <span
                      key={`${syndicator.id}-specialty-${index}`}
                      className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                <div className="flex items-center text-gray-600 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {syndicator.total_deal_volume && syndicator.total_deal_volume > 0 ? 
                    `$${syndicator.total_deal_volume.toLocaleString()} total volume` : 
                    'Volume not disclosed'
                  }
                </div>

                {syndicator.website_url && (
                  <div className="mt-2 flex items-center text-blue-600 text-sm">
                    <Globe className="w-4 h-4 mr-1" />
                    <span className="truncate">{new URL(syndicator.website_url).hostname}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSyndicators.map((syndicator) => (
              <Link
                key={syndicator.id}
                to={`/syndicators/${syndicator.slug || syndicator.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
              >
                <div className="flex gap-6">
                  {getSyndicatorLogo(syndicator.company_name, syndicator.company_logo_url) ? (
                    <img
                      src={getSyndicatorLogo(syndicator.company_name, syndicator.company_logo_url)!}
                      alt={syndicator.company_name}
                      className="w-32 h-32 object-contain rounded-lg"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-32 h-32 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ${getSyndicatorLogo(syndicator.company_name, syndicator.company_logo_url) ? 'hidden' : ''}`}>
                    <Building2 className="w-16 h-16 text-blue-600" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{syndicator.company_name}</h3>
                        <div className="flex items-center text-gray-600 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {getSyndicatorLocation(syndicator.company_name, syndicator.city, syndicator.state).city}, {getSyndicatorLocation(syndicator.company_name, syndicator.city, syndicator.state).state}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {syndicator.average_rating > 0 ? (
                          <>
                            <Star className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" />
                            <span className="font-medium">{syndicator.average_rating}</span>
                            <span className="text-sm text-gray-500 ml-1">
                              ({syndicator.total_reviews} reviews)
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Not verified</span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 mt-3 line-clamp-2">{syndicator.company_description}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {syndicator.specialties?.map((specialty, index) => (
                        <span
                          key={`${syndicator.id}-specialty-${index}`}
                          className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-8 mt-4">
                      <div>
                        <div className="text-sm text-gray-500">Years in Business</div>
                        <div className="font-medium">{syndicator.years_in_business}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Active Deals</div>
                        <div className="font-medium">{syndicator.active_deals}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Total Volume</div>
                        <div className="font-medium">
                          {syndicator.total_deal_volume && syndicator.total_deal_volume > 0 ? 
                            `$${syndicator.total_deal_volume.toLocaleString()}` : 
                            'Not disclosed'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filteredSyndicators.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No syndicators found matching your criteria</div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}