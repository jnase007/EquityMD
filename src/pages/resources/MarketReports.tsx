import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageBanner } from '../../components/PageBanner';
import { Search, Building2, TrendingUp, DollarSign, ChevronRight, ArrowUpRight, MapPin, BarChart, Star } from 'lucide-react';

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

const stateImages = {
  'Alabama': 'https://images.unsplash.com/photo-1576620978143-63f0e5c9ce8f?auto=format&fit=crop&q=80',
  'Alaska': 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&q=80',
  'Arizona': 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&q=80',
  'Arkansas': 'https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?auto=format&fit=crop&q=80',
  'California': 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&q=80',
  'Colorado': 'https://images.unsplash.com/photo-1546156929-a4c0ac411f47?auto=format&fit=crop&q=80',
  'Connecticut': 'https://images.unsplash.com/photo-1572731410363-68226f91e8f5?auto=format&fit=crop&q=80',
  'Delaware': 'https://images.unsplash.com/photo-1572731410363-68226f91e8f5?auto=format&fit=crop&q=80',
  'Florida': 'https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?auto=format&fit=crop&q=80',
  'Georgia': 'https://images.unsplash.com/photo-1575916167835-a609853ffd7e?auto=format&fit=crop&q=80',
  'Hawaii': 'https://images.unsplash.com/photo-1598135753163-6167c1a1ad65?auto=format&fit=crop&q=80',
  'Idaho': 'https://images.unsplash.com/photo-1601791074012-d4e0ee30d9a7?auto=format&fit=crop&q=80',
  'Illinois': 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&q=80',
  'Indiana': 'https://images.unsplash.com/photo-1578777108770-fcd123148f66?auto=format&fit=crop&q=80',
  'Iowa': 'https://images.unsplash.com/photo-1572724061722-1f58c84a4c72?auto=format&fit=crop&q=80',
  'Kansas': 'https://images.unsplash.com/photo-1587473555771-96fac8e54668?auto=format&fit=crop&q=80',
  'Kentucky': 'https://images.unsplash.com/photo-1580483046931-aaba29e90f14?auto=format&fit=crop&q=80',
  'Louisiana': 'https://images.unsplash.com/photo-1571893544028-06b07af6dade?auto=format&fit=crop&q=80',
  'Maine': 'https://images.unsplash.com/photo-1572731410363-68226f91e8f5?auto=format&fit=crop&q=80',
  'Maryland': 'https://images.unsplash.com/photo-1575916167835-a609853ffd7e?auto=format&fit=crop&q=80',
  'Massachusetts': 'https://images.unsplash.com/photo-1572731410363-68226f91e8f5?auto=format&fit=crop&q=80',
  'Michigan': 'https://images.unsplash.com/photo-1578777108770-fcd123148f66?auto=format&fit=crop&q=80',
  'Minnesota': 'https://images.unsplash.com/photo-1578777108770-fcd123148f66?auto=format&fit=crop&q=80',
  'Mississippi': 'https://images.unsplash.com/photo-1571893544028-06b07af6dade?auto=format&fit=crop&q=80',
  'Missouri': 'https://images.unsplash.com/photo-1572724061722-1f58c84a4c72?auto=format&fit=crop&q=80',
  'Montana': 'https://images.unsplash.com/photo-1601791074012-d4e0ee30d9a7?auto=format&fit=crop&q=80',
  'Nebraska': 'https://images.unsplash.com/photo-1587473555771-96fac8e54668?auto=format&fit=crop&q=80',
  'Nevada': 'https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?auto=format&fit=crop&q=80',
  'New Hampshire': 'https://images.unsplash.com/photo-1572731410363-68226f91e8f5?auto=format&fit=crop&q=80',
  'New Jersey': 'https://images.unsplash.com/photo-1572731410363-68226f91e8f5?auto=format&fit=crop&q=80',
  'New Mexico': 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&q=80',
  'New York': 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&q=80',
  'North Carolina': 'https://images.unsplash.com/photo-1575916167835-a609853ffd7e?auto=format&fit=crop&q=80',
  'North Dakota': 'https://images.unsplash.com/photo-1587473555771-96fac8e54668?auto=format&fit=crop&q=80',
  'Ohio': 'https://images.unsplash.com/photo-1578777108770-fcd123148f66?auto=format&fit=crop&q=80',
  'Oklahoma': 'https://images.unsplash.com/photo-1587473555771-96fac8e54668?auto=format&fit=crop&q=80',
  'Oregon': 'https://images.unsplash.com/photo-1601791074012-d4e0ee30d9a7?auto=format&fit=crop&q=80',
  'Pennsylvania': 'https://images.unsplash.com/photo-1572731410363-68226f91e8f5?auto=format&fit=crop&q=80',
  'Rhode Island': 'https://images.unsplash.com/photo-1572731410363-68226f91e8f5?auto=format&fit=crop&q=80',
  'South Carolina': 'https://images.unsplash.com/photo-1575916167835-a609853ffd7e?auto=format&fit=crop&q=80',
  'South Dakota': 'https://images.unsplash.com/photo-1587473555771-96fac8e54668?auto=format&fit=crop&q=80',
  'Tennessee': 'https://images.unsplash.com/photo-1575916167835-a609853ffd7e?auto=format&fit=crop&q=80',
  'Texas': 'https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&q=80',
  'Utah': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80',
  'Vermont': 'https://images.unsplash.com/photo-1572731410363-68226f91e8f5?auto=format&fit=crop&q=80',
  'Virginia': 'https://images.unsplash.com/photo-1575916167835-a609853ffd7e?auto=format&fit=crop&q=80',
  'Washington': 'https://images.unsplash.com/photo-1601791074012-d4e0ee30d9a7?auto=format&fit=crop&q=80',
  'West Virginia': 'https://images.unsplash.com/photo-1572731410363-68226f91e8f5?auto=format&fit=crop&q=80',
  'Wisconsin': 'https://images.unsplash.com/photo-1578777108770-fcd123148f66?auto=format&fit=crop&q=80',
  'Wyoming': 'https://images.unsplash.com/photo-1601791074012-d4e0ee30d9a7?auto=format&fit=crop&q=80'
};

const defaultStateImage = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80';

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
    image: stateImages[state] || defaultStateImage
  };
};

const marketReports: MarketReport[] = US_STATES.map(state => generateStateReport(state));

export function MarketReports() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredReports, setFilteredReports] = useState(marketReports);
  const searchRef = useRef<HTMLDivElement>(null);

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
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchTermLower = searchTerm.toLowerCase();
    const matchingState = marketReports.find(
      report => report.state.toLowerCase() === searchTermLower
    );
    if (matchingState) {
      setSelectedState(matchingState.state);
    }
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                placeholder="Search by state or city..."
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

      <div className="max-w-7xl mx-auto px-4 py-16">
        {selectedState ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            {filteredReports.map(report => report.state === selectedState && (
              <div key={report.state}>
                <div className="relative h-64 mb-8 rounded-lg overflow-hidden">
                  <img
                    src={report.image}
                    alt={`${report.state} skyline`}
                    className="w-full h-full object-cover"
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
          <div className="grid md:grid-cols-3 gap-8">
            {filteredReports.map(report => (
              <div 
                key={report.state}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
                onClick={() => setSelectedState(report.state)}
              >
                <div className="relative h-48">
                  <img
                    src={report.image}
                    alt={`${report.state} skyline`}
                    className="w-full h-full object-cover"
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
        )}
      </div>

      <Footer />
    </div>
  );
}