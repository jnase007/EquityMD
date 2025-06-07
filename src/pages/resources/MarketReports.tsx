import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageBanner } from '../../components/PageBanner';
import { SEO } from '../../components/SEO';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import Skeleton from 'react-loading-skeleton';
import { Search, Building2, TrendingUp, DollarSign, ChevronRight, ArrowUpRight, MapPin, BarChart, Star, ArrowLeft } from 'lucide-react';

interface MarketReport {
  state: string;
  overview: string;
  keyMetrics: {
    population_growth: string;
    job_growth: string;
    price_appreciation: string;
    cap_rates: string;
  };
  topMarkets: {
    name: string;
    highlights: string[];
    score: number;
  }[];
  trends: string[];
  propertyTypes: {
    type: string;
    outlook: string;
    score: number;
  }[];
  image: string;
  thumbnail: string;
  imageFallback: string;
  thumbnailFallback: string;
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

// Function to get state image from Supabase storage with optimized parameters
const getStateImage = (state: string, size: 'thumb' | 'full' = 'full'): string => {
  const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/states`;
  
  // Map state names to their corresponding image filenames
  const stateImageMap: { [key: string]: string } = {
    'Alabama': 'Alabama.jpg',
    'Alaska': 'Alaska.jpg',
    'Arizona': 'Arizona.jpg',
    'Arkansas': 'Arkansas.jpg',
    'California': 'California.jpg',
    'Colorado': 'Colorado.jpg',
    'Connecticut': 'Connecticut.jpg',
    'Delaware': 'Delaware.jpg',
    'Florida': 'Florida.jpg',
    'Georgia': 'Georgia.jpg',
    'Hawaii': 'Hawaii.jpg',
    'Idaho': 'Idaho.jpg',
    'Illinois': 'Illinois.jpg',
    'Indiana': 'Indiana.jpg',
    'Iowa': 'Iowa.jpg',
    'Kansas': 'Kansas.jpg',
    'Kentucky': 'Kentucky.jpg',
    'Louisiana': 'Louisiana.jpg',
    'Maine': 'Maine.jpg',
    'Maryland': 'Maryland.jpg',
    'Massachusetts': 'Massachusetts.jpg',
    'Michigan': 'Michigan.jpg',
    'Minnesota': 'Minnesota.jpg',
    'Mississippi': 'Mississippi.jpg',
    'Missouri': 'Missouri.jpg',
    'Montana': 'Montana.jpg',
    'Nebraska': 'Nebraska.jpg',
    'Nevada': 'Nevada.jpg',
    'New Hampshire': 'NewHampshire.jpg',
    'New Jersey': 'NewJersey.jpg',
    'New Mexico': 'NewMexico.jpg',
    'New York': 'NewYork.jpg',
    'North Carolina': 'NorthCarolina.jpg',
    'North Dakota': 'NorthDakota.jpg',
    'Ohio': 'Ohio.jpg',
    'Oklahoma': 'Oklahoma.jpg',
    'Oregon': 'Oregon.jpg',
    'Pennsylvania': 'Pennsylvania.jpg',
    'Rhode Island': 'RhodeIsland.jpg',
    'South Carolina': 'SouthCarolina.jpg',
    'South Dakota': 'SouthDakota.jpg',
    'Tennessee': 'Tennessee.jpg',
    'Texas': 'Texas.jpg',
    'Utah': 'Utah.jpg',
    'Vermont': 'Vermont.jpg',
    'Virginia': 'Virginia.jpg',
    'Washington': 'Washington.jpg',
    'West Virginia': 'WestVirginia.jpg',
    'Wisconsin': 'Wisconsin.jpg',
    'Wyoming': 'Wyoming.jpg'
  };
  
  const filename = stateImageMap[state];
  if (!filename) return defaultStateImage;
  
  // Optimized transformation parameters for much better performance
  const params = size === 'thumb' 
    ? '?width=300&height=200&resize=cover&quality=70&format=webp'
    : '?width=600&height=400&resize=cover&quality=75&format=webp';
  
  return `${baseUrl}/${filename}${params}`;
};

// Fallback function for browsers that don't support WebP
const getStateImageFallback = (state: string, size: 'thumb' | 'full' = 'full'): string => {
  const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/states`;
  
  const stateImageMap: { [key: string]: string } = {
    'Alabama': 'Alabama.jpg',
    'Alaska': 'Alaska.jpg',
    'Arizona': 'Arizona.jpg',
    'Arkansas': 'Arkansas.jpg',
    'California': 'California.jpg',
    'Colorado': 'Colorado.jpg',
    'Connecticut': 'Connecticut.jpg',
    'Delaware': 'Delaware.jpg',
    'Florida': 'Florida.jpg',
    'Georgia': 'Georgia.jpg',
    'Hawaii': 'Hawaii.jpg',
    'Idaho': 'Idaho.jpg',
    'Illinois': 'Illinois.jpg',
    'Indiana': 'Indiana.jpg',
    'Iowa': 'Iowa.jpg',
    'Kansas': 'Kansas.jpg',
    'Kentucky': 'Kentucky.jpg',
    'Louisiana': 'Louisiana.jpg',
    'Maine': 'Maine.jpg',
    'Maryland': 'Maryland.jpg',
    'Massachusetts': 'Massachusetts.jpg',
    'Michigan': 'Michigan.jpg',
    'Minnesota': 'Minnesota.jpg',
    'Mississippi': 'Mississippi.jpg',
    'Missouri': 'Missouri.jpg',
    'Montana': 'Montana.jpg',
    'Nebraska': 'Nebraska.jpg',
    'Nevada': 'Nevada.jpg',
    'New Hampshire': 'NewHampshire.jpg',
    'New Jersey': 'NewJersey.jpg',
    'New Mexico': 'NewMexico.jpg',
    'New York': 'NewYork.jpg',
    'North Carolina': 'NorthCarolina.jpg',
    'North Dakota': 'NorthDakota.jpg',
    'Ohio': 'Ohio.jpg',
    'Oklahoma': 'Oklahoma.jpg',
    'Oregon': 'Oregon.jpg',
    'Pennsylvania': 'Pennsylvania.jpg',
    'Rhode Island': 'RhodeIsland.jpg',
    'South Carolina': 'SouthCarolina.jpg',
    'South Dakota': 'SouthDakota.jpg',
    'Tennessee': 'Tennessee.jpg',
    'Texas': 'Texas.jpg',
    'Utah': 'Utah.jpg',
    'Vermont': 'Vermont.jpg',
    'Virginia': 'Virginia.jpg',
    'Washington': 'Washington.jpg',
    'West Virginia': 'WestVirginia.jpg',
    'Wisconsin': 'Wisconsin.jpg',
    'Wyoming': 'Wyoming.jpg'
  };
  
  const filename = stateImageMap[state];
  if (!filename) return defaultStateImage;
  
  // JPEG fallback with aggressive compression
  const params = size === 'thumb' 
    ? '?width=300&height=200&resize=cover&quality=60'
    : '?width=600&height=400&resize=cover&quality=65';
  
  return `${baseUrl}/${filename}${params}`;
};

// Generate optimized image URLs with WebP support and fallbacks
const stateImages: { [key: string]: string } = {};
const stateImagesThumbs: { [key: string]: string } = {};
const stateImagesFallback: { [key: string]: string } = {};
const stateImagesThumbsFallback: { [key: string]: string } = {};

US_STATES.forEach(state => {
  stateImages[state] = getStateImage(state, 'full');
  stateImagesThumbs[state] = getStateImage(state, 'thumb');
  stateImagesFallback[state] = getStateImageFallback(state, 'full');
  stateImagesThumbsFallback[state] = getStateImageFallback(state, 'thumb');
});

const defaultStateImage = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80';

// Generate state-specific SEO metadata
const getStateSEO = (state: string, report?: MarketReport) => {
  const stateSlug = state.toLowerCase().replace(/\s+/g, '-');
  
  const title = `${state} Real Estate Market Report 2024 | Commercial Property Investment Analysis - EquityMD`;
  const description = report 
    ? `Comprehensive ${state} real estate market analysis. Population growth: ${report.keyMetrics.population_growth}, job growth: ${report.keyMetrics.job_growth}. ${report.topMarkets.length} top markets analyzed. Investment opportunities and trends for commercial real estate syndicators and accredited investors.`
    : `Detailed ${state} commercial real estate market report and investment analysis. Market trends, cap rates, growth metrics, and investment opportunities for accredited investors and syndicators on EquityMD.com.`;
  
  const keywords = [
    `${state} real estate market`,
    `${state} commercial real estate`,
    `${state} investment properties`,
    `${state} cap rates`,
    `${state} real estate trends`,
    `${state} multifamily investments`,
    `${state} commercial property investment`,
    `${state} real estate syndication`,
    `${state} accredited investor opportunities`,
    `${state} CRE market analysis`,
    'commercial real estate reports',
    'real estate market data',
    'investment property analysis',
    'CRE investment opportunities'
  ].join(', ');
  
  const canonical = `https://equitymd.com/resources/market-reports/${stateSlug}`;
  
  return { title, description, keywords, canonical };
};

const generateStateReport = (state: string): MarketReport => {
  const populationGrowth = (Math.random() * 3 + 0.5).toFixed(1);
  const jobGrowth = (Math.random() * 4 + 1).toFixed(1);
  const priceAppreciation = (Math.random() * 15 + 5).toFixed(1);
  const capRates = (Math.random() * 2 + 4).toFixed(1);
  const score = Math.floor(Math.random() * 15 + 80);

  const stateCities: { [key: string]: string[] } = {
    'Alabama': ['Birmingham', 'Huntsville', 'Mobile'],
    'Alaska': ['Anchorage', 'Fairbanks', 'Juneau'],
    'Arizona': ['Phoenix', 'Tucson', 'Scottsdale'],
    'Arkansas': ['Little Rock', 'Fayetteville', 'Fort Smith'],
    'California': ['Los Angeles', 'San Francisco', 'San Diego'],
    'Colorado': ['Denver', 'Colorado Springs', 'Boulder'],
    'Connecticut': ['Hartford', 'New Haven', 'Stamford'],
    'Delaware': ['Wilmington', 'Dover', 'Newark'],
    'Florida': ['Miami', 'Orlando', 'Tampa'],
    'Georgia': ['Atlanta', 'Savannah', 'Augusta'],
    'Hawaii': ['Honolulu', 'Kailua', 'Hilo'],
    'Idaho': ['Boise', 'Meridian', 'Nampa'],
    'Illinois': ['Chicago', 'Aurora', 'Rockford'],
    'Indiana': ['Indianapolis', 'Fort Wayne', 'Evansville'],
    'Iowa': ['Des Moines', 'Cedar Rapids', 'Davenport'],
    'Kansas': ['Wichita', 'Overland Park', 'Kansas City'],
    'Kentucky': ['Louisville', 'Lexington', 'Bowling Green'],
    'Louisiana': ['New Orleans', 'Baton Rouge', 'Shreveport'],
    'Maine': ['Portland', 'Lewiston', 'Bangor'],
    'Maryland': ['Baltimore', 'Columbia', 'Annapolis'],
    'Massachusetts': ['Boston', 'Worcester', 'Springfield'],
    'Michigan': ['Detroit', 'Grand Rapids', 'Ann Arbor'],
    'Minnesota': ['Minneapolis', 'St. Paul', 'Rochester'],
    'Mississippi': ['Jackson', 'Gulfport', 'Southaven'],
    'Missouri': ['Kansas City', 'St. Louis', 'Springfield'],
    'Montana': ['Billings', 'Missoula', 'Great Falls'],
    'Nebraska': ['Omaha', 'Lincoln', 'Bellevue'],
    'Nevada': ['Las Vegas', 'Reno', 'Henderson'],
    'New Hampshire': ['Manchester', 'Nashua', 'Concord'],
    'New Jersey': ['Newark', 'Jersey City', 'Paterson'],
    'New Mexico': ['Albuquerque', 'Las Cruces', 'Santa Fe'],
    'New York': ['New York City', 'Buffalo', 'Rochester'],
    'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro'],
    'North Dakota': ['Fargo', 'Bismarck', 'Grand Forks'],
    'Ohio': ['Columbus', 'Cleveland', 'Cincinnati'],
    'Oklahoma': ['Oklahoma City', 'Tulsa', 'Norman'],
    'Oregon': ['Portland', 'Eugene', 'Salem'],
    'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Allentown'],
    'Rhode Island': ['Providence', 'Warwick', 'Cranston'],
    'South Carolina': ['Columbia', 'Charleston', 'Greenville'],
    'South Dakota': ['Sioux Falls', 'Rapid City', 'Aberdeen'],
    'Tennessee': ['Nashville', 'Memphis', 'Knoxville'],
    'Texas': ['Houston', 'Dallas', 'Austin'],
    'Utah': ['Salt Lake City', 'West Valley City', 'Provo'],
    'Vermont': ['Burlington', 'South Burlington', 'Rutland'],
    'Virginia': ['Virginia Beach', 'Richmond', 'Norfolk'],
    'Washington': ['Seattle', 'Spokane', 'Tacoma'],
    'West Virginia': ['Charleston', 'Huntington', 'Morgantown'],
    'Wisconsin': ['Milwaukee', 'Madison', 'Green Bay'],
    'Wyoming': ['Cheyenne', 'Casper', 'Laramie']
  };

  const cities = stateCities[state] || ['Major City 1', 'Major City 2', 'Major City 3'];

  return {
    state,
    overview: `${state} shows strong market fundamentals with ${populationGrowth}% population growth and diverse economic drivers across major metropolitan areas. The state's real estate market demonstrates resilience with steady appreciation and attractive investment opportunities across multiple property types.`,
    keyMetrics: {
      population_growth: `+${populationGrowth}%`,
      job_growth: `+${jobGrowth}%`,
      price_appreciation: `+${priceAppreciation}%`,
      cap_rates: `${capRates}%`
    },
    topMarkets: cities.map((city, index) => ({
      name: city,
      highlights: [
        `Strong ${Math.random() > 0.5 ? 'population' : 'economic'} growth`,
        `${Math.random() > 0.5 ? 'Expanding' : 'Diverse'} job market`,
        `${Math.random() > 0.5 ? 'High' : 'Growing'} demand for quality properties`
      ],
      score: Math.floor(Math.random() * 10 + 85)
    })),
    trends: [
      `Increasing demand for ${Math.random() > 0.5 ? 'multi-family' : 'mixed-use'} properties`,
      `Strong ${Math.random() > 0.5 ? 'tech sector' : 'healthcare industry'} growth`,
      `Rising interest in ${Math.random() > 0.5 ? 'sustainable' : 'smart'} buildings`
    ],
    propertyTypes: [
      {
        type: 'Multi-Family',
        outlook: 'Strong demand driven by population growth and urbanization',
        score: Math.floor(Math.random() * 10 + 85)
      },
      {
        type: Math.random() > 0.5 ? 'Office' : 'Industrial',
        outlook: `${Math.random() > 0.5 ? 'Recovering' : 'Expanding'} market with opportunities in prime locations`,
        score: Math.floor(Math.random() * 10 + 80)
      }
    ],
    image: stateImages[state] || defaultStateImage,
    thumbnail: stateImagesThumbs[state] || defaultStateImage,
    imageFallback: stateImagesFallback[state] || defaultStateImage,
    thumbnailFallback: stateImagesThumbsFallback[state] || defaultStateImage
  };
};

