import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Search,
  BarChart3,
  Home,
  ChevronRight
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

interface MarketStatesSkeletonProps {
  count?: number;
}

function MarketStatesSkeleton({ count = 10 }: MarketStatesSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton height={24} width="60%" />
            <Skeleton height={20} width={60} />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton height={16} width="40%" />
              <Skeleton height={20} width="30%" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton height={16} width="45%" />
              <Skeleton height={20} width="25%" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton height={16} width="50%" />
              <Skeleton height={20} width="35%" />
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Skeleton height={32} className="rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MarketReportsHub() {
  const [states, setStates] = useState<StateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'median_price' | 'sales_change'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchStatesData();
  }, []);

  const fetchStatesData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('states')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching states data:', error);
        return;
      }

      setStates(data || []);
    } catch (error) {
      console.error('Error fetching states data:', error);
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

  const filteredAndSortedStates = states
    .filter(state => 
      state.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'median_price':
          aValue = a.median_price;
          bValue = b.median_price;
          break;
        case 'sales_change':
          aValue = a.sales_change;
          bValue = b.sales_change;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

  const handleSort = (newSortBy: 'name' | 'median_price' | 'sales_change') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  return (
    <>
      <SEO 
        title="Market Reports - Real Estate Investment Data by State | EquityMD"
        description="Comprehensive real estate market data for all 50 states. View median home prices, sales trends, and months of supply to make informed investment decisions."
        keywords="real estate market reports, state housing data, median home prices by state, real estate investment data, housing market trends, property market analysis, real estate statistics"
      />
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <PageBanner
          title="Market Reports"
          subtitle="Comprehensive real estate market data and analysis by state"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Overview Section */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Data</h3>
                <p className="text-gray-600">Updated market data from trusted sources including NAR, Redfin, and Zillow</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All 50 States</h3>
                <p className="text-gray-600">Comprehensive coverage of every state's real estate market conditions</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Investment Insights</h3>
                <p className="text-gray-600">Detailed analysis to help you make informed investment decisions</p>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search states..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSort('name')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    sortBy === 'name' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('median_price')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    sortBy === 'median_price' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Price {sortBy === 'median_price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('sales_change')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    sortBy === 'sales_change' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Change {sortBy === 'sales_change' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>
          </div>

          {/* States Grid */}
          {loading ? (
            <MarketStatesSkeleton count={15} />
          ) : filteredAndSortedStates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No states found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedStates.map((state) => (
                <Link
                  key={state.id}
                  to={`/resources/market-reports/${state.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {state.name}
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
                        {formatPrice(state.median_price)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {state.sales_change >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className="text-sm text-gray-600">Sales Change</span>
                      </div>
                      <span className={`font-semibold ${
                        state.sales_change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(state.sales_change)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">Months Supply</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {state.months_supply} months
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600 font-medium">View Details</span>
                      <ChevronRight className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Investing?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Use our market data to identify the best investment opportunities in your target states. 
              Browse available deals and connect with top syndicators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/browse"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Browse Deals
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