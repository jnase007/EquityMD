import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { AuthModal } from '../components/AuthModal';
import { supabase } from '../lib/supabase';
import { MapPin, TrendingUp, Star, DollarSign, Target, ArrowRight, Building, Percent } from 'lucide-react';

interface City {
  id: string;
  name: string;
  slug: string;
  market_trends: string;
  investment_tips: string;
}

interface Deal {
  id: string;
  title: string;
  location: string;
  price: number;
  cap_rate: number;
  image_url: string;
  property_type: string;
  units: number;
  created_at: string;
}

export function CityDeals() {
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();
  const [cityData, setCityData] = useState<City | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (city) {
      fetchCityData();
    }
  }, [city]);

  const fetchCityData = async () => {
    if (!city) return;
    
    setLoading(true);
    setError(null);

    try {
      // Fetch city data
      const { data: cityData, error: cityError } = await supabase
        .from('cities')
        .select('*')
        .eq('slug', city)
        .single();

      if (cityError) {
        console.error('Error fetching city:', cityError);
        setError('City not found');
        return;
      }

      setCityData(cityData);

      // Fetch deals for this city (from existing deals table)
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .ilike('location', `%${cityData.name.split(',')[0]}%`) // Match city name
        .eq('status', 'active')
        .order('cap_rate', { ascending: false })
        .limit(5);

      if (dealsError) {
        console.error('Error fetching deals:', dealsError);
      }

      // If no real deals, use mock data for demonstration
      const mockDeals: Deal[] = [
        {
          id: '1',
          title: `${cityData.name.split(',')[0]} Heights Apartments`,
          location: cityData.name,
          price: 2850000,
          cap_rate: 7.2,
          image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80',
          property_type: 'Multi-Family',
          units: 48,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: `Downtown ${cityData.name.split(',')[0]} Residences`,
          location: cityData.name,
          price: 4200000,
          cap_rate: 6.8,
          image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80',
          property_type: 'Multi-Family',
          units: 72,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          title: `${cityData.name.split(',')[0]} Garden Communities`,
          location: cityData.name,
          price: 1950000,
          cap_rate: 7.8,
          image_url: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&q=80',
          property_type: 'Multi-Family',
          units: 36,
          created_at: new Date().toISOString()
        },
        {
          id: '4',
          title: `Metro ${cityData.name.split(',')[0]} Complex`,
          location: cityData.name,
          price: 5650000,
          cap_rate: 6.5,
          image_url: 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&q=80',
          property_type: 'Multi-Family',
          units: 96,
          created_at: new Date().toISOString()
        },
        {
          id: '5',
          title: `${cityData.name.split(',')[0]} Waterfront Towers`,
          location: cityData.name,
          price: 8250000,
          cap_rate: 6.2,
          image_url: 'https://images.unsplash.com/photo-1577979749830-f1d742b96791?auto=format&fit=crop&q=80',
          property_type: 'Multi-Family',
          units: 144,
          created_at: new Date().toISOString()
        }
      ];

      setDeals(dealsData && dealsData.length > 0 ? dealsData : mockDeals);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load city data');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  const generateSEO = () => {
    if (!cityData) return {};
    
    const cityName = cityData.name.split(',')[0];
    return {
      title: `Best Multifamily Investment Deals in ${cityName} 2025 | EquityMD`,
      description: `Discover AI-driven multifamily deals in ${cityName} with EquityMD. Explore high-cap-rate properties, market trends, and investment opportunities in ${cityData.name}. Start investing today.`,
      keywords: `${cityName} multifamily investments, ${cityName} real estate deals, ${cityName} cap rates, ${cityName} rental properties, commercial real estate ${cityName}`,
      canonical: `https://equitymd.com/deals/${city}`
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="w-3/4 h-8 bg-white/20 rounded mb-4 animate-pulse"></div>
            <div className="w-1/2 h-6 bg-white/20 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 py-16">
          <LoadingSkeleton type="property" count={5} />
        </div>

        <Footer />
      </div>
    );
  }

  if (error || !cityData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">City Not Found</h1>
          <p className="text-gray-600 mb-8">
            The city you're looking for doesn't exist in our database.
          </p>
          <button
            onClick={() => navigate('/find')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Browse All Deals
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const seoData = generateSEO();
  const cityName = cityData.name.split(',')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical={seoData.canonical}
      />
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center mb-4">
            <MapPin className="h-6 w-6 mr-2" />
            <span className="text-blue-200">{cityData.name}</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Premium Multifamily Deals in {cityName}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Discover AI-curated investment opportunities in one of America's fastest-growing markets. 
            Access exclusive multifamily deals with superior cap rates and appreciation potential.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-16">
        {/* Introduction */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Invest in {cityName}?
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            {cityName} represents one of the most compelling multifamily investment markets in 2025. 
            With strong job growth, population expansion, and favorable demographics, the city offers 
            exceptional opportunities for both value-add renovations and stabilized cash flow properties. 
            Our AI-driven analysis identifies the highest-potential deals based on location, cap rates, 
            renovation opportunity, and long-term appreciation prospects.
          </p>
        </div>

        {/* Featured Deals */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Investment Opportunities</h2>
            <span className="text-sm text-gray-600">Sorted by Cap Rate</span>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <div key={deal.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="relative h-48">
                  <img
                    src={deal.image_url}
                    alt={deal.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-2 py-1 rounded text-sm font-semibold">
                    {deal.cap_rate}% Cap
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">{deal.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{deal.location}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Price</div>
                      <div className="font-semibold text-green-600">{formatPrice(deal.price)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Units</div>
                      <div className="font-semibold">{deal.units}</div>
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                    View Details
                  </button>
                </div>

                {/* Schema.org LocalBusiness markup */}
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "LocalBusiness",
                      "name": deal.title,
                      "address": {
                        "@type": "PostalAddress",
                        "addressLocality": cityName,
                        "addressRegion": cityData.name.split(', ')[1]
                      },
                      "offers": {
                        "@type": "Offer",
                        "price": deal.price,
                        "priceCurrency": "USD"
                      }
                    })
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Market Trends */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold">Market Trends</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">{cityData.market_trends}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center mb-4">
              <Target className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-xl font-bold">Investment Tips</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">{cityData.investment_tips}</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-white mb-16">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">{deals.length}</div>
              <div className="text-green-100">Available Deals</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">
                {deals.length > 0 ? `${Math.max(...deals.map(d => d.cap_rate))}%` : '0%'}
              </div>
              <div className="text-green-100">Highest Cap Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">
                {deals.reduce((sum, deal) => sum + deal.units, 0)}
              </div>
              <div className="text-green-100">Total Units</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">
                {formatPrice(deals.reduce((sum, deal) => sum + deal.price, 0))}
              </div>
              <div className="text-green-100">Total Volume</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gray-100 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Invest in {cityName}?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of accredited investors accessing exclusive multifamily deals 
            with superior returns and professional management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/find')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
            >
              View All Deals
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      <Footer />
      
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          defaultType="investor"
          defaultView="sign_up"
        />
      )}
    </div>
  );
} 