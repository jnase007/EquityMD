import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, LayoutGrid, List, Lock, ChevronRight, TrendingUp, DollarSign, Clock, Sparkles, Building2, ArrowRight, Target, Gem } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { DealCard, DealListItem } from '../components/Cards';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { FAQSection } from '../components/FAQSection';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { AuthModal } from '../components/AuthModal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { VerificationBadge, VerificationStatus } from '../components/VerificationBadge';
import type { Deal } from '../types/database';

// FAQ data for deals/browse page - targeting deal-related searches
const dealsFaqs = [
  {
    question: "How do I evaluate a real estate syndication deal?",
    answer: "Look at key metrics like target IRR (15-20% is typical), cash-on-cash returns (6-10% annually), hold period (3-7 years), and minimum investment. Review the syndicator's track record, the property's location and condition, and the business plan (value-add vs. stabilized)."
  },
  {
    question: "What is the difference between preferred return and IRR?",
    answer: "Preferred return (pref) is the minimum annual return investors receive before the syndicator takes their share of profits, typically 6-8%. IRR (Internal Rate of Return) is the total annualized return including both distributions and profit at sale, accounting for the time value of money."
  },
  {
    question: "Are real estate syndication investments liquid?",
    answer: "No, syndication investments are illiquid. Your capital is typically locked for the hold period (3-7 years). You'll receive quarterly or monthly distributions, but cannot easily sell your shares. Plan to hold until the property is sold or refinanced."
  },
  {
    question: "What documents should I review before investing?",
    answer: "Review the Private Placement Memorandum (PPM), Operating Agreement, Subscription Agreement, and financial projections. Pay attention to fees, profit splits, voting rights, and exit strategies. Consider having an attorney review the documents."
  },
  {
    question: "How are syndication returns taxed?",
    answer: "Syndication returns receive favorable tax treatment. You'll receive a K-1 form annually showing your share of income, depreciation, and deductions. Depreciation often creates paper losses that offset income, and long-term capital gains rates apply at sale."
  }
];

// Property type to image mapping
const propertyTypeImages: Record<string, string> = {
  'Multi-Family': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80',
  'Office': 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
  'Retail': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80',
  'Industrial': 'https://images.unsplash.com/photo-1553246969-7dcb4259a87b?auto=format&fit=crop&q=80',
  'Medical': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80',
  'Student Housing': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80',
  'Mixed-Use': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80',
  'Hotel/Hospitality': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80',
  'Senior Living': 'https://images.unsplash.com/photo-1559098517-fb7f50ca8bf7?auto=format&fit=crop&q=80',
  'Self-Storage': 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&q=80'
};

// Default fallback images for variety
const fallbackImages = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1577979749830-f1d742b96791?auto=format&fit=crop&q=80'
];

// Get image URL based on property type or fallback to random default
const getPropertyImage = (propertyType: string, index: number) => {
  return propertyTypeImages[propertyType] || fallbackImages[index % fallbackImages.length];
};

// Map syndicator IDs to their verification status
const syndicatorVerificationStatus: Record<string, VerificationStatus> = {
  'back-bay-capital': 'premier',
  'sutera-properties': 'premier', 
  'starboard-realty': 'premier',
};

export function Browse() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalView, setAuthModalView] = useState<'sign_in' | 'sign_up'>('sign_up');
  const [authRedirectPath, setAuthRedirectPath] = useState<string | undefined>(undefined);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  // Handle "List Your Deal" button click
  const handleListDealClick = () => {
    if (user) {
      // User is logged in, go to syndicator setup
      navigate('/syndicator-setup');
    } else {
      // User is not logged in, show auth modal with sign up, redirect to syndicator setup
      setAuthModalView('sign_up');
      setAuthRedirectPath('/syndicator-setup');
      setShowAuthModal(true);
    }
  };

  // Handle "Sign in for details" click
  const handleSignInForDetails = () => {
    setAuthModalView('sign_in');
    setAuthRedirectPath(undefined); // Default redirect (dashboard)
    setShowAuthModal(true);
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('status', 'active')
        .order('highlighted', { ascending: false })
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.error('Error fetching deals:', error);
        setDeals([]);
        setLoading(false);
        return;
      }

      console.log('Fetched deals for browse page:', data);
      setDeals(data);
    } catch (error) {
      console.error('Error fetching deals:', error);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }

  const sortOptions = [
    { value: 'recent', label: 'Recently Added' },
    { value: 'irr', label: 'Highest Return' },
    { value: 'minimum', label: 'Lowest Minimum' }
  ];

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || deal.property_type === selectedType;
    const matchesStatus = selectedStatus === 'All' || deal.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'irr':
        return (b.target_irr || 0) - (a.target_irr || 0);
      case 'minimum':
        return (a.minimum_investment || 0) - (b.minimum_investment || 0);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Separate highlighted deals from regular deals
  const highlightedDeals = filteredDeals.filter(deal => deal.highlighted);
  const regularDeals = filteredDeals.filter(deal => !deal.highlighted);

  const types = ['All', 'Office', 'Multi-Family', 'Medical', 'Student Housing', 'Industrial', 'Preferred Equity', 'Residential'];
  const statuses = ['All', 'Active', 'Coming Soon'];

  // Calculate stats
  const avgIRR = deals.length > 0 ? (deals.reduce((sum, d) => sum + (d.target_irr || 0), 0) / deals.length).toFixed(1) : '0';
  const minInvestment = deals.length > 0 ? Math.min(...deals.map(d => d.minimum_investment || 0)) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navbar />
        
        {/* Hero Header Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="h-10 w-64 bg-white/20 rounded-lg animate-pulse mb-4"></div>
            <div className="h-6 w-96 bg-white/20 rounded-lg animate-pulse"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <LoadingSkeleton type="property" count={6} />
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 animate-fade-in">
      <SEO
        title="Browse Real Estate Syndication Deals - Multifamily, Commercial, Industrial | EquityMD"
        description="Explore 50+ active real estate syndication deals. Filter by property type, location, IRR & minimum investment. Compare multifamily, industrial & medical office investments."
        canonical="https://equitymd.com/find"
        keywords="real estate deals, syndication opportunities, multifamily investments, commercial real estate, industrial properties, passive income investing"
      />
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        {/* Floating buildings decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <Building2 
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
              <Gem className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">Find Investment Opportunities</h1>
              <p className="text-white/80 mt-1">Discover institutional-quality real estate deals</p>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="flex flex-wrap gap-4 mt-6 mb-8">
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
              <span className="text-white/70 text-sm">Active Deals</span>
              <p className="text-white font-bold text-xl">{deals.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
              <span className="text-white/70 text-sm">Avg. Target IRR</span>
              <p className="text-white font-bold text-xl">{avgIRR}%</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
              <span className="text-white/70 text-sm">Starts From</span>
              <p className="text-white font-bold text-xl">${minInvestment.toLocaleString()}</p>
            </div>
          </div>
          
          {/* Search Bar in Hero */}
          <div className="max-w-3xl">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by property name or location..."
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/60 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/50 focus:border-transparent cursor-pointer"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {types.map(type => (
                    <option key={type} value={type} className="text-gray-900">{type === 'All' ? 'All Types' : type}</option>
                  ))}
                </select>
                
                <select
                  className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/50 focus:border-transparent cursor-pointer"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statuses.map(status => (
                    <option key={status} value={status} className="text-gray-900">{status === 'All' ? 'All Status' : status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-gray-900 font-semibold text-lg">
                {filteredDeals.length} {filteredDeals.length === 1 ? 'Opportunity' : 'Opportunities'}
              </span>
              {searchTerm && (
                <span className="text-gray-500 text-sm">
                  matching "{searchTerm}"
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {!user && (
                <button
                  onClick={handleSignInForDetails}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Lock className="h-4 w-4" />
                  <span className="hidden md:inline">Sign in for details</span>
                </button>
              )}

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm cursor-pointer font-medium"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Deals Section */}
        {highlightedDeals.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Sparkles className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Featured Opportunities</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-200 to-transparent"></div>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {highlightedDeals.map((deal, index) => (
                  <div key={deal.id} className="h-full relative group">
                    {/* Featured glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl opacity-20 group-hover:opacity-30 transition blur"></div>
                    <div className="relative h-full">
                      <DealCard
                        id={deal.id}
                        slug={deal.slug}
                        image={deal.cover_image_url || getPropertyImage(deal.property_type, index)}
                        title={deal.title}
                        location={deal.location}
                        metrics={{
                          target: `${deal.target_irr}% IRR`,
                          minimum: `$${deal.minimum_investment.toLocaleString()}`,
                          term: `${deal.investment_term} years`
                        }}
                        detailed
                        isAuthenticated={!!user}
                        onAuthRequired={() => setShowAuthModal(true)}
                        verificationStatus={syndicatorVerificationStatus[deal.syndicator_id] || 'unverified'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {highlightedDeals.map((deal, index) => (
                  <DealListItem
                    key={deal.id}
                    id={deal.id}
                    slug={deal.slug}
                    image={deal.cover_image_url || getPropertyImage(deal.property_type, index)}
                    title={deal.title}
                    location={deal.location}
                    description={deal.description || ''}
                    metrics={{
                      target: `${deal.target_irr}% IRR`,
                      minimum: `$${deal.minimum_investment.toLocaleString()}`,
                      term: `${deal.investment_term} years`
                    }}
                    isAuthenticated={!!user}
                    onAuthRequired={() => setShowAuthModal(true)}
                    verificationStatus={syndicatorVerificationStatus[deal.syndicator_id] || 'unverified'}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Regular Deals Section */}
        {regularDeals.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">All Opportunities</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {regularDeals.map((deal, index) => (
                  <div key={deal.id} className="h-full">
                    <DealCard
                      id={deal.id}
                      slug={deal.slug}
                      image={deal.cover_image_url || getPropertyImage(deal.property_type, index)}
                      title={deal.title}
                      location={deal.location}
                      metrics={{
                        target: `${deal.target_irr}% IRR`,
                        minimum: `$${deal.minimum_investment.toLocaleString()}`,
                        term: `${deal.investment_term} years`
                      }}
                      detailed
                      isAuthenticated={!!user}
                      onAuthRequired={() => setShowAuthModal(true)}
                      verificationStatus={syndicatorVerificationStatus[deal.syndicator_id] || 'unverified'}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {regularDeals.map((deal, index) => (
                  <DealListItem
                    key={deal.id}
                    id={deal.id}
                    slug={deal.slug}
                    image={deal.cover_image_url || getPropertyImage(deal.property_type, index)}
                    title={deal.title}
                    location={deal.location}
                    description={deal.description || ''}
                    metrics={{
                      target: `${deal.target_irr}% IRR`,
                      minimum: `$${deal.minimum_investment.toLocaleString()}`,
                      term: `${deal.investment_term} years`
                    }}
                    isAuthenticated={!!user}
                    onAuthRequired={() => setShowAuthModal(true)}
                    verificationStatus={syndicatorVerificationStatus[deal.syndicator_id] || 'unverified'}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {filteredDeals.length === 0 && (
          <div className="text-center py-16">
            <div className="relative inline-block mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <Building2 className="w-16 h-16 text-blue-300" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
                <Search className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Opportunities Found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Try adjusting your search criteria or explore all available deals.
            </p>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('All');
                setSelectedStatus('All');
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              Clear Filters
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* CTA for Syndicators */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Are You a Syndicator?
              </h3>
              <p className="text-white/80 text-lg">
                List your investment opportunities and connect with accredited investors.
              </p>
            </div>
            <button
              onClick={handleListDealClick}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              List Your Deal
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Section with Schema.org markup for SEO */}
      <div className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-3xl mx-auto px-4">
          <FAQSection 
            title="Common Questions About Real Estate Deals"
            faqs={dealsFaqs}
          />
        </div>
      </div>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          defaultView={authModalView}
          redirectPath={authRedirectPath}
        />
      )}

      <Footer />
    </div>
  );
}
