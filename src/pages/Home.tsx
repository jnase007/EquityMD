import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Star, Calendar, TrendingUp, Users, MapPin, ExternalLink,
  Globe, Briefcase, Mail, Phone, Award, CheckCircle, DollarSign,
  BarChart, Target, Clock, Percent, Shield, Building, ChevronRight,
  MessageCircle, User, ArrowRight, Lock, Scale, ShieldCheck
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [useVideo, setUseVideo] = useState(true);
  const [authModalType, setAuthModalType] = useState<'investor' | 'syndicator'>('investor');

  // Mock investor data - replace with real data from your API
  const featuredInvestors = [
    {
      name: "Sarah Chen",
      title: "Technology Executive",
      company: "Tech Innovations Inc",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$2.5M",
        activeDeals: 8,
        avgReturn: "22%"
      },
      specialties: ["Multi-Family", "Mixed-Use", "Value-Add"]
    },
    {
      name: "Michael Rodriguez",
      title: "Business Owner",
      company: "Rodriguez Manufacturing",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$1.8M",
        activeDeals: 12,
        avgReturn: "19%"
      },
      specialties: ["Multi-Family", "Workforce Housing", "Passive Income"]
    },
    {
      name: "Jennifer Kim",
      title: "Financial Advisor",
      company: "Wealth Management Partners",
      image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$3.2M",
        activeDeals: 6,
        avgReturn: "24%"
      },
      specialties: ["Multi-Family", "Student Housing", "Long-term Growth"]
    },
    {
      name: "David Thompson",
      title: "Attorney",
      company: "Thompson & Associates Law",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$1.4M",
        activeDeals: 9,
        avgReturn: "21%"
      },
      specialties: ["Multi-Family", "Tax Benefits", "Passive Income"]
    },
    {
      name: "Lisa Patel",
      title: "Healthcare Executive",
      company: "Regional Medical Group",
      image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$2.9M",
        activeDeals: 7,
        avgReturn: "26%"
      },
      specialties: ["Multi-Family", "Workforce Housing", "Diversification"]
    },
    {
      name: "James Wilson",
      title: "Engineering Consultant",
      company: "Wilson Engineering Solutions",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$1.6M",
        activeDeals: 5,
        avgReturn: "18%"
      },
      specialties: ["Multi-Family", "Value-Add", "Portfolio Growth"]
    }
  ];

  useEffect(() => {
    fetchFeaturedDeals();
  }, []);

  async function fetchFeaturedDeals() {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching featured deals:', error);
        setFeaturedDeals(fallbackMockDeals);
        return;
      }

      // Filter out unwanted deals like Innovation Square
      const filteredData = data ? data.filter(deal => 
        deal.title !== 'Innovation Square' && 
        !deal.title.includes('Innovation Square')
      ) : [];
      
      // Always include priority mock deals (BackBay and Starboard)
      const today = new Date().toISOString();
      const priorityDeals = fallbackMockDeals.filter(deal => 
        deal.syndicator_id === 'back-bay-capital' || deal.syndicator_id === 'starboard-realty'
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

      // Sort with priority deals first (BackBay and Starboard), then by date
      const sortedDeals = uniqueDeals.sort((a, b) => {
        // Priority deals always come first
        const aPriority = a.syndicator_id === 'back-bay-capital' || a.syndicator_id === 'starboard-realty';
        const bPriority = b.syndicator_id === 'back-bay-capital' || b.syndicator_id === 'starboard-realty';
        
        if (aPriority && !bPriority) return -1;
        if (!aPriority && bPriority) return 1;
        
        // Within same priority level, sort by date
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      if (sortedDeals.length === 0) {
        setFeaturedDeals(fallbackMockDeals);
      } else {
        setFeaturedDeals(sortedDeals);
      }
    } catch (error) {
      console.error('Error:', error);
      setFeaturedDeals(fallbackMockDeals);
    }
  }

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
    // Starboard Realty Deals
    {
      id: 'starboard-1',
      syndicator_id: 'starboard-realty',
      title: 'Orange County Multi-Family Portfolio',
      location: 'Orange County, CA',
      property_type: 'Multi-Family',
      status: 'active' as const,
      target_irr: 23,
      minimum_investment: 100000,
      investment_term: 7,
      description: 'Starboard Realty presents a unique opportunity to invest in a diversified portfolio of stabilized multifamily properties across Orange County. With over 30 years of experience and 2,115 units under management, Starboard focuses on well-located properties with growth potential acquired at below replacement cost.',
      address: { street: '', city: 'Orange County', state: 'CA', zip: '' },
      investment_highlights: ['Stabilized Cash Flow', 'Experienced Management', '7-10 Year Hold Period', 'Below Replacement Cost Acquisition', '23% Target IRR', 'Diversified Portfolio'],
      total_equity: 15000000,
      featured: true,
      cover_image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80',
      created_at: '2025-01-27T00:00:00Z',
      updated_at: '2025-01-27T00:00:00Z',
      slug: 'orange-county-multi-family-portfolio'
    },
    // Other mock deals
    {
      id: 'mock-1',
      syndicator_id: 'mock-syndicator-1',
      title: 'Sunset Gardens Apartments',
      location: 'Austin, TX',
      property_type: 'Multi-Family',
      status: 'active' as const,
      target_irr: 18,
      minimum_investment: 50000,
      investment_term: 5,
      description: 'A 120-unit multifamily property in a growing Austin suburb with strong rental demand.',
      address: { street: '123 Sunset Blvd', city: 'Austin', state: 'TX', zip: '78701' },
      investment_highlights: ['Strong rental demand', 'Growing market', 'Value-add opportunity'],
      total_equity: 2500000,
      featured: true,
      cover_image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
      slug: 'sunset-gardens-apartments'
    },
    {
      id: 'mock-2',
      syndicator_id: 'mock-syndicator-2',
      title: 'Downtown Office Plaza',
      location: 'Dallas, TX',
      property_type: 'Office',
      status: 'active' as const,
      target_irr: 15,
      minimum_investment: 100000,
      investment_term: 7,
      description: 'Class A office building in downtown Dallas with long-term corporate tenants.',
      address: { street: '456 Main St', city: 'Dallas', state: 'TX', zip: '75201' },
      investment_highlights: ['Class A building', 'Long-term tenants', 'Downtown location'],
      total_equity: 5000000,
      featured: true,
      cover_image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2024-01-10T00:00:00Z',
      slug: 'downtown-office-plaza'
    }
  ];

  const handleGetStarted = () => {
    setAuthModalType('investor');
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEO />
      
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0">
          {useVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-[600px] object-cover brightness-50"
              onError={() => setUseVideo(false)}
            >
              <source
                src="https://player.vimeo.com/external/451523650.hd.mp4?s=b7fb7f549263e0f9d5c8674ec12be96b2785fc7d&profile_id=174"
                type="video/mp4"
              />
              <img 
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80"
                alt="Modern Apartment Building"
                className="w-full h-[600px] object-cover brightness-50"
              />
            </video>
          ) : (
            <img 
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80"
              alt="Modern Apartment Building"
              className="w-full h-[600px] object-cover brightness-50"
            />
          )}
        </div>
        
        <div className="relative z-20">
          <Navbar isTransparent />
          
          <div className="max-w-4xl mx-auto text-center px-4 py-32">
            <h1 className="text-5xl font-bold text-white mb-6">
              Matching Investors with<br />
              Profitable Real Estate Deals
            </h1>
            <p className="text-xl text-white mb-8">
              Exclusive marketplace platform for accredited investors to discover and participate in vetted real estate syndication deals.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                to="/browse"
                className="bg-blue-600 text-white text-lg px-8 py-3 rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                Browse Opportunities
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button 
                onClick={handleGetStarted}
                className="bg-white text-blue-600 text-lg px-8 py-3 rounded-lg hover:bg-blue-50 transition flex items-center"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">
            Why Choose EquityMD?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<ShieldCheck className="h-8 w-8 text-blue-600" />}
              title="Verified Opportunities"
              description="Every syndication deal undergoes thorough due diligence and verification before listing."
            />
            <FeatureCard 
              icon={<BarChart className="h-8 w-8 text-blue-600" />}
              title="Performance Tracking"
              description="Monitor your investments with real-time analytics and comprehensive reporting tools."
            />
            <FeatureCard 
              icon={<Scale className="h-8 w-8 text-blue-600" />}
              title="Compliance Assured"
              description="Platform built with SEC regulations in mind, ensuring compliant transactions for all parties."
            />
          </div>
        </div>
      </section>

      {/* Featured Deals Section */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
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
                Sign in to view details
              </button>
            )}
          </div>
          
          <div className="relative">
            <div className="overflow-x-auto pb-4 scrollbar-hide">
              <div className="flex gap-6 deal-scroll" style={{ width: 'max-content' }}>
                {featuredDeals.map((deal, index) => (
                  <div key={deal.id} className="w-[400px] relative">
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
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Current Investors Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Current Investors
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join a community of successful real estate investors building wealth through strategic property investments.
            </p>
          </div>
          
          <div className="relative">
            <div className="overflow-x-auto pb-4 scrollbar-hide">
              <div className="flex gap-6" style={{ width: 'max-content' }}>
                {featuredInvestors.map((investor, index) => (
                  <div key={index} className="w-[350px] relative">
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
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <StatCard number="$450M+" label="Total Deal Volume" icon={<Building className="h-8 w-8 text-blue-600" />} />
            <StatCard number="10K+" label="Accredited Investors" icon={<Briefcase className="h-8 w-8 text-blue-600" />} />
            <StatCard number="150+" label="Active Syndications" icon={<Users className="h-8 w-8 text-blue-600" />} />
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
                setShowAuthModal(true);
              }}
              className="bg-white text-blue-600 text-lg px-8 py-3 rounded-lg hover:bg-blue-50 transition"
            >
              Create Investor Profile
            </button>
            <button 
              onClick={() => {
                setAuthModalType('syndicator');
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
        />
      )}

      <Footer />
    </div>
  );
}