import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, LayoutGrid, List, Lock, ChevronRight, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { DealCard, DealListItem } from '../components/Cards';
import { Footer } from '../components/Footer';
import { PageBanner } from '../components/PageBanner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { AuthModal } from '../components/AuthModal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { VerificationBadge, VerificationStatus } from '../components/VerificationBadge';
import type { Deal } from '../types/database';

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
  // Add other syndicators as needed with their appropriate status
};

export function Browse() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching deals:', error);
        // Use fallback mock data if database fetch fails
        setDeals(fallbackMockDeals);
        setLoading(false);
        return;
      }

      // Only include deals from the three real syndicators
      const allowedSyndicators = ['back-bay-capital', 'starboard-realty', 'sutera-properties'];
      let filteredData = data ? data.filter(deal => 
        allowedSyndicators.includes(deal.syndicator_id)
      ) : [];

      // Always include priority mock deals (BackBay, Starboard, and Sutera)
      const today = new Date().toISOString();
      const priorityDeals = fallbackMockDeals.filter(deal => 
        allowedSyndicators.includes(deal.syndicator_id)
      ).map(deal => ({
        ...deal,
        created_at: today,
        updated_at: today
      }));

      // Combine database deals with priority mock deals
      const allDeals = [...priorityDeals, ...filteredData];

      // Remove any duplicates (in case priority deals exist in both mock and database)
      const uniqueDeals = allDeals.filter((deal, index, self) => 
        index === self.findIndex(d => d.title === deal.title)
      );

      setDeals(uniqueDeals);
    } catch (error) {
      console.error('Error fetching deals:', error);
      // Use fallback mock data on error
      setDeals(fallbackMockDeals);
    } finally {
      setLoading(false);
    }
  }

  // Fallback mock deals for demo purposes (simplified)
  const fallbackMockDeals: Deal[] = [
    // BackBay Capital Deals
    {
      id: 'backbay-1',
      syndicator_id: 'back-bay-capital',
      title: 'San Diego Multi-Family Offering',
      location: 'San Diego, CA',
      property_type: 'Multi-Family',
      status: 'active' as const,
      target_irr: 15,
      minimum_investment: 500000,
      investment_term: 5,
      description: 'Back Bay Investment Group presents an opportunity to invest in a fund focused on multifamily development and value-add projects in Southern California. Leveraging the region\'s robust economy, diverse job market, and housing demand, the fund aims to capitalize on the region\'s housing shortage while delivering superior risk-adjusted returns.',
      address: { street: '', city: 'San Diego', state: 'CA', zip: '' },
      investment_highlights: ['Access to Institutional Grade Assets', 'Prime Residential Markets', 'Tax Deductions & Bonus Depreciation Benefits', 'Target 75% Cash on Cash', '15% Target Investor IRR', '1.75x Target Equity Multiple'],
      total_equity: 10000000,
      featured: true,
      cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_SanDeigo.jpg',
      created_at: '2025-01-30T00:00:00Z',
      updated_at: '2025-01-30T00:00:00Z',
      slug: 'san-diego-multi-family-offering'
    },
    {
      id: 'backbay-2',
      syndicator_id: 'back-bay-capital',
      title: 'Newport Beach Residential Offering',
      location: 'Newport Beach, CA',
      property_type: 'Residential',
      status: 'active' as const,
      target_irr: 20,
      minimum_investment: 250000,
      investment_term: 2,
      description: 'Back Bay Investment Group is offering an exclusive opportunity to invest in residential real estate in Newport Beach and surrounding coastal communities, targeting high-demand neighborhoods with limited inventory and strong growth potential.',
      address: { street: '', city: 'Newport Beach', state: 'CA', zip: '' },
      investment_highlights: ['Short Term Investment', 'Value-Add Strategy', 'Multiple Exit Options', 'Target 60% Cash on Cash', '20% Target Investor IRR', '1.6x Target Equity Multiple'],
      total_equity: 10000000,
      featured: true,
      cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_Newport.jpg',
      created_at: '2025-01-29T00:00:00Z',
      updated_at: '2025-01-29T00:00:00Z',
      slug: 'newport-beach-residential-offering'
    },
    {
      id: 'backbay-3',
      syndicator_id: 'back-bay-capital',
      title: 'Orange County Pref Equity Offering',
      location: 'Newport Beach, CA',
      property_type: 'Preferred Equity',
      status: 'active' as const,
      target_irr: 15,
      minimum_investment: 100000,
      investment_term: 2,
      description: 'Back Bay Investment Group is offering a preferred equity investment with a fixed 15% annual return, paid quarterly, and a targeted holding period of 1–3 years. Designed for investors seeking secure, predictable income, this offering provides priority in the capital stack above common equity.',
      address: { street: '', city: 'Newport Beach', state: 'CA', zip: '' },
      investment_highlights: ['Quarterly Payments', 'Fixed 15% Return', 'Priority in the Equity Stack', 'Target 45% Cash on Cash', '15% Target Investor IRR', '1.45x Target Equity Multiple'],
      total_equity: 10000000,
      featured: true,
      cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_OrangeCounty.jpg',
      created_at: '2025-01-28T00:00:00Z',
      updated_at: '2025-01-28T00:00:00Z',
      slug: 'orange-county-pref-equity-offering'
    },
    // Sutera Properties Deals
    {
      id: 'sutera-1',
      syndicator_id: 'sutera-properties',
      title: 'Greenville Apartment Complex',
      location: 'Travelers Rest, SC',
      property_type: 'Multi-Family',
      status: 'active' as const,
      target_irr: 17.19,
      minimum_investment: 50000,
      investment_term: 5,
      description: 'Sutera Properties presents Liva, a ground-up multifamily development in Travelers Rest, South Carolina, a rapidly growing suburb of Greenville. The project spans 10.5 acres and includes 120 multifamily units and 32 individually platted townhomes, totaling 152 units.',
      address: { street: '', city: 'Travelers Rest', state: 'SC', zip: '' },
      investment_highlights: [
        'Ground-up development',
        '152 total units (120 multifamily + 32 townhomes)',
        'Resort-style amenities',
        'Pool and clubhouse',
        'Fitness center',
        'Dog park and bike barn',
        'Prime location near Swamp Rabbit Trail',
        'Shovel-ready with permits secured'
      ],
      total_equity: 12340000,
      featured: true,
      cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Greenville.png',
      created_at: '2025-02-01T00:00:00Z',
      updated_at: '2025-02-01T00:00:00Z',
      slug: 'greenville-apartment-complex'
    },
    // Starboard Realty Deals
    {
      id: 'starboard-2',
      syndicator_id: 'starboard-realty',
      title: 'Multifamily ADU Opportunity',
      location: 'Southern California',
      property_type: 'Multi-Family',
      status: 'active' as const,
      target_irr: 30,
      minimum_investment: 50000,
      investment_term: 3,
      description: 'Starboard Realty Advisors is offering investors the opportunity to invest in the high-demand multifamily markets of Southern California. With a growing pipeline of opportunities, the Fund will be opportunistically deploying capital to acquire small multifamily buildings with the intent of maximizing revenue growth through renovations and the addition of units by leveraging California\'s recent Accessory Dwelling Unit (ADU) legislation.',
      address: { street: '', city: 'Southern California', state: 'CA', zip: '' },
      investment_highlights: ['30%+ Target Property IRR', '1.60X - 1.90X+ Equity Multiple', '2-3 Year Investment Horizon', 'ADU Legislation Leverage', 'Economies of Scale', 'Cost Segregation & Tax Benefits'],
      total_equity: 5000000,
      featured: true,
      cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//adu.png',
      created_at: '2025-01-31T00:00:00Z',
      updated_at: '2025-01-31T00:00:00Z',
      slug: 'multifamily-adu-opportunity'
    }
  ];

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
      default: // 'recent'
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const types = ['All', 'Office', 'Multi-Family', 'Medical', 'Student Housing', 'Industrial', 'Preferred Equity', 'Residential'];
  const statuses = ['All', 'Active', 'Coming Soon'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <PageBanner 
          title="Browse Investment Opportunities"
          subtitle="Discover and invest in institutional-quality real estate deals"
        >
          <div className="max-w-3xl mx-auto mt-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by property name or location..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/70"
                  disabled
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  disabled
                >
                  <option>All Types</option>
                </select>
                
                <select
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  disabled
                >
                  <option>All Status</option>
                </select>
              </div>
            </div>
          </div>
        </PageBanner>

        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="flex items-center space-x-4">
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>

          <LoadingSkeleton type="property" count={6} />
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <Navbar />
      
      <PageBanner 
        title="Locate Investment Opportunities"
        subtitle="Discover and invest in institutional-quality real estate deals"
      >
        <div className="max-w-3xl mx-auto mt-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by property name or location..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/70"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/50 focus:border-transparent"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {types.map(type => (
                  <option key={type} value={type} className="text-gray-900">{type}</option>
                ))}
              </select>
              
              <select
                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/50 focus:border-transparent"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statuses.map(status => (
                  <option key={status} value={status} className="text-gray-900">{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </PageBanner>

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {filteredDeals.length} Investment Opportunities
          </h2>
          <div className="flex items-center space-x-4">
            {!user && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <Lock className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Sign in to view details</span>
              </button>
            )}

            {/* Mobile Sort Button */}
            <div className="relative md:hidden">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm"
              >
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">Sort</span>
              </button>

              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        sortBy === option.value 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Sort Dropdown */}
            <div className="hidden md:flex items-center space-x-2 text-gray-600">
              <Filter className="h-5 w-5" />
              <span>Sort by: </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-none bg-transparent font-medium focus:ring-0"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 border-l pl-4">
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

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {filteredDeals.map((deal, index) => (
              <div key={deal.id} className="h-full">
                <DealCard
                  id={deal.id}
                  slug={deal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
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
            {filteredDeals.map((deal, index) => (
              <DealListItem
                key={deal.id}
                id={deal.id}
                slug={deal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
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

        {filteredDeals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No investment opportunities found matching your criteria</div>
          </div>
        )}
      </div>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      <Footer />
    </div>
  );
}