import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Mail, Phone, Award, CheckCircle, DollarSign,
  BarChart, Target, Clock, Percent, Shield, Building, ChevronRight,
  MessageCircle, User, ArrowRight, Lock, Scale, ShieldCheck, Bell
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { DealCard, FeatureCard, StatCard, InvestorCard } from '../components/Cards';
import { AuthModal } from '../components/AuthModal';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
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

export function Home() {
  const { user } = useAuthStore();
  const [featuredDeals, setFeaturedDeals] = useState<Deal[]>([]);
  const [totalDealVolume, setTotalDealVolume] = useState<string>('$450M+'); // Default fallback
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [useVideo, setUseVideo] = useState(true);
  const [authModalType, setAuthModalType] = useState<'investor' | 'syndicator'>('investor');
  const [authModalView, setAuthModalView] = useState<'sign_in' | 'sign_up'>('sign_up');
  
  // Mock investor data - replace with real data from your API
  const featuredInvestors = [
    {
      name: "Sarah",
      title: "Technology Executive",
      company: "",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$1.2M",
        timeOnPlatform: "2.5 years",
        avgReturn: "22%"
      },
      specialties: ["Multi-Family", "Mixed-Use", "Value-Add"]
    },
    {
      name: "Michael",
      title: "Business Owner",
      company: "",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$850K",
        timeOnPlatform: "1.8 years",
        avgReturn: "19%"
      },
      specialties: ["Multi-Family", "Workforce Housing", "Passive Income"]
    },
    {
      name: "Jennifer",
      title: "Financial Advisor",
      company: "",
      image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$1.4M",
        timeOnPlatform: "3.2 years",
        avgReturn: "24%"
      },
      specialties: ["Multi-Family", "Student Housing", "Long-term Growth"]
    },
    {
      name: "David",
      title: "Attorney",
      company: "",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$650K",
        timeOnPlatform: "1.1 years",
        avgReturn: "21%"
      },
      specialties: ["Multi-Family", "Tax Benefits", "Passive Income"]
    },
    {
      name: "Lisa",
      title: "Healthcare Executive",
      company: "",
      image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$1.1M",
        timeOnPlatform: "2.8 years",
        avgReturn: "26%"
      },
      specialties: ["Multi-Family", "Workforce Housing", "Diversification"]
    },
    {
      name: "James",
      title: "Engineering Consultant",
      company: "",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$250K",
        timeOnPlatform: "0.9 years",
        avgReturn: "18%"
      },
      specialties: ["Multi-Family", "Value-Add", "Portfolio Growth"]
    }
  ];

  useEffect(() => {
    fetchFeaturedDeals();
    fetchTotalDealVolume();
  }, []);

  // async function fetchFeaturedDeals() {
  //   try {
  //     const { data, error } = await supabase
  //       .from('deals')
  //       .select('*')
  //       .eq('status', 'active')
  //       .order('created_at', { ascending: false });

  //     console.log('Fetched deals:', data);
  //     console.log('Error fetching deals:', error);

  //     if (error) {
  //       console.error('Error fetching featured deals:', error);
  //       setFeaturedDeals(fallbackMockDeals);
  //       return;
  //     }

  //     // Only include deals from the three real syndicators
  //     const allowedSyndicators = ['back-bay-capital', 'starboard-realty', 'sutera-properties'];
  //     const filteredData = data ? data.filter(deal => 
  //       allowedSyndicators.includes(deal.syndicator_id)
  //     ) : [];
      
  //     // Always include priority mock deals (BackBay, Starboard, and Sutera)
  //     const today = new Date().toISOString();
  //     const priorityDeals = fallbackMockDeals.filter(deal => 
  //       allowedSyndicators.includes(deal.syndicator_id)
  //     ).map(deal => ({
  //       ...deal,
  //       created_at: today,
  //       updated_at: today
  //     }));

  //     // Combine database deals with priority mock deals
  //     const allDeals = [...priorityDeals, ...filteredData];

  //     // Remove any duplicates (in case priority deals exist in both mock and database)
  //     const uniqueDeals = allDeals.filter((deal, index, self) => 
  //       index === self.findIndex(d => d.title === deal.title)
  //     );

  //     setFeaturedDeals(uniqueDeals.slice(0, 6)); // Limit to 6 featured deals

  //     console.log('Featured deals:', uniqueDeals.slice(0, 6));

  //   } catch (error) {
  //     console.error('Error fetching featured deals:', error);
  //     setFeaturedDeals(fallbackMockDeals);
  //   }
  // }

  async function fetchFeaturedDeals() {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    console.log('Fetched deals:', data);
    console.log('Error fetching deals:', error);

    if (error || !data) {
      console.error('Error fetching featured deals:', error);
      setFeaturedDeals([]);
      return;
    }

    // Filter to only show deals from Starboard Realty, Souterra Properties, and Back Bay Capital
    const allowedSyndicators = ['starboard-realty', 'sutera-properties', 'back-bay-capital'];
    const filteredDeals = data.filter((deal: any) => 
      allowedSyndicators.includes(deal.syndicator_id)
    );

    console.log('Filtered deals for featured section:', filteredDeals);
    
    // If no database deals found, use fallback mock deals
    if (filteredDeals.length === 0) {
      console.log('No database deals found, using fallback mock deals');
      const fallbackDeals = fallbackMockDeals.filter(deal => 
        allowedSyndicators.includes(deal.syndicator_id)
      );
      setFeaturedDeals(fallbackDeals.slice(0, 6));
    } else {
      setFeaturedDeals(filteredDeals.slice(0, 6));
    }

  } catch (error) {
    console.error('Unexpected error fetching featured deals:', error);
    setFeaturedDeals([]);
  }
}


  async function fetchTotalDealVolume() {
    try {
      const { data, error } = await supabase
        .from('syndicator_profiles')
        .select('total_deal_volume')
        .not('total_deal_volume', 'is', null);

      if (error) {
        console.error('Error fetching deal volumes:', error);
        return;
      }

      // Calculate total deal volume from all syndicators
      const total = data.reduce((sum: number, syndicator: any) => {
        return sum + (syndicator.total_deal_volume || 0);
      }, 0);

      // Format the total in a readable way
      if (total >= 1000000000) {
        setTotalDealVolume(`$${(total / 1000000000).toFixed(1)}B+`);
      } else if (total >= 1000000) {
        setTotalDealVolume(`$${Math.floor(total / 1000000)}M+`);
      } else {
        setTotalDealVolume(`$${Math.floor(total / 1000)}K+`);
      }
    } catch (error) {
      console.error('Error calculating total deal volume:', error);
      // Keep the default fallback value
    }
  }

  // useEffect(() => {

  // })

  // Fallback mock deals for demo purposes
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
              cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0980.jpeg',
        media_urls: [
          // Actual images that exist in liva_2025 folder (IMG_0980 to IMG_0986)
          'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0980.jpeg',
          'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0981.jpeg',
          'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0982.jpeg',
          'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0983.jpeg',
          'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0984.jpeg',
          'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0985.jpeg',
          'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0986.jpeg'
        ],
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

  // const handleGetStarted = () => {
  //   setAuthModalType('investor');
  //   setAuthModalView('sign_up');
  //   setShowAuthModal(true);
  // };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEO 
        title="Find Top CRE Deals - Largest Syndication Directory | EquityMD"
        description="EquityMD connects accredited investors with institutional-quality real estate investment opportunities through a curated platform of verified syndicators."
        keywords="CRE deals, syndication directory, accredited investors, real estate syndication, commercial real estate, multifamily investments, verified syndicators"
        canonical="https://equitymd.com"
      />
      
      {/* Activity Banner */}
      <div className="bg-blue-600 text-white py-2 px-4 text-center">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-sm sm:text-base">
            🔥 <strong>24+ investors</strong> joined today • <strong>3 new deals</strong> added this week • <strong>Active marketplace</strong> for accredited investors
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0">
          {useVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-[500px] sm:h-[600px] object-cover brightness-50"
              onError={() => setUseVideo(false)}
            >
              <source
                src="https://player.vimeo.com/external/451523650.hd.mp4?s=b7fb7f549263e0f9d5c8674ec12be96b2785fc7d&profile_id=174"
                type="video/mp4"
              />
              <img 
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80"
                alt="Modern Apartment Building"
                className="w-full h-[500px] sm:h-[600px] object-cover brightness-50"
              />
            </video>
          ) : (
            <img 
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80"
              alt="Modern Apartment Building"
              className="w-full h-[500px] sm:h-[600px] object-cover brightness-50"
            />
          )}
        </div>
        
        <div className="relative z-20">
          <Navbar isTransparent />
          
          <div className="max-w-4xl mx-auto text-center px-4 pt-28 pb-16 sm:py-24 md:py-36 safe-area-top">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 sm:mb-6 mobile-heading-responsive">
              Matching Investors with<br />
              Profitable Real Estate Deals
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white mb-6 sm:mb-8 mobile-text-responsive max-w-2xl mx-auto">
              Exclusive marketplace platform for accredited investors to discover and participate in vetted real estate syndication deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-2">
              <Link 
                to="/find"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
              >
                Find Opportunities
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button 
                onClick={() => {
                  setAuthModalType('investor');
                  setAuthModalView('sign_up');
                  setShowAuthModal(true);
                }}
                className="bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-400 transition-colors border-2 border-blue-400"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 sm:py-20 px-6 mt-16 sm:mt-0">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 sm:mb-16 text-gray-800">
            Why Choose EquityMD?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<ShieldCheck className="h-8 w-8 text-blue-600" />}
              title="Verified Opportunities"
              description="Every syndication deal undergoes thorough due diligence and verification before listing."
            />
            <FeatureCard 
              icon={<Bell className="h-8 w-8 text-blue-600" />}
              title="New Deal Alerts"
              description="Get new CRE deal alerts on Equitymd.com. Browse and email syndicators. No deal recommendations. Contact off-platform."
            />
            <FeatureCard 
              icon={<Mail className="h-8 w-8 text-blue-600" />}
              title="Direct Syndicator Access"
              description="Email CRE syndicators directly on Equitymd.com. No investor fees, no transactions here. No deal endorsements."
            />
          </div>
        </div>
      </section>

      {/* Featured Deals Section */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Featured Investment Opportunities
            </h2>
            {!user && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <Lock className="h-4 w-4 mr-1" />
                Sign in for full details
              </button>
            )}
          </div>
          
          <div className="relative">
            <div className="overflow-x-auto pb-4 scrollbar-hide horizontal-scroll mobile-scroll touch-pan-x">
              <div className="flex gap-4 md:gap-6" style={{ width: 'max-content' }}>
                {featuredDeals.length > 0 ? (
                  featuredDeals.map((deal, index) => {
                    return (
                      <div key={deal.id} className="w-[300px] md:w-[350px] relative flex-shrink-0">
                        <DealCard
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
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full text-center py-12">
                    <p className="text-gray-500 text-lg">No featured deals available at the moment.</p>
                    <p className="text-gray-400 text-sm mt-2">Please check back later for new investment opportunities.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Gradient Overlays */}
            {featuredDeals.length > 0 && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Current Investors Section */}
      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Current Investors
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join a community of successful real estate investors building wealth through strategic property investments.
            </p>
          </div>
          
          <div className="relative">
            <div className="overflow-x-auto pb-4 scrollbar-hide horizontal-scroll mobile-scroll touch-pan-x">
              <div className="flex gap-4 md:gap-6" style={{ width: 'max-content' }}>
                {featuredInvestors.map((investor, index) => (
                  <div key={index} className="w-[300px] md:w-[350px] relative flex-shrink-0">
                    <InvestorCard
                      name={investor.name}
                      title={investor.title}
                      company={investor.company}
                      image={investor.image}
                      portfolio={investor.portfolio}
                      specialties={investor.specialties}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <StatCard number={totalDealVolume} label="Total Deal Volume" icon={<Building className="h-8 w-8 text-blue-600" />} />
            <StatCard number="10K+" label="Accredited Investors" icon={<Briefcase className="h-8 w-8 text-blue-600" />} />
            <StatCard number="20+" label="Syndications" icon={<Users className="h-8 w-8 text-blue-600" />} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative">
        <div 
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.4)'
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/80 to-blue-900/80" />

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 py-20">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Expand Your Investment Portfolio?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join EquityMD today to access exclusive real estate syndication opportunities.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => {
                setAuthModalType('investor');
                setAuthModalView('sign_up');
                setShowAuthModal(true);
              }}
              className="bg-white text-blue-600 text-lg px-8 py-3 rounded-lg hover:bg-blue-50 transition"
            >
              Create Investor Profile
            </button>
            <button 
              onClick={() => {
                setAuthModalType('syndicator');
                setAuthModalView('sign_up');
                setShowAuthModal(true);
              }}
              className="bg-blue-700 text-white text-lg px-8 py-3 rounded-lg hover:bg-blue-800 transition border border-white"
            >
              Create Syndicator Profile
            </button>
          </div>
        </div>
      </section>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          defaultType={authModalType}
          defaultView={authModalView}
        />
      )}

      <Footer />
    </div>
  );
}