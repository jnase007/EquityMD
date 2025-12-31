import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { SEO } from '../../components/SEO';
import { 
  Search, TrendingUp, MapPin, Building2, Users, Briefcase, 
  DollarSign, ArrowRight, Info, CheckCircle, AlertTriangle,
  BarChart3, Home, Star
} from 'lucide-react';
import { 
  MARKET_DATA, 
  NATIONAL_AVERAGES, 
  DATA_SOURCES,
  formatCurrency,
  getScoreColor,
  getScoreLabel,
  type MarketData 
} from '../../data/marketData';

export function MarketReports() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<'all' | 'primary' | 'secondary' | 'emerging'>('all');
  const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null);

  const filteredMarkets = MARKET_DATA.filter(market => {
    const matchesSearch = 
      market.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      market.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = selectedTier === 'all' || market.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const tierCounts = {
    primary: MARKET_DATA.filter(m => m.tier === 'primary').length,
    secondary: MARKET_DATA.filter(m => m.tier === 'secondary').length,
    emerging: MARKET_DATA.filter(m => m.tier === 'emerging').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Real Estate Market Reports & Investment Analysis | EquityMD"
        description="Research top US multifamily markets with real data on cap rates, rent growth, job growth, and investment scores. Data-driven market analysis for accredited investors."
        keywords="multifamily market data, cap rates by city, rent growth, real estate investment analysis, commercial real estate markets"
      />
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Market Research & Analysis
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Data-driven insights on {MARKET_DATA.length} top US multifamily markets. 
              Updated Q4 2024.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by city or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-300 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* National Overview Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            National Multifamily Averages (Q4 2024)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{NATIONAL_AVERAGES.capRate}%</div>
              <div className="text-xs text-gray-500">Avg Cap Rate</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">+{NATIONAL_AVERAGES.rentGrowthYoY}%</div>
              <div className="text-xs text-gray-500">Rent Growth YoY</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{NATIONAL_AVERAGES.vacancyRate}%</div>
              <div className="text-xs text-gray-500">Vacancy Rate</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">+{NATIONAL_AVERAGES.jobGrowth}%</div>
              <div className="text-xs text-gray-500">Job Growth</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{NATIONAL_AVERAGES.unemploymentRate}%</div>
              <div className="text-xs text-gray-500">Unemployment</div>
            </div>
          </div>
        </div>

        {/* Tier Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedTier('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedTier === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Markets ({MARKET_DATA.length})
          </button>
          <button
            onClick={() => setSelectedTier('primary')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedTier === 'primary' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            🏆 Primary ({tierCounts.primary})
          </button>
          <button
            onClick={() => setSelectedTier('secondary')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedTier === 'secondary' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            📈 Secondary ({tierCounts.secondary})
          </button>
          <button
            onClick={() => setSelectedTier('emerging')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedTier === 'emerging' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            🚀 Emerging ({tierCounts.emerging})
          </button>
        </div>

        {/* Market Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredMarkets.map((market) => (
            <div
              key={market.slug}
              onClick={() => setSelectedMarket(market)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 hover:border-blue-200 overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{market.city}</h3>
                    <p className="text-gray-500 text-sm">{market.state}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(market.investmentScore)}`}>
                      {market.investmentScore}
                    </div>
                    <div className="text-xs text-gray-400">{getScoreLabel(market.investmentScore)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    market.tier === 'primary' ? 'bg-emerald-100 text-emerald-700' :
                    market.tier === 'secondary' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {market.tier.charAt(0).toUpperCase() + market.tier.slice(1)} Market
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Cap Rate</div>
                    <div className="font-semibold text-gray-900">
                      {market.capRateRange.min}% - {market.capRateRange.max}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Rent Growth</div>
                    <div className={`font-semibold ${market.rentGrowthYoY > NATIONAL_AVERAGES.rentGrowthYoY ? 'text-emerald-600' : 'text-gray-900'}`}>
                      +{market.rentGrowthYoY}% YoY
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Vacancy</div>
                    <div className={`font-semibold ${market.vacancyRate < NATIONAL_AVERAGES.vacancyRate ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {market.vacancyRate}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Job Growth</div>
                    <div className={`font-semibold ${market.jobGrowth > NATIONAL_AVERAGES.jobGrowth ? 'text-emerald-600' : 'text-gray-900'}`}>
                      +{market.jobGrowth}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    <Home className="h-4 w-4 inline mr-1" />
                    {formatCurrency(market.pricePerUnit.min)} - {formatCurrency(market.pricePerUnit.max)}/unit
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/cities/${market.slug}`);
                    }}
                    className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
                  >
                    View Deals <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMarkets.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No markets found matching "{searchTerm}"</p>
          </div>
        )}

        {/* Data Sources */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Data Sources & Methodology
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="mb-2"><strong>Population & Demographics:</strong> {DATA_SOURCES.population}</p>
              <p className="mb-2"><strong>Employment Data:</strong> {DATA_SOURCES.employment}</p>
            </div>
            <div>
              <p className="mb-2"><strong>Rent Data:</strong> {DATA_SOURCES.rent}</p>
              <p className="mb-2"><strong>Cap Rates:</strong> {DATA_SOURCES.capRates}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            {DATA_SOURCES.general} Investment scores are a composite of growth, employment, and affordability metrics. 
            This data is for informational purposes only and should not be relied upon for investment decisions.
          </p>
        </div>
      </div>

      {/* Market Detail Modal */}
      {selectedMarket && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMarket(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedMarket.city}, {selectedMarket.stateCode}</h2>
                  <p className="text-blue-100 capitalize">{selectedMarket.tier} Market</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{selectedMarket.investmentScore}</div>
                  <div className="text-sm text-blue-100">Investment Score</div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Key Metrics */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Key Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-gray-900">{selectedMarket.capRateRange.min}-{selectedMarket.capRateRange.max}%</div>
                    <div className="text-xs text-gray-500">Cap Rate Range</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-emerald-600">+{selectedMarket.rentGrowthYoY}%</div>
                    <div className="text-xs text-gray-500">Rent Growth YoY</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-gray-900">{selectedMarket.vacancyRate}%</div>
                    <div className="text-xs text-gray-500">Vacancy Rate</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-emerald-600">+{selectedMarket.jobGrowth}%</div>
                    <div className="text-xs text-gray-500">Job Growth</div>
                  </div>
                </div>
              </div>

              {/* Demographics */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Demographics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Population</div>
                    <div className="font-semibold">{selectedMarket.population.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Population Growth</div>
                    <div className="font-semibold text-emerald-600">+{selectedMarket.populationGrowth}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Median Income</div>
                    <div className="font-semibold">${selectedMarket.medianHouseholdIncome.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Rents */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Rent Levels
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-600">${selectedMarket.medianRent1BR.toLocaleString()}/mo</div>
                    <div className="text-xs text-gray-500">Median 1BR Rent</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-600">${selectedMarket.medianRent2BR.toLocaleString()}/mo</div>
                    <div className="text-xs text-gray-500">Median 2BR Rent</div>
                  </div>
                </div>
              </div>

              {/* Top Industries */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Top Industries
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMarket.topIndustries.map((industry, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {industry}
                    </span>
                  ))}
                </div>
              </div>

              {/* Highlights & Risks */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" /> Highlights
                  </h3>
                  <ul className="space-y-2">
                    {selectedMarket.highlights.map((h, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Risks
                  </h3>
                  <ul className="space-y-2">
                    {selectedMarket.risks.map((r, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => navigate(`/cities/${selectedMarket.slug}`)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Building2 className="h-5 w-5" />
                  View Deals in {selectedMarket.city}
                </button>
                <button
                  onClick={() => setSelectedMarket(null)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Data as of {selectedMarket.lastUpdated}. Sources: Census Bureau, BLS, HUD, Industry Reports.
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
