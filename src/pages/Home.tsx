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
import { useScrollFix } from '../hooks/useScrollFix';
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
  
  // Apply scroll fix hook
  useScrollFix();
  
  // Featured investor data with realistic portfolio information
  const featuredInvestors = [
    {
      name: "Sarah",
      title: "Technology Executive",
      company: "",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$275K",
        avgReturn: "18.5%"
      },
      specialties: ["Multi-Family", "Mixed-Use", "Value-Add"],
      location: "CA"
    },
    {
      name: "Michael",
      title: "Business Owner",
      company: "",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$486K",
        avgReturn: "16.2%"
      },
      specialties: ["Multi-Family", "Workforce Housing", "Passive Income"],
      location: "TN"
    },
    {
      name: "Jennifer",
      title: "Financial Advisor",
      company: "",
      image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$325K",
        avgReturn: "21.3%"
      },
      specialties: ["Multi-Family", "Student Housing", "Long-term Growth"],
      location: "FL"
    },
    {
      name: "David",
      title: "Attorney",
      company: "",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$150K",
        avgReturn: "14.8%"
      },
      specialties: ["Multi-Family", "Tax Benefits", "Passive Income"],
      location: "AZ"
    },
    {
      name: "Lisa",
      title: "Healthcare Executive",
      company: "",
      image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$625K",
        avgReturn: "19.1%"
      },
      specialties: ["Multi-Family", "Workforce Housing", "Diversification"],
      location: "CA"
    },
    {
      name: "James",
      title: "Engineering Consultant",
      company: "",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$195K",
        avgReturn: "17.6%"
      },
      specialties: ["Multi-Family", "Value-Add", "Portfolio Growth"],
      location: "TN"
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
      .order('highlighted', { ascending: false })
      .order('created_at', { ascending: false });

    console.log('Fetched deals:', data);
    console.log('Error fetching deals:', error);

    if (error || !data) {
      console.error('Error fetching featured deals:', error);
      setFeaturedDeals([]);
      return;
    }

    // Prioritize highlighted deals first, then other deals
    const highlightedDeals = data.filter((deal: any) => deal.highlighted);
    const otherDeals = data.filter((deal: any) => !deal.highlighted);
    
    // Show highlighted deals first, then fill with other deals if needed
    const featuredList = [...highlightedDeals, ...otherDeals].slice(0, 6);
    
    console.log('Featured deals (highlighted first):', featuredList);
    setFeaturedDeals(featuredList);

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
          
          <div className="relative homepage-scroll-section">
            <div className="horizontal-scroll-container pb-4">
              <div className="flex gap-4 md:gap-6" style={{ width: 'max-content' }}>
                {featuredDeals.length > 0 ? (
                  featuredDeals.map((deal, index) => {
                    return (
                      <div key={deal.id} className="w-[300px] md:w-[350px] relative flex-shrink-0 card-container">
                        <DealCard
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
          
          <div className="relative homepage-scroll-section">
            <div className="horizontal-scroll-container pb-4">
              <div className="flex gap-4 md:gap-6" style={{ width: 'max-content' }}>
                {featuredInvestors.map((investor, index) => (
                  <div key={index} className="w-[300px] md:w-[350px] relative flex-shrink-0 card-container">
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
            <StatCard number="$43M" label="Investor Requested Amount" icon={<Building className="h-8 w-8 text-blue-600" />} />
            <StatCard number="10K+" label="Accredited Investors" icon={<Briefcase className="h-8 w-8 text-blue-600" />} />
            <StatCard number="20+" label="Featured Syndicators" icon={<Users className="h-8 w-8 text-blue-600" />} />
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