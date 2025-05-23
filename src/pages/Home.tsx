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
      name: "Dr. Sarah Chen",
      title: "Chief Medical Officer",
      company: "Healthcare Ventures LLC",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$2.5M",
        activeDeals: 8,
        avgReturn: "22%"
      },
      specialties: ["Medical", "Multi-Family", "Senior Living"]
    },
    {
      name: "Michael Rodriguez",
      title: "Real Estate Investor",
      company: "Rodriguez Capital",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$1.8M",
        activeDeals: 12,
        avgReturn: "19%"
      },
      specialties: ["Industrial", "Office", "Mixed-Use"]
    },
    {
      name: "Dr. Jennifer Kim",
      title: "Surgeon & Investor",
      image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$3.2M",
        activeDeals: 6,
        avgReturn: "24%"
      },
      specialties: ["Medical", "Student Housing", "Retail"]
    },
    {
      name: "Dr. David Thompson",
      title: "Emergency Medicine",
      company: "Thompson Holdings",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$1.4M",
        activeDeals: 9,
        avgReturn: "21%"
      },
      specialties: ["Multi-Family", "Medical", "Office"]
    },
    {
      name: "Dr. Lisa Patel",
      title: "Cardiologist & Investor",
      company: "Patel Investment Group",
      image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$2.9M",
        activeDeals: 7,
        avgReturn: "26%"
      },
      specialties: ["Medical", "Senior Living", "Mixed-Use"]
    },
    {
      name: "Dr. James Wilson",
      title: "Orthopedic Surgeon",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300&h=300",
      portfolio: {
        totalInvested: "$1.6M",
        activeDeals: 5,
        avgReturn: "18%"
      },
      specialties: ["Medical", "Industrial", "Self-Storage"]
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
        return;
      }

      setFeaturedDeals(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  }

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
              Join a community of successful medical professionals and real estate investors building wealth through strategic property investments.
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