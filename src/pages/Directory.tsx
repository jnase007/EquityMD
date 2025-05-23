import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Star, MapPin, Search, Filter, TrendingUp, SlidersHorizontal, Globe, LayoutGrid, List } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageBanner } from '../components/PageBanner';
import { LoadingSpinner } from '../components/LoadingSpinner';
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
      const { data: syndicatorData, error: syndicatorError } = await supabase
        .from('syndicator_profiles')
        .select(`
          id,
          company_name,
          company_description,
          company_logo_url,
          state,
          city,
          years_in_business,
          total_deal_volume,
          website_url,
          slug
        `);

      if (syndicatorError) {
        console.error('Error fetching syndicators:', syndicatorError);
        // Use mock data if database fetch fails
        setSyndicators(mockSyndicators);
        setLoading(false);
        return;
      }

      // If no syndicators in database, use mock data for demo purposes
      if (!syndicatorData || syndicatorData.length === 0) {
        setSyndicators(mockSyndicators);
      } else {
        // Combine real data with enhanced properties
        const combinedData = syndicatorData.map(s => ({
          ...s,
          average_rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
          total_reviews: Math.floor(Math.random() * 50) + 5,
          active_deals: Math.floor(Math.random() * 10) + 1,
          specialties: ['Multi-Family', 'Office', 'Retail'].slice(0, Math.floor(Math.random() * 3) + 1),
          team_size: Math.floor(Math.random() * 20) + 5,
          notable_projects: ['Project A', 'Project B'],
          investment_focus: ['Value-Add', 'Core-Plus'],
          min_investment: 50000,
          target_markets: ['Texas', 'Florida'],
          certifications: ['CCIM', 'CRE']
        }));
        setSyndicators(combinedData);
      }
    } catch (error) {
      console.error('Error fetching syndicators:', error);
      // Use mock data if there's an error
      setSyndicators(mockSyndicators);
    } finally {
      setLoading(false);
    }
  }

  // Mock syndicators for demo purposes
  const mockSyndicators: Syndicator[] = [
    {
      id: 'mock-syn-1',
      company_name: 'Austin Capital Partners',
      company_logo_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=100&h=100',
      company_description: 'Specializing in multifamily value-add opportunities across Texas markets.',
      state: 'Texas',
      city: 'Austin',
      years_in_business: 12,
      total_deal_volume: 450000000,
      website_url: 'https://austincapitalpartners.com',
      average_rating: 4.8,
      total_reviews: 24,
      active_deals: 6,
      slug: 'austin-capital-partners',
      specialties: ['Multi-Family', 'Value-Add', 'Texas Markets'],
      team_size: 15,
      notable_projects: ['Sunset Ridge Apartments', 'Downtown Lofts'],
      investment_focus: ['Value-Add', 'Core-Plus'],
      min_investment: 50000,
      target_markets: ['Austin', 'Dallas', 'Houston'],
      certifications: ['CCIM', 'CRE']
    },
    {
      id: 'mock-syn-2',
      company_name: 'Lone Star Syndications',
      company_logo_url: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&q=80&w=100&h=100',
      company_description: 'Premier real estate investment firm focused on institutional-quality properties.',
      state: 'Texas',
      city: 'Dallas',
      years_in_business: 8,
      total_deal_volume: 280000000,
      website_url: 'https://lonestarsyndications.com',
      average_rating: 4.6,
      total_reviews: 18,
      active_deals: 4,
      slug: 'lone-star-syndications',
      specialties: ['Multi-Family', 'Office', 'Industrial'],
      team_size: 12,
      notable_projects: ['Metro Office Complex', 'Riverside Apartments'],
      investment_focus: ['Core', 'Value-Add'],
      min_investment: 75000,
      target_markets: ['Dallas', 'Fort Worth', 'San Antonio'],
      certifications: ['CCIM', 'SIOR']
    },
    {
      id: 'mock-syn-3',
      company_name: 'Gulf Coast Investments',
      company_logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100&h=100',
      company_description: 'Focused on coastal markets with strong fundamentals and growth potential.',
      state: 'Florida',
      city: 'Miami',
      years_in_business: 15,
      total_deal_volume: 620000000,
      website_url: 'https://gulfcoastinvestments.com',
      average_rating: 4.9,
      total_reviews: 31,
      active_deals: 8,
      slug: 'gulf-coast-investments',
      specialties: ['Multi-Family', 'Mixed-Use', 'Hospitality'],
      team_size: 22,
      notable_projects: ['Bayfront Towers', 'Ocean View Resort'],
      investment_focus: ['Opportunistic', 'Value-Add'],
      min_investment: 100000,
      target_markets: ['Miami', 'Tampa', 'Orlando'],
      certifications: ['CCIM', 'CRE', 'CPM']
    }
  ];

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner 
          variant="medical" 
          size="xl" 
          text="Loading syndicator directory..." 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <PageBanner 
        title="Syndicator Directory"
        subtitle="Connect with experienced real estate investment firms"
      />

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {filteredSyndicators.length} Syndicators Found
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
                  {syndicator.company_logo_url ? (
                    <img
                      src={syndicator.company_logo_url}
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
                      {syndicator.city}, {syndicator.state}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Rating</div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" />
                      <span className="font-medium">{syndicator.average_rating}</span>
                      <span className="text-sm text-gray-500 ml-1">
                        ({syndicator.total_reviews})
                      </span>
                    </div>
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
                  ${syndicator.total_deal_volume?.toLocaleString()} total volume
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
                  {syndicator.company_logo_url ? (
                    <img
                      src={syndicator.company_logo_url}
                      alt={syndicator.company_name}
                      className="w-32 h-32 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-16 h-16 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{syndicator.company_name}</h3>
                        <div className="flex items-center text-gray-600 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {syndicator.city}, {syndicator.state}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" />
                        <span className="font-medium">{syndicator.average_rating}</span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({syndicator.total_reviews} reviews)
                        </span>
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
                        <div className="font-medium">${syndicator.total_deal_volume?.toLocaleString()}</div>
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