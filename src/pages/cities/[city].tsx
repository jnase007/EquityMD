import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageBanner } from '../../components/PageBanner';
import { SEO } from '../../components/SEO';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { supabase } from '../../lib/supabase';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  MapPin,
  ArrowLeft,
  Building2,
  Users,
  ChevronRight,
  BarChart3,
  Target,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import Skeleton from 'react-loading-skeleton';

interface CityData {
  id: string;
  name: string;
  state: string;
  slug: string;
  median_price: number;
  sales_change: number;
  months_supply: number;
  market_trends: string;
  investment_tips: string;
  created_at: string;
}

interface CityMarketSkeletonProps {
  count?: number;
}

function CityMarketSkeleton() {
  return (
    <div className="space-y-8">
      {/* City Overview Skeleton */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <Skeleton height={32} width="50%" className="mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="text-center">
              <Skeleton height={60} width={60} className="mx-auto mb-3 rounded-full" />
              <Skeleton height={20} width="80%" className="mb-2" />
              <Skeleton height={24} width="60%" />
            </div>
          ))}
        </div>
      </div>

      {/* Market Analysis Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <Skeleton height={28} width="40%" className="mb-4" />
          <Skeleton height={16} count={8} className="mb-2" />
        </div>
        <div className="bg-white rounded-lg shadow-md p-8">
          <Skeleton height={28} width="40%" className="mb-4" />
          <Skeleton height={16} count={8} className="mb-2" />
        </div>
      </div>

      {/* CTA Skeleton */}
      <div className="bg-gray-100 rounded-lg p-8">
        <Skeleton height={32} width="60%" className="mb-4" />
        <Skeleton height={16} width="80%" className="mb-6" />
        <div className="flex gap-4">
          <Skeleton height={48} width={150} className="rounded-lg" />
          <Skeleton height={48} width={150} className="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function CityMarketReport() {
  const { city } = useParams<{ city: string }>();
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (city) {
      fetchCityData();
    }
  }, [city]);

  const fetchCityData = async () => {
    if (!city) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch city data by slug
      const { data: cityResult, error: cityError } = await supabase
        .from('cities')
        .select('*')
        .eq('slug', city)
        .single();

      if (cityError) {
        console.error('Error fetching city data:', cityError);
        setError('City not found');
        return;
      }

      setCityData(cityResult);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getMarketCondition = (monthsSupply: number) => {
    if (monthsSupply < 3) return { label: 'Seller\'s Market', color: 'text-red-600', bg: 'bg-red-100' };
    if (monthsSupply < 4) return { label: 'Balanced Market', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Buyer\'s Market', color: 'text-green-600', bg: 'bg-green-100' };
  };

  if (loading) {
    return (
      <>
        <SEO 
          title={`${city ? city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'City'} Market Report | EquityMD`}
          description="Loading city market data..."
        />
        
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <PageBanner
            title="City Market Report"
            subtitle="Loading city market data..."
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <CityMarketSkeleton />
          </div>
          <Footer />
        </div>
      </>
    );
  }

  if (error || !cityData) {
    return (
      <>
        <SEO 
          title="City Not Found | EquityMD"
          description="The requested city market report could not be found."
        />
        
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <PageBanner
            title="City Not Found"
            subtitle="The requested market report could not be found"
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">City Not Found</h3>
              <p className="text-gray-600 mb-6">The requested city market report could not be found.</p>
              <Link
                to="/resources/market-reports"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Market Reports
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  const marketCondition = getMarketCondition(cityData.months_supply);

  return (
    <>
      <SEO 
        title={`${cityData.name} Real Estate Market Report 2025 | EquityMD`}
        description={`Comprehensive ${cityData.name} real estate market analysis. Median home price: ${formatPrice(cityData.median_price)}, Sales change: ${formatPercentage(cityData.sales_change)}, Market supply: ${cityData.months_supply} months. Investment insights and market trends.`}
        keywords={`${cityData.name} real estate market, ${cityData.name} home prices, ${cityData.name} property investment, ${cityData.name} housing market trends, real estate ${cityData.name}, ${cityData.state} real estate`}
      />
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <PageBanner
          title={`${cityData.name} Market Report`}
          subtitle={`Real estate market analysis and investment opportunities in ${cityData.state}`}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/resources/market-reports" className="hover:text-blue-600">Market Reports</Link>
            <ChevronRight className="h-4 w-4" />
            <Link 
              to={`/resources/market-reports/${cityData.state.toLowerCase().replace(/\s+/g, '-')}`}
              className="hover:text-blue-600"
            >
              {cityData.state}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">{cityData.name}</span>
          </nav>

          {/* City Overview */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Market Overview</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${marketCondition.bg} ${marketCondition.color}`}>
                {marketCondition.label}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Median Home Price</h3>
                <p className="text-3xl font-bold text-blue-600">{formatPrice(cityData.median_price)}</p>
                <p className="text-sm text-gray-600 mt-1">Per unit average</p>
              </div>
              
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  cityData.sales_change >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {cityData.sales_change >= 0 ? (
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Annual Sales Change</h3>
                <p className={`text-3xl font-bold ${
                  cityData.sales_change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(cityData.sales_change)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Year over year</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Months of Supply</h3>
                <p className="text-3xl font-bold text-purple-600">{cityData.months_supply}</p>
                <p className="text-sm text-gray-600 mt-1">Current inventory</p>
              </div>
            </div>
          </div>

          {/* Market Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Market Trends */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Market Trends</h3>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {cityData.market_trends}
                </p>
              </div>
            </div>

            {/* Investment Tips */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Lightbulb className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Investment Tips</h3>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {cityData.investment_tips}
                </p>
              </div>
            </div>
          </div>

          {/* Schema.org Structured Data for RealEstateListing */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateListing",
              "name": `${cityData.name} Real Estate Market Report`,
              "description": `Comprehensive real estate market analysis for ${cityData.name}, ${cityData.state}`,
              "address": {
                "@type": "PostalAddress",
                "addressLocality": cityData.name,
                "addressRegion": cityData.state,
                "addressCountry": "US"
              },
              "price": {
                "@type": "MonetaryAmount",
                "currency": "USD",
                "value": cityData.median_price
              },
              "datePosted": cityData.created_at,
              "url": `https://equitymd.com/cities/${cityData.slug}`,
              "provider": {
                "@type": "Organization",
                "name": "EquityMD",
                "url": "https://equitymd.com"
              }
            })}
          </script>

          {/* Investment Opportunities CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Invest in {cityData.name}?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Explore available real estate deals in {cityData.name} and connect with verified syndicators 
              who specialize in this market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={`/browse?city=${encodeURIComponent(cityData.name)}`}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
              >
                <Building2 className="h-5 w-5 mr-2" />
                View Deals in {cityData.name}
              </Link>
              <Link
                to={`/resources/market-reports/${cityData.state.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors border border-blue-500 inline-flex items-center justify-center"
              >
                <MapPin className="h-5 w-5 mr-2" />
                View {cityData.state} Report
              </Link>
            </div>
          </div>

          {/* Related Resources */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Related Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/resources/investment-calculator"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">Investment Calculator</h4>
                  <p className="text-sm text-gray-600">Calculate potential returns</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 ml-auto group-hover:text-blue-600" />
              </Link>

              <Link
                to="/resources/due-diligence"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">Due Diligence Guide</h4>
                  <p className="text-sm text-gray-600">Research best practices</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 ml-auto group-hover:text-blue-600" />
              </Link>

              <Link
                to="/directory"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-200">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">Syndicator Directory</h4>
                  <p className="text-sm text-gray-600">Find verified partners</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 ml-auto group-hover:text-blue-600" />
              </Link>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
} 