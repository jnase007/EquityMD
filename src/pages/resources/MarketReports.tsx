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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <SEO
        title="Real Estate Market Reports & Investment Analysis | EquityMD"
        description="Research top US multifamily markets with real data on cap rates, rent growth, job growth, and investment scores. Data-driven market analysis for accredited investors."
        keywords="multifamily market data, cap rates by city, rent growth, real estate investment analysis, commercial real estate markets"
      />
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="max-w-6xl mx-auto px-4 py-16 relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">
                Market Research & Analysis
              </h1>
              <p className="text-white/80 mt-1">
                Data-driven insights on {MARKET_DATA.length} top US multifamily markets
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
              <span className="text-white/70 text-sm">Markets Tracked</span>
              <p className="text-white font-bold text-xl">{MARKET_DATA.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
              <span className="text-white/70 text-sm">Last Updated</span>
              <p className="text-white font-bold text-xl">Q4 2024</p>
            </div>
          </div>
          
          {/* Data Sources Badge */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-3 mb-8 max-w-3xl">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-white/80 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="text-white font-medium">Data Sources: </span>
                <span className="text-white/80">
                  U.S. Census Bureau, Bureau of Labor Statistics, HUD Fair Market Rents, 
                  CBRE & Marcus & Millichap Q3-Q4 2024 Reports
                </span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
              <input
                type="text"
                placeholder="Search by city or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/60 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* National Overview Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
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
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-blue-200 overflow-hidden group"
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
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No markets found</h3>
            <p className="text-gray-500">No markets found matching "{searchTerm}"</p>
          </div>
        )}

        {/* Data Sources */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Data Sources & Methodology
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600 mb-4">
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-800 mb-1">Population & Demographics</p>
                <a href="https://www.census.gov/data/tables/time-series/demo/popest/2020s-total-cities-and-towns.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  U.S. Census Bureau, 2023 Population Estimates →
                </a>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Employment Data</p>
                <a href="https://www.bls.gov/eag/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Bureau of Labor Statistics, Metro Area Employment →
                </a>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-800 mb-1">Rent Data</p>
                <a href="https://www.huduser.gov/portal/datasets/fmr.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  HUD Fair Market Rents FY 2024 →
                </a>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Cap Rates & Market Reports</p>
                <a href="https://www.cbre.com/insights/reports" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-3">
                  CBRE Research →
                </a>
                <a href="https://www.marcusmillichap.com/research" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Marcus & Millichap →
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-blue-200 pt-4">
            <p className="text-xs text-gray-500">
              <strong>Disclaimer:</strong> {DATA_SOURCES.general} Investment scores are a composite of growth, employment, and affordability metrics. 
              This data is for informational purposes only and should not be relied upon for investment decisions. 
              Always conduct your own due diligence before investing.
            </p>
          </div>
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
