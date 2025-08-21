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

      // Always include Starboard Realty and Clarion Partners from mock data
      const starboardRealty = mockSyndicators.find(s => s.company_name === 'Starboard Realty');
      const clarionPartners = mockSyndicators.find(s => s.company_name === 'Clarion Partners');

      // If no syndicators in database, use mock data for demo purposes
      if (!syndicatorData || syndicatorData.length === 0) {
        setSyndicators(mockSyndicators);
      } else {
        console.log('syndicatorData', syndicatorData);

        // Combine real data with enhanced properties
        const combinedData = syndicatorData
          .filter(s => s.company_name !== 'Starboard Realty') // Remove any existing Starboard from DB
          .filter(s => !s.company_name.toLowerCase().includes('equitymd admin')) // Remove admin accounts
          .filter(s => !s.company_name.toLowerCase().includes('admin')) // Remove any admin accounts
          .filter(s => !s.company_name.toLowerCase().includes('test')) // Remove test accounts
          .filter(s => s.company_name !== 'Metropolitan Real Estate') // Remove Metropolitan Real Estate
          .filter(s => s.company_name !== 'Evergreen Residential') // Remove Evergreen Residential
          .filter(s => {
            // Only show syndicators with complete profiles (80%+ completion)
            const hasRequiredFields = s.company_name && 
              s.company_name.length >= 3 &&
              s.state && 
              s.city &&
              s.company_description && 
              s.company_description.length >= 50;
            
            return hasRequiredFields || 
              // Always include verified premier syndicators
              s.company_name === 'Back Bay Capital' || 
              s.company_name === 'Sutera Properties' || 
              s.company_name === 'Starboard Realty' ||
              s.company_name === 'Clarion Partners';
          })
          .map(s => {
            // Only show real data for verified syndicators
            const isVerified = s.company_name === 'Back Bay Capital' || 
                              s.company_name === 'Sutera Properties' || 
                              s.company_name === 'Starboard Realty' ||
                              s.company_name === 'Clarion Partners';
            
            return {
              ...s,
              average_rating: isVerified ? (s.company_name === 'Back Bay Capital' ? 4.9 : 
                                          s.company_name === 'Sutera Properties' ? 4.8 : 
                                          s.company_name === 'Clarion Partners' ? 4.9 : 5.0) : 0,
              total_reviews: isVerified ? (s.company_name === 'Back Bay Capital' ? 25 : 
                                         s.company_name === 'Sutera Properties' ? 18 : 
                                         s.company_name === 'Clarion Partners' ? 42 : 15) : 0,
              active_deals: isVerified ? (s.company_name === 'Back Bay Capital' ? 3 : 
                                        s.company_name === 'Sutera Properties' ? 1 :
                                        s.company_name === 'Clarion Partners' ? 3 : 1) : 0,
              total_deal_volume: isVerified ? (s.company_name === 'Back Bay Capital' ? 30000000 : 
                                              s.company_name === 'Sutera Properties' ? 38000000 :
                                              s.company_name === 'Starboard Realty' ? 608000000 :
                                              s.company_name === 'Clarion Partners' ? 73100000000 : 0) : 0,
              specialties: isVerified ? (s.company_name === 'Back Bay Capital' ? ['Multi-Family', 'Preferred Equity', 'Value-Add'] :
                                       s.company_name === 'Sutera Properties' ? ['Multi-Family', 'Ground-Up Development'] :
                                       s.company_name === 'Clarion Partners' ? ['Industrial', 'Multifamily', 'Office', 'Retail'] :
                                       ['Multi-Family', 'Retail', 'NNN Lease']) : [],
              team_size: isVerified ? (s.company_name === 'Back Bay Capital' ? 15 : 
                                     s.company_name === 'Sutera Properties' ? 12 : 
                                     s.company_name === 'Clarion Partners' ? 150 : 25) : 0,
              notable_projects: isVerified ? ['Verified Projects'] : [],
              investment_focus: isVerified ? ['Value-Add', 'Core-Plus'] : [],
              min_investment: isVerified ? 50000 : 0,
              target_markets: isVerified ? ['California', 'Texas'] : [],
              certifications: isVerified ? ['CCIM', 'CRE'] : []
            };
          });
        
        // Always add Starboard Realty and Clarion Partners with the correct type structure
        if (starboardRealty) {
          combinedData.push({
            ...starboardRealty,
            total_deal_volume: starboardRealty.total_deal_volume || 0
          });
        }
        if (clarionPartners) {
          combinedData.push({
            ...clarionPartners,
            total_deal_volume: clarionPartners.total_deal_volume || 0
          });
        }

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

  // Mock syndicators for demo purposes - only verified real syndicators
  const mockSyndicators: Syndicator[] = [
    {
      id: 'starboard-realty',
      company_name: 'Starboard Realty',
      company_logo_url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/Starboard_reality.jpg`,
      company_description: 'Headquartered in Irvine, California, Starboard Realty Advisors, LLC, is a privately held, fully-integrated real estate firm, whose principals have more than 30 years of hands-on, cycle-tested experience in acquiring, developing, leasing, repositioning, managing, financing and disposing of retail, multifamily, office and industrial real estate. Starboard acquires multifamily, multi-tenant retail shopping centers, and NNN lease properties. Starboard\'s mission is to acquire well-located properties across the U.S., in which current rents have growth potential and which can be acquired at below replacement cost. Starboard acquires primarily stabilized properties with a 7- to 10-year hold period for its 1031 exchange clients and value added properties with a 1- to 5-year hold.',
      state: 'California',
      city: 'Newport Beach',
      years_in_business: 10,
      total_deal_volume: 608000000,
      website_url: 'https://starboard-realty.com/',
      average_rating: 5.0,
      total_reviews: 15,
      active_deals: 1,
      slug: 'starboard-realty',
      specialties: ['Multi-Family', 'Retail', 'NNN Lease'],
      team_size: 25,
      notable_projects: ['Orange County Portfolio', 'Multi-Tenant Retail Centers'],
      investment_focus: ['Value-Add', 'Stabilized Properties'],
      min_investment: 100000,
      target_markets: ['California', 'Arizona', 'Texas'],
      certifications: ['CCIM', 'CRE']
    },
    {
      id: 'sutera-properties',
      company_name: 'Sutera Properties',
      company_logo_url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/Sutera_Properties.jpg`,
      company_description: 'Sutera Properties is a real estate investment and development company focused on creating value through strategic acquisitions and developments in high-growth markets.',
      state: 'Florida',
      city: 'Miami',
      years_in_business: 15,
      total_deal_volume: 38000000,
      website_url: 'https://suteraproperties.com/',
      average_rating: 4.8,
      total_reviews: 18,
      active_deals: 1,
      slug: 'sutera-properties',
      specialties: ['Multi-Family', 'Mixed-Use', 'Development'],
      team_size: 20,
      notable_projects: ['Bayfront Towers', 'Ocean View Resort'],
      investment_focus: ['Opportunistic', 'Value-Add'],
      min_investment: 100000,
      target_markets: ['Miami', 'Tampa', 'Orlando'],
      certifications: ['CCIM', 'CRE', 'CPM']
    },
    {
      id: 'clarion-partners',
      company_name: 'Clarion Partners',
      company_logo_url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/clarionpartners.png`,
      company_description: 'Clarion Partners is a leading global real estate investment company with over 40 years of experience, managing $73.1 billion in assets under management. We combine our broad scale and execution capabilities with our deep market and property expertise to identify and leverage the true drivers of long-term value in real estate.',
      state: 'New York',
      city: 'New York',
      years_in_business: 40,
      total_deal_volume: 73100000000,
      website_url: 'https://www.clarionpartners.com/',
      average_rating: 4.9,
      total_reviews: 42,
      active_deals: 3,
      slug: 'clarion-partners',
      specialties: ['Industrial', 'Multifamily', 'Office', 'Retail', 'Life Science'],
      team_size: 150,
      notable_projects: ['Industrial Portfolio Nationwide', 'Multifamily Communities', 'Life Science Facilities'],
      investment_focus: ['Core', 'Core-Plus', 'Value-Add', 'Opportunistic'],
      min_investment: 1000000,
      target_markets: ['Nationwide', 'Global'],
      certifications: ['CRE', 'CCIM', 'CAIA', 'CFA']
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
              .filter(s => s.company_name === 'Sutera Properties' || s.company_name === 'Back Bay Capital' || s.company_name === 'Starboard Realty')
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
                        <span className="font-medium text-sm">5.0</span>
                        <span className="text-sm text-gray-500 ml-1">(Premium Partner)</span>
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
                        'Premier Partner'
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