const marketReports: MarketReport[] = US_STATES.map(state => generateStateReport(state));

// Optimized image component with WebP support and fallbacks
interface OptimizedImageProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  onLoadStart?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  fallbackSrc,
  alt,
  className = '',
  loading = 'lazy',
  onLoad,
  onError,
  onLoadStart
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (!imageError) {
      setImageError(true);
      onError?.();
    }
  };

  const handleLoadStart = () => {
    onLoadStart?.();
  };

  return (
    <picture>
      {!imageError && (
        <source srcSet={src} type="image/webp" />
      )}
      <img
        src={imageError ? fallbackSrc : src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        onLoadStart={handleLoadStart}
        style={{ backgroundColor: '#f3f4f6' }}
      />
    </picture>
  );
};

export function MarketReports() {
  const { state: stateParam } = useParams<{ state: string }>();
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredReports, setFilteredReports] = useState<MarketReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle URL parameter for state
  useEffect(() => {
    if (stateParam) {
      const stateFromUrl = stateParam.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const matchingReport = marketReports.find(report => 
        report.state.toLowerCase() === stateFromUrl.toLowerCase()
      );
      if (matchingReport) {
        setSelectedState(matchingReport.state);
        setSearchTerm(matchingReport.state);
      }
    }
  }, [stateParam]);

  // Initialize data with loading state
  useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    const timer = setTimeout(() => {
      setFilteredReports(marketReports);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleImageLoad = (state: string) => {
    setImagesLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(state);
      return newSet;
    });
  };

  const handleImageStart = (state: string) => {
    setImagesLoading(prev => new Set(prev).add(state));
  };

  useEffect(() => {
    const searchTermLower = searchTerm.toLowerCase();
    
    const filtered = marketReports.filter(report => {
      const stateMatch = report.state.toLowerCase().includes(searchTermLower);
      const cityMatch = report.topMarkets.some(market => 
        market.name.toLowerCase().includes(searchTermLower)
      );
      const overviewMatch = report.overview.toLowerCase().includes(searchTermLower);
      
      return stateMatch || cityMatch || overviewMatch;
    });
    
    setFilteredReports(filtered);

    if (searchTerm) {
      const stateSuggestions = US_STATES.filter(state =>
        state.toLowerCase().includes(searchTermLower)
      );
      setSuggestions(stateSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!e.target.value) {
      setSelectedState(null);
    }
  };

  const handleSuggestionClick = (state: string) => {
    setSearchTerm(state);
    setSelectedState(state);
    setShowSuggestions(false);
    // Navigate to state-specific URL
    const stateSlug = state.toLowerCase().replace(/\s+/g, '-');
    navigate(`/resources/market-reports/${stateSlug}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchTermLower = searchTerm.toLowerCase();
    const matchingState = marketReports.find(
      report => report.state.toLowerCase() === searchTermLower
    );
    if (matchingState) {
      setSelectedState(matchingState.state);
      const stateSlug = matchingState.state.toLowerCase().replace(/\s+/g, '-');
      navigate(`/resources/market-reports/${stateSlug}`);
    }
    setShowSuggestions(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <PageBanner 
          title="Market Research & Analysis"
          subtitle="In-depth analysis of key real estate markets across the United States"
        >
          <div className="max-w-3xl mx-auto mt-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by state..."
                className="w-full pl-10 pr-20 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/70"
                disabled
              />
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-white/20 text-white rounded-md"
                disabled
              >
                Search
              </button>
            </div>
          </div>
        </PageBanner>

        <div className="max-w-[1200px] mx-auto px-4 py-16">
          <LoadingSkeleton type="property" count={6} />
        </div>

        <Footer />
      </div>
    );
  }

  const currentReport = selectedState ? filteredReports.find(r => r.state === selectedState) : undefined;
  const seoData = selectedState ? getStateSEO(selectedState, currentReport) : {
    title: "Commercial Real Estate Market Reports & Analysis | EquityMD",
    description: "Access comprehensive commercial real estate market reports and investment analysis for major US markets. Get insights on cap rates, growth trends, and investment opportunities for accredited investors.",
    keywords: "commercial real estate market reports, CRE market analysis, real estate investment analysis, cap rates, commercial property trends, multifamily market data, real estate syndication opportunities",
    canonical: "https://equitymd.com/resources/market-reports"
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical={seoData.canonical}
      />
      <Navbar />

      <PageBanner 
        title="Market Research & Analysis"
        subtitle="In-depth analysis of key real estate markets across the United States"
      >
        <div className="max-w-3xl mx-auto mt-8">
          <div ref={searchRef} className="relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by state..."
                className="w-full pl-10 pr-20 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/70"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors"
              >
                Search
              </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-auto">
                {suggestions.map((state, index) => (
                  <button
                    key={state}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                      index === 0 ? 'rounded-t-lg' : ''
                    } ${index === suggestions.length - 1 ? 'rounded-b-lg' : ''}`}
                    onClick={() => handleSuggestionClick(state)}
                  >
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{state}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageBanner>

      <div className="max-w-[1200px] mx-auto px-4 py-16">
        {selectedState ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="mb-6">
              <button
                onClick={() => {
                  setSelectedState(null);
                  setSearchTerm('');
                  navigate('/resources/market-reports');
                }}
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Reports
              </button>
            </div>
            {filteredReports.map(report => report.state === selectedState && (
              <div key={report.state}>
                <div className="relative h-64 mb-8 rounded-lg overflow-hidden bg-gray-200">
                  {imagesLoading.has(report.state) && (
                    <div className="absolute inset-0 z-10">
                      <Skeleton height="100%" className="!rounded-lg" />
                    </div>
                  )}
                  <OptimizedImage
                    src={report.image}
                    fallbackSrc={report.imageFallback}
                    alt={`${report.state} skyline`}
                    className="w-full h-full object-cover"
                    loading="eager"
                    onLoadStart={() => handleImageStart(report.state)}
                    onLoad={() => handleImageLoad(report.state)}
                    onError={() => handleImageLoad(report.state)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <h2 className="text-3xl font-bold text-white mb-2">{report.state}</h2>
                    <div className="flex items-center text-white/80">
                      <MapPin className="h-5 w-5 mr-2" />
                      {report.topMarkets.map(m => m.name).join(' • ')}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-8">{report.overview}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div>
                    <div className="text-sm text-gray-500">Population Growth</div>
                    <div className="text-xl font-bold text-green-600">{report.keyMetrics.population_growth}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Job Growth</div>
                    <div className="text-xl font-bold text-green-600">{report.keyMetrics.job_growth}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Price Appreciation</div>
                    <div className="text-xl font-bold text-green-600">{report.keyMetrics.price_appreciation}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Cap Rates</div>
                    <div className="text-xl font-bold">{report.keyMetrics.cap_rates}</div>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">Top Markets</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {report.topMarkets.map(market => (
                    <div key={market.name} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold">{market.name}</h4>
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                          <span className="ml-1 font-medium">{market.score}</span>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {market.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-center text-gray-600">
                            <ArrowUpRight className="h-4 w-4 text-green-600 mr-2" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <h3 className="text-xl font-bold mb-4">Property Type Analysis</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {report.propertyTypes.map(property => (
                    <div key={property.type} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold">{property.type}</h4>
                        <div className="text-sm font-medium text-blue-600">{property.score}/100</div>
                      </div>
                      <p className="text-gray-600">{property.outlook}</p>
                    </div>
                  ))}
                </div>

                <h3 className="text-xl font-bold mb-4">Market Trends</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <ul className="space-y-3">
                    {report.trends.map((trend, index) => (
                      <li key={index} className="flex items-start">
                        <TrendingUp className="h-5 w-5 text-blue-600 mt-1 mr-3" />
                        <span className="text-gray-600">{trend}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredReports.length === 0 && searchTerm && (
              <div className="text-center py-16">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
                  <div className="flex items-center justify-center text-yellow-600 mb-4">
                    <Search className="h-8 w-8 mr-3" />
                    <span className="font-medium text-lg">No results found</span>
                  </div>
                  <p className="text-yellow-700">
                    No market reports match "<span className="font-medium">{searchTerm}</span>". 
                    Try searching for a different state or city.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedState(null);
                    }}
                    className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            )}
            
          <div className="grid md:grid-cols-3 gap-8">
            {filteredReports.map(report => (
              <div 
                key={report.state}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
                onClick={() => {
                  setSelectedState(report.state);
                  const stateSlug = report.state.toLowerCase().replace(/\s+/g, '-');
                  navigate(`/resources/market-reports/${stateSlug}`);
                }}
              >
                <div className="relative h-48 bg-gray-200">
                  {imagesLoading.has(report.state) && (
                    <div className="absolute inset-0">
                      <Skeleton height="100%" />
                    </div>
                  )}
                  <img
                    src={report.thumbnail}
                    alt={`${report.state} skyline`}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    loading="lazy"
                    onLoadStart={() => handleImageStart(report.state)}
                    onLoad={(e) => {
                      e.currentTarget.style.opacity = '1';
                      handleImageLoad(report.state);
                    }}
                    onError={(e) => {
                      e.currentTarget.src = defaultStateImage;
                      handleImageLoad(report.state);
                    }}
                    style={{ opacity: 0 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white">{report.state}</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 mb-4 line-clamp-2">{report.overview}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Growth</div>
                      <div className="font-semibold text-green-600">{report.keyMetrics.population_growth}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Cap Rates</div>
                      <div className="font-semibold">{report.keyMetrics.cap_rates}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {report.propertyTypes.map(property => (
                      <span 
                        key={property.type}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full"
                      >
                        {property.type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}