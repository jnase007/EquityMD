import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Star, MapPin, Search, Filter, TrendingUp, Globe, LayoutGrid, List, ChevronRight, Users, Award, Sparkles, ArrowRight, Briefcase } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { FAQSection } from '../components/FAQSection';
import { AuthModal } from '../components/AuthModal';
import { getSyndicatorLogo, getSyndicatorLocation } from '../lib/syndicator-logos';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { isProfileCompleteForDirectory } from '../lib/syndicator-completion';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

// FAQ data for syndicator directory - targeting sponsor-related searches
const syndicatorFaqs = [
  {
    question: "What is a real estate syndicator?",
    answer: "A syndicator (also called sponsor or general partner) is an experienced real estate professional who finds, acquires, and manages investment properties on behalf of passive investors. They handle all operations while investors provide capital and receive returns."
  },
  {
    question: "How do I choose a good syndicator to invest with?",
    answer: "Look for syndicators with a proven track record, transparent communication, relevant experience in the asset class, and aligned interests (they invest their own money). Check their past deal performance, years in business, and total assets under management."
  },
  {
    question: "What fees do syndicators typically charge?",
    answer: "Common fees include acquisition fees (1-3% of purchase price), asset management fees (1-2% annually), and a profit split (typically 20-30% of profits after preferred return). Fee structures vary, so always review the PPM carefully."
  },
  {
    question: "How do syndicators make money?",
    answer: "Syndicators earn through fees (acquisition, asset management, refinancing, disposition) and a share of profits after investors receive their preferred return. This profit split (called 'promote' or 'carried interest') incentivizes syndicators to maximize returns."
  },
  {
    question: "What questions should I ask a syndicator before investing?",
    answer: "Ask about their track record (full-cycle deals), worst-performing deal, how they handle problems, their investment thesis, team experience, communication frequency, and how interests are aligned through co-investment."
  },
  {
    question: "Are syndicators regulated by the SEC?",
    answer: "Yes, most syndications are securities offerings regulated by the SEC under Regulation D (506b or 506c). Syndicators must follow securities laws, though most offerings are exempt from registration. This doesn't mean they're SEC-approved."
  }
];

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
  feat?: boolean;
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
  { label: 'All Experience', value: '0' },
  { label: '0-5 years', value: '5' },
  { label: '5-10 years', value: '10' },
  { label: '10-20 years', value: '20' },
  { label: '20+ years', value: '21' }
];

const dealVolumeRanges = [
  { label: 'All Volumes', value: '0' },
  { label: 'Under $100M', value: '100000000' },
  { label: '$100M - $500M', value: '500000000' },
  { label: '$500M - $1B', value: '1000000000' },
  { label: 'Over $1B', value: '1000000001' }
];

export function Directory() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [syndicators, setSyndicators] = useState<Syndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState('0');
  const [dealVolume, setDealVolume] = useState('0');
  const [sortBy, setSortBy] = useState<'rating' | 'deals' | 'volume'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [totalActiveDeals, setTotalActiveDeals] = useState(0);

  // Handle "Join Directory" / "List Your Deal" button click
  const handleJoinDirectoryClick = () => {
    if (user) {
      // User is logged in, go to syndicator setup
      navigate('/syndicator-setup');
    } else {
      // User is not logged in, show auth modal with sign up
      setShowAuthModal(true);
    }
  };

  useEffect(() => {
    fetchSyndicators();
    fetchTotalActiveDeals();
  }, []);

  async function fetchTotalActiveDeals() {
    try {
      const { count, error } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      if (!error && count !== null) {
        setTotalActiveDeals(count);
      }
    } catch (error) {
      console.error('Error fetching total active deals:', error);
    }
  }

  async function fetchSyndicators() {
    try {
      const { data: syndicatorData, error: syndicatorError } = await supabase
        .from('syndicators')
        .select()
        .in('verification_status', ['verified', 'premier']);

      if (syndicatorError) {
        console.error('Error fetching syndicators:', syndicatorError);
        setSyndicators([]);
        setLoading(false);
        return;
      }

      if (!syndicatorData) {
        setSyndicators([]);
        setLoading(false);
        return;
      }

      const filteredData = syndicatorData
        .filter(s => s.company_name && s.company_name.length >= 3)
        .filter(s => !s.company_name.toLowerCase().includes('admin'))
        .filter(s => !s.company_name.toLowerCase().includes('test'))
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

      setSyndicators(filteredData);
    } catch (error) {
      console.error('Error fetching syndicators:', error);
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

  const featuredSyndicators = syndicators.filter(s => s.feat);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <SEO
          title="Find Real Estate Syndicators - Verified Sponsor Directory | EquityMD"
          description="Browse 75+ verified real estate syndicators. View track records, AUM, years in business & active deals."
          canonical="https://equitymd.com/directory"
        />
        <Navbar />

        {/* Hero Skeleton */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="h-10 w-64 bg-white/20 rounded-lg animate-pulse mb-4"></div>
            <div className="h-6 w-96 bg-white/20 rounded-lg animate-pulse"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <LoadingSkeleton type="syndicator" count={6} />
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 animate-fade-in">
      <SEO
        title="Find Real Estate Syndicators - Verified Sponsor Directory | EquityMD"
        description="Browse 75+ verified real estate syndicators. View track records, AUM, years in business & active deals. Find multifamily, industrial & commercial sponsors."
        keywords="real estate syndicators, syndication sponsors, verified syndicators, multifamily sponsors, commercial real estate syndicators, syndication directory"
        canonical="https://equitymd.com/directory"
      />
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        {/* Floating buildings decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <Briefcase 
              key={i}
              className="absolute text-white/5"
              style={{
                left: `${10 + i * 20}%`,
                top: `${15 + (i % 2) * 40}%`,
                width: `${40 + i * 10}px`,
                height: `${40 + i * 10}px`,
                transform: `rotate(${-10 + i * 5}deg)`,
              }}
            />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-12 relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">Syndicator Directory</h1>
              <p className="text-white/80 mt-1">Connect with experienced real estate investment firms</p>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="flex flex-wrap gap-4 mt-6 mb-8">
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
              <span className="text-white/70 text-sm">Verified Syndicators</span>
              <p className="text-white font-bold text-xl">{syndicators.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
              <span className="text-white/70 text-sm">Featured Partners</span>
              <p className="text-white font-bold text-xl">{featuredSyndicators.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
              <span className="text-white/70 text-sm">Total Active Deals</span>
              <p className="text-white font-bold text-xl">{totalActiveDeals}</p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by company name, location, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/60 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Syndicators Section */}
        {featuredSyndicators.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Award className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Featured Syndicators</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-200 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSyndicators.slice(0, 3).map((syndicator) => (
                <Link
                  key={syndicator.id}
                  to={`/syndicators/${syndicator.slug || syndicator.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  className="group relative"
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl opacity-20 group-hover:opacity-30 transition blur"></div>
                  
                  <div className="relative bg-white rounded-2xl shadow-lg p-6 border border-amber-100 hover:shadow-xl transition">
                    {/* Featured Badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="h-3 w-3" fill="currentColor" />
                      FEATURED
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      {getSyndicatorLogo(syndicator.company_name, syndicator.company_logo_url) ? (
                        <img
                          src={getSyndicatorLogo(syndicator.company_name, syndicator.company_logo_url)!}
                          alt={syndicator.company_name}
                          className="w-16 h-16 object-contain rounded-xl border bg-white p-1"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-emerald-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg truncate">{syndicator.company_name}</h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {getSyndicatorLocation(syndicator.company_name, syndicator.city, syndicator.state).city}, {getSyndicatorLocation(syndicator.company_name, syndicator.city, syndicator.state).state}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-amber-400 mr-1" fill="currentColor" />
                        <span className="font-medium">{syndicator.average_rating}</span>
                        <span className="text-gray-500 text-sm ml-1">({syndicator.total_reviews})</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {syndicator.active_deals} active deal{syndicator.active_deals !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {syndicator.company_description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {syndicator.specialties?.slice(0, 3).map((specialty, index) => (
                        <span
                          key={`${syndicator.id}-specialty-${index}`}
                          className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-gray-600 text-sm">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {syndicator.total_deal_volume && syndicator.total_deal_volume > 0 ? 
                          `$${(syndicator.total_deal_volume / 1000000).toFixed(0)}M volume` : 
                          'Volume TBD'
                        }
                      </div>
                      <span className="flex items-center text-emerald-600 text-sm font-medium group-hover:text-emerald-700">
                        View Profile
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-gray-900 font-semibold text-lg">
                {filteredSyndicators.length} Syndicator{filteredSyndicators.length !== 1 ? 's' : ''}
              </span>
              {searchTerm && (
                <span className="text-gray-500 text-sm">
                  matching "{searchTerm}"
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* State Filter */}
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm cursor-pointer"
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              
              {/* Years Filter */}
              <select
                value={yearsInBusiness}
                onChange={(e) => setYearsInBusiness(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm cursor-pointer"
              >
                {yearsInBusinessRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
              
              {/* Volume Filter */}
              <select
                value={dealVolume}
                onChange={(e) => setDealVolume(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm cursor-pointer"
              >
                {dealVolumeRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
              
              {/* Sort */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'rating' | 'deals' | 'volume')}
                  className="bg-transparent border-none focus:ring-0 text-sm cursor-pointer font-medium"
                >
                  <option value="rating">By Rating</option>
                  <option value="deals">By Active Deals</option>
                  <option value="volume">By Volume</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'grid' 
                      ? 'bg-white text-emerald-600 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'list' 
                      ? 'bg-white text-emerald-600 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* All Syndicators Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Building2 className="h-5 w-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">All Syndicators</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-200 to-transparent"></div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSyndicators.map((syndicator) => (
              <Link
                key={syndicator.id}
                to={`/syndicators/${syndicator.slug || syndicator.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition p-6 border border-gray-100 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  {getSyndicatorLogo(syndicator.company_name, syndicator.company_logo_url) ? (
                    <img
                      src={getSyndicatorLogo(syndicator.company_name, syndicator.company_logo_url)!}
                      alt={syndicator.company_name}
                      className="w-14 h-14 object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-emerald-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate group-hover:text-emerald-600 transition">{syndicator.company_name}</h3>
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {getSyndicatorLocation(syndicator.company_name, syndicator.city, syndicator.state).city}, {getSyndicatorLocation(syndicator.company_name, syndicator.city, syndicator.state).state}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-2 text-center">
                    <div className="text-xs text-gray-500">Rating</div>
                    {syndicator.average_rating > 0 ? (
                      <div className="flex items-center justify-center">
                        <Star className="w-4 h-4 text-amber-400 mr-1" fill="currentColor" />
                        <span className="font-semibold">{syndicator.average_rating}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">-</div>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2 text-center">
                    <div className="text-xs text-gray-500">Deals</div>
                    <div className="font-semibold">{syndicator.active_deals}</div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {syndicator.company_description || 'Real estate investment opportunities.'}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {syndicator.specialties?.slice(0, 2).map((specialty, index) => (
                    <span
                      key={`${syndicator.id}-specialty-${index}`}
                      className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center text-gray-500 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {syndicator.total_deal_volume && syndicator.total_deal_volume > 0 ? 
                      `$${(syndicator.total_deal_volume / 1000000).toFixed(0)}M` : 
                      'TBD'
                    }
                  </div>
                  <span className="flex items-center text-emerald-600 text-sm font-medium">
                    View
                    <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSyndicators.map((syndicator) => (
              <Link
                key={syndicator.id}
                to={`/syndicators/${syndicator.slug || syndicator.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="block bg-white rounded-2xl shadow-sm hover:shadow-lg transition p-6 border border-gray-100 group"
              >
                <div className="flex gap-6">
                  {getSyndicatorLogo(syndicator.company_name, syndicator.company_logo_url) ? (
                    <img
                      src={getSyndicatorLogo(syndicator.company_name, syndicator.company_logo_url)!}
                      alt={syndicator.company_name}
                      className="w-24 h-24 object-contain rounded-xl flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-12 h-12 text-emerald-600" />
                    </div>
                  )}
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition">{syndicator.company_name}</h3>
                        <div className="flex items-center text-gray-500 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {getSyndicatorLocation(syndicator.company_name, syndicator.city, syndicator.state).city}, {getSyndicatorLocation(syndicator.company_name, syndicator.city, syndicator.state).state}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {syndicator.average_rating > 0 ? (
                          <>
                            <Star className="w-5 h-5 text-amber-400 mr-1" fill="currentColor" />
                            <span className="font-semibold">{syndicator.average_rating}</span>
                            <span className="text-gray-500 text-sm ml-1">({syndicator.total_reviews})</span>
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">Not yet rated</span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 mt-3 line-clamp-2">{syndicator.company_description}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {syndicator.specialties?.map((specialty, index) => (
                        <span
                          key={`${syndicator.id}-specialty-${index}`}
                          className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-8 mt-4">
                      <div>
                        <div className="text-sm text-gray-500">Years</div>
                        <div className="font-semibold">{syndicator.years_in_business || '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Active Deals</div>
                        <div className="font-semibold">{syndicator.active_deals}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Total Volume</div>
                        <div className="font-semibold">
                          {syndicator.total_deal_volume && syndicator.total_deal_volume > 0 ? 
                            `$${(syndicator.total_deal_volume / 1000000).toFixed(0)}M` : 
                            'TBD'
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

        {/* Empty State */}
        {filteredSyndicators.length === 0 && (
          <div className="text-center py-16">
            <div className="relative inline-block mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-16 h-16 text-emerald-300" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                <Search className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Syndicators Found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Try adjusting your filters or search criteria.
            </p>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedState('');
                setYearsInBusiness('0');
                setDealVolume('0');
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
            >
              Clear Filters
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* CTA for Syndicators */}
        <div className="mt-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                List Your Company
              </h3>
              <p className="text-white/80 text-lg">
                Get your firm in front of thousands of accredited investors.
              </p>
            </div>
            <button
              onClick={handleJoinDirectoryClick}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Join Directory
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Section with Schema.org markup for SEO */}
      <div className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-3xl mx-auto px-4">
          <FAQSection 
            title="Questions About Real Estate Syndicators"
            faqs={syndicatorFaqs}
          />
        </div>
      </div>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          defaultView="sign_up"
          redirectPath="/syndicator-setup"
        />
      )}

      <Footer />
    </div>
  );
}
