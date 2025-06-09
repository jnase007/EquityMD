import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { PageBanner } from '../../../components/PageBanner';
import { SEO } from '../../../components/SEO';
import { LoadingSkeleton } from '../../../components/LoadingSkeleton';
import { supabase } from '../../../lib/supabase';
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
  BarChart3
} from 'lucide-react';
import Skeleton from 'react-loading-skeleton';

interface StateData {
  id: string;
  name: string;
  median_price: number;
  sales_change: number;
  months_supply: number;
  created_at: string;
}

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

interface StateMarketSkeletonProps {
  count?: number;
}

function StateMarketSkeleton({ count = 6 }: StateMarketSkeletonProps) {
  return (
    <div className="space-y-8">
      {/* State Overview Skeleton */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <Skeleton height={32} width="40%" className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="text-center">
              <Skeleton height={60} width={60} className="mx-auto mb-3 rounded-full" />
              <Skeleton height={20} width="80%" className="mb-2" />
              <Skeleton height={24} width="60%" />
            </div>
          ))}
        </div>
      </div>

      {/* Cities Grid Skeleton */}
      <div>
        <Skeleton height={28} width="30%" className="mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton height={24} width="70%" />
                <Skeleton height={20} width={20} />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton height={16} width="50%" />
                  <Skeleton height={20} width="30%" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton height={16} width="45%" />
                  <Skeleton height={20} width="25%" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton height={16} width="55%" />
                  <Skeleton height={20} width="35%" />
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Skeleton height={32} className="rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StateMarketReport() {
  const { state } = useParams<{ state: string }>();
  const [stateData, setStateData] = useState<StateData | null>(null);
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state) {
      fetchStateData();
    }
  }, [state]);

  const fetchStateData = async () => {
    if (!state) return;

    try {
      setLoading(true);
      setError(null);

      // Convert URL slug back to state name
      const stateName = state
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Fetch state data
      const { data: stateResult, error: stateError } = await supabase
        .from('states')
        .select('*')
        .ilike('name', stateName)
        .single();

      if (stateError) {
        console.error('Error fetching state data:', stateError);
        setError('State not found');
        return;
      }

      setStateData(stateResult);

      // Fetch cities in this state
      const { data: citiesResult, error: citiesError } = await supabase
        .from('cities')
        .select('*')
        .ilike('state', stateName)
        .order('median_price', { ascending: false });

      if (citiesError) {
        console.error('Error fetching cities data:', citiesError);
      } else {
        setCities(citiesResult || []);
      }

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
    if (monthsSupply < 3) return { label: 'Seller\'s Market', color: 'text-red-600' };
    if (monthsSupply < 4) return { label: 'Balanced Market', color: 'text-yellow-600' };
    return { label: 'Buyer\'s Market', color: 'text-green-600' };
  };

  if (loading) {
    return (
      <>
        <SEO 
          title={`${state ? state.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'State'} Market Report | EquityMD`}
          description="Loading state market data..."
        />
        
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <PageBanner
            title="Market Report"
            subtitle="Loading state market data..."
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <StateMarketSkeleton />
          </div>
          <Footer />
        </div>
      </>
    );
  }

  if (error || !stateData) {
    return (
      <>
        <SEO 
          title="State Not Found | EquityMD"
          description="The requested state market report could not be found."
        />
        
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <PageBanner
            title="State Not Found"
            subtitle="The requested market report could not be found"
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">State Not Found</h3>
              <p className="text-gray-600 mb-6">The requested state market report could not be found.</p>
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

  const marketCondition = getMarketCondition(stateData.months_supply);

  return (
    <>
      <SEO 
        title={`${stateData.name} Real Estate Market Report 2025 | EquityMD`}
        description={`Comprehensive ${stateData.name} real estate market data. Median home price: ${formatPrice(stateData.median_price)}, Sales change: ${formatPercentage(stateData.sales_change)}, Market supply: ${stateData.months_supply} months.`}
        keywords={`${stateData.name} real estate market, ${stateData.name} home prices, ${stateData.name} property investment, ${stateData.name} housing market trends, real estate ${stateData.name}`}
      />
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <PageBanner
          title={`${stateData.name} Market Report`}
          subtitle="Real estate market data and investment opportunities"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/resources/market-reports" className="hover:text-blue-600">Market Reports</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">{stateData.name}</span>
          </nav>

          {/* State Overview */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Median Home Price</h3>
                <p className="text-3xl font-bold text-blue-600">{formatPrice(stateData.median_price)}</p>
              </div>
              
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  stateData.sales_change >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {stateData.sales_change >= 0 ? (
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Annual Sales Change</h3>
                <p className={`text-3xl font-bold ${
                  stateData.sales_change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(stateData.sales_change)}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Months of Supply</h3>
                <p className="text-3xl font-bold text-purple-600">{stateData.months_supply}</p>
                <p className={`text-sm font-medium ${marketCondition.color}`}>
                  {marketCondition.label}
                </p>
              </div>
            </div>
          </div>

          {/* Cities in State */}
          {cities.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Major Cities in {stateData.name}</h2>
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="h-4 w-4 mr-1" />
                  {cities.length} cities
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cities.map((city) => (
                  <Link
                    key={city.id}
                    to={`/cities/${city.slug}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {city.name}
                      </h3>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-600">Median Price</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatPrice(city.median_price)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {city.sales_change >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          <span className="text-sm text-gray-600">Sales Change</span>
                        </div>
                        <span className={`font-semibold ${
                          city.sales_change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatPercentage(city.sales_change)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-600">Months Supply</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {city.months_supply} months
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-600 font-medium">View City Details</span>
                        <ChevronRight className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Investment Opportunities CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Explore Investment Opportunities in {stateData.name}</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Discover available real estate deals and connect with verified syndicators operating in {stateData.name}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={`/browse?state=${encodeURIComponent(stateData.name)}`}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                View Deals in {stateData.name}
              </Link>
              <Link
                to="/directory"
                className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors border border-blue-500"
              >
                Find Syndicators
              </Link>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
} 