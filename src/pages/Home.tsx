import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Mail, Award, CheckCircle, DollarSign,
  BarChart, Target, Clock, Percent, Shield, Building, ChevronRight,
  MessageCircle, User, ArrowRight, Lock, Scale, ShieldCheck, Bell,
  Sparkles, TrendingUp, Star, Zap
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { DealCard, FeatureCard, StatCard, InvestorCard } from '../components/Cards';
import { AuthModal } from '../components/AuthModal';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { FAQSection } from '../components/FAQSection';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { useScrollFix } from '../hooks/useScrollFix';
import type { Deal } from '../types/database';

// FAQ data for SEO - targeting high-value search queries
const homeFaqs = [
  {
    question: "What is EquityMD and how does it work?",
    answer: "EquityMD is a marketplace connecting accredited investors with verified real estate syndicators. Investors browse curated commercial real estate deals, review syndicator track records, and connect directly with sponsors to invest. Syndicators list their offerings to reach 7,400+ qualified investors."
  },
  {
    question: "Is EquityMD free for investors?",
    answer: "Yes! EquityMD is completely free for investors. You can browse deals, research syndicators, save favorites, and connect with sponsors at no cost. We only charge syndicators to list their investment opportunities."
  },
  {
    question: "How do I know the syndicators are legitimate?",
    answer: "All syndicators on EquityMD go through a verification process. We display verification badges, track records, years of experience, and total assets under management. We encourage investors to conduct their own due diligence before investing."
  },
  {
    question: "What types of real estate investments are available?",
    answer: "EquityMD features multifamily apartments, commercial properties, industrial warehouses, medical office buildings, retail centers, and other commercial real estate syndications. Most deals offer passive income through quarterly distributions."
  },
  {
    question: "How do I get started investing in real estate syndications?",
    answer: "Create a free account, verify your accredited investor status, then browse available deals. When you find an opportunity that interests you, you can request more information or connect directly with the syndicator to discuss investment terms."
  },
  {
    question: "What is the minimum investment amount?",
    answer: "Minimum investments vary by deal, typically ranging from $25,000 to $100,000. Each listing displays the minimum investment required, expected returns, hold period, and other key terms upfront."
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

export function Home() {
  const { user } = useAuthStore();
  const [featuredDeals, setFeaturedDeals] = useState<Deal[]>([]);
  const [totalDealVolume, setTotalDealVolume] = useState<string>('$450M+');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [useVideo, setUseVideo] = useState(true);
  const [authModalType, setAuthModalType] = useState<'investor' | 'syndicator'>('investor');
  const [authModalView, setAuthModalView] = useState<'sign_in' | 'sign_up'>('sign_up');
  
  useScrollFix();
  
  // Featured investor data - Returns range from 11%-22%
  const featuredInvestors = [
    {
      name: "Sarah",
      title: "Technology Executive",
      company: "",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$275K",
        avgReturn: "14.2%"
      },
      specialties: ["Multi-Family", "Mixed-Use", "Value-Add"],
      location: "San Francisco, CA"
    },
    {
      name: "Michael",
      title: "Business Owner",
      company: "",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$486K",
        avgReturn: "11.8%"
      },
      specialties: ["Multi-Family", "Workforce Housing", "Passive Income"],
      location: "Nashville, TN"
    },
    {
      name: "Jennifer",
      title: "Financial Advisor",
      company: "",
      image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$325K",
        avgReturn: "19.5%"
      },
      specialties: ["Multi-Family", "Student Housing", "Long-term Growth"],
      location: "Miami, FL"
    },
    {
      name: "David",
      title: "Attorney",
      company: "",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$150K",
        avgReturn: "22.1%"
      },
      specialties: ["Multi-Family", "Tax Benefits", "Passive Income"],
      location: "Phoenix, AZ"
    },
    {
      name: "Lisa",
      title: "Healthcare Executive",
      company: "",
      image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$625K",
        avgReturn: "16.7%"
      },
      specialties: ["Multi-Family", "Workforce Housing", "Diversification"],
      location: "Los Angeles, CA"
    },
    {
      name: "James",
      title: "Engineering Consultant",
      company: "",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$195K",
        avgReturn: "13.4%"
      },
      specialties: ["Multi-Family", "Value-Add", "Portfolio Growth"],
      location: "Austin, TX"
    }
  ];

  useEffect(() => {
    fetchFeaturedDeals();
    fetchTotalDealVolume();
  }, []);

  async function fetchFeaturedDeals() {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('status', 'active')
        .order('highlighted', { ascending: false })
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.error('Error fetching featured deals:', error);
        setFeaturedDeals([]);
        return;
      }

      const highlightedDeals = data.filter((deal: any) => deal.highlighted);
      const otherDeals = data.filter((deal: any) => !deal.highlighted);
      const featuredList = [...highlightedDeals, ...otherDeals].slice(0, 6);
      
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

      const total = data.reduce((sum: number, syndicator: any) => {
        return sum + (syndicator.total_deal_volume || 0);
      }, 0);

      if (total >= 1000000000) {
        setTotalDealVolume(`$${(total / 1000000000).toFixed(1)}B+`);
      } else if (total >= 1000000) {
        setTotalDealVolume(`$${Math.floor(total / 1000000)}M+`);
      } else {
        setTotalDealVolume(`$${Math.floor(total / 1000)}K+`);
      }
    } catch (error) {
      console.error('Error calculating total deal volume:', error);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Find Top CRE Deals - Largest Syndication Directory | EquityMD"
        description="EquityMD connects accredited investors with institutional-quality real estate investment opportunities through a curated platform of verified syndicators."
        keywords="CRE deals, syndication directory, accredited investors, real estate syndication, commercial real estate, multifamily investments, verified syndicators"
        canonical="https://equitymd.com"
      />
      
      {/* Activity Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2.5 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="max-w-[1200px] mx-auto relative">
          <div className="flex items-center justify-center gap-2 sm:gap-6 text-sm sm:text-base flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <strong>24+ investors</strong> joined today
            </span>
            <span className="hidden sm:inline text-white/40">•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-yellow-300" />
              <strong>3 new deals</strong> this week
            </span>
            <span className="hidden sm:inline text-white/40">•</span>
            <span className="hidden md:flex items-center gap-1.5">
              <Star className="h-4 w-4 text-yellow-300" />
              <strong>Active marketplace</strong> for accredited investors
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative min-h-[500px] sm:min-h-[580px]">
        <div className="absolute inset-0">
          {useVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              onError={() => setUseVideo(false)}
            >
              <source
                src="https://player.vimeo.com/external/451523650.hd.mp4?s=b7fb7f549263e0f9d5c8674ec12be96b2785fc7d&profile_id=174"
                type="video/mp4"
              />
              <img 
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80"
                alt="Modern Apartment Building"
                className="w-full h-full object-cover"
              />
            </video>
          ) : (
            <img 
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80"
              alt="Modern Apartment Building"
              className="w-full h-full object-cover"
            />
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/80" />
          {/* Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        </div>
        
        <div className="relative z-20">
          <Navbar isTransparent />
          
          <div className="max-w-5xl mx-auto text-center px-4 pt-16 pb-12 sm:pt-20 sm:pb-16 md:pt-24 md:pb-20 safe-area-top">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">Trusted by 7,400+ Accredited Investors</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Your Marketplace to Discover<br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Real Estate Investments
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              A marketplace where accredited investors browse syndication opportunities and syndicators list their offerings.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-2 mb-12">
              <Link 
                to="/find"
                className="group bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl inline-flex items-center justify-center gap-2"
              >
                Find Opportunities
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => {
                  setAuthModalType('investor');
                  setAuthModalView('sign_up');
                  setShowAuthModal(true);
                }}
                className="bg-white/10 backdrop-blur text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/30"
              >
                Get Started Free
              </button>
            </div>
            
            {/* Mini Stats */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-white">$43M+</p>
                <p className="text-white/60 text-sm">Deal Volume</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-white">7,400+</p>
                <p className="text-white/60 text-sm">Investors</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-white">3+</p>
                <p className="text-white/60 text-sm">Syndicators</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 sm:py-24 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              <ShieldCheck className="h-4 w-4" />
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              The Trusted Platform for<br />
              <span className="text-blue-600">Real Estate Syndication</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with verified syndicators and access exclusive investment opportunities
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-blue-200">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Opportunities</h3>
              <p className="text-gray-600 leading-relaxed">
                Every syndication deal undergoes thorough due diligence and verification before listing on our platform.
              </p>
            </div>
            
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-emerald-200">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bell className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">New Deal Alerts</h3>
              <p className="text-gray-600 leading-relaxed">
                Get notified when new deals matching your criteria are listed. Never miss an investment opportunity.
              </p>
            </div>
            
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-purple-200">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mail className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Direct Syndicator Access</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect directly with syndicators. No middlemen, no investor fees, just direct communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Deals Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="max-w-[1200px] mx-auto relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-3">
                <TrendingUp className="h-4 w-4" />
                Featured Deals
              </span>
              <h2 className="text-3xl font-bold text-gray-900">
                Investment Opportunities
              </h2>
              <p className="text-gray-600 mt-2">Curated deals from verified syndicators</p>
            </div>
            {!user ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all border border-gray-200 shadow-sm"
              >
                <Lock className="h-4 w-4" />
                Sign in for details
              </button>
            ) : (
              <Link
                to="/find"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg"
              >
                View All Deals
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
          
          <div className="relative homepage-scroll-section">
            <div className="horizontal-scroll-container pb-4">
              <div className="flex gap-4 md:gap-6" style={{ width: 'max-content' }}>
                {featuredDeals.length > 0 ? (
                  featuredDeals.map((deal, index) => (
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
                  ))
                ) : (
                  <div className="w-full text-center py-12">
                    <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No featured deals available at the moment.</p>
                    <p className="text-gray-400 text-sm mt-2">Check back soon for new investment opportunities.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Gradient Overlays */}
            {featuredDeals.length > 0 && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-100 to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-indigo-100 to-transparent pointer-events-none" />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Current Investors Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
              <Users className="h-4 w-4" />
              Our Community
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Join Successful Investors
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
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        {/* Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="max-w-[1200px] mx-auto relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Platform Statistics</h2>
            <p className="text-blue-100">Trusted by investors and syndicators nationwide</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <p className="text-4xl font-bold text-white mb-2">$43M</p>
              <p className="text-blue-100">Investor Requested Amount</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <p className="text-4xl font-bold text-white mb-2">7,400+</p>
              <p className="text-blue-100">Accredited Investors</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <p className="text-4xl font-bold text-white mb-2">3+</p>
              <p className="text-blue-100">Featured Syndicators</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
        
        <div className="max-w-4xl mx-auto relative">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-10 md:p-16 text-center shadow-2xl border border-slate-700/50">
            {/* Pattern */}
            <div className="absolute inset-0 rounded-3xl bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
            
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Start Your Journey
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Expand Your<br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Investment Portfolio?
                </span>
              </h2>
              <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
                Join EquityMD today to access exclusive real estate syndication opportunities and connect with verified syndicators.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => {
                    setAuthModalType('investor');
                    setAuthModalView('sign_up');
                    setShowAuthModal(true);
                  }}
                  className="group bg-white text-slate-900 text-lg px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-xl inline-flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  to="/find"
                  className="bg-white/10 backdrop-blur text-white text-lg px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/30"
                >
                  Browse Deals
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  No fees for investors
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  Verified syndicators
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  SEC compliant
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section with Schema.org markup for SEO */}
      <div className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-3xl mx-auto px-4">
          <FAQSection 
            title="Frequently Asked Questions"
            faqs={homeFaqs}
          />
        </div>
      </div>

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
