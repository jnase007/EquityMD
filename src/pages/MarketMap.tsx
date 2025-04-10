import React, { useState, useCallback, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl';
import { MapPin, Building2, TrendingUp, DollarSign, ChevronRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MarketData {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  score: number;
  metrics: {
    population_growth: string;
    job_growth: string;
    price_appreciation: string;
    cap_rates: string;
    median_price: string;
    inventory: string;
  };
  trends: string[];
  propertyTypes: {
    type: string;
    score: number;
  }[];
}

const marketData: MarketData[] = [
  {
    city: "Austin",
    state: "TX",
    latitude: 30.2672,
    longitude: -97.7431,
    score: 92,
    metrics: {
      population_growth: "+2.5%",
      job_growth: "+3.8%",
      price_appreciation: "+15.2%",
      cap_rates: "4.8%",
      median_price: "$425,000",
      inventory: "3.2 months"
    },
    trends: [
      "Tech sector expansion",
      "Strong population growth",
      "Rising rental rates"
    ],
    propertyTypes: [
      { type: "Multi-Family", score: 95 },
      { type: "Office", score: 88 },
      { type: "Industrial", score: 85 }
    ]
  },
  {
    city: "Nashville",
    state: "TN",
    latitude: 36.1627,
    longitude: -86.7816,
    score: 89,
    metrics: {
      population_growth: "+1.9%",
      job_growth: "+3.2%",
      price_appreciation: "+13.8%",
      cap_rates: "5.1%",
      median_price: "$385,000",
      inventory: "2.8 months"
    },
    trends: [
      "Healthcare expansion",
      "Entertainment industry growth",
      "Strong tourism"
    ],
    propertyTypes: [
      { type: "Multi-Family", score: 90 },
      { type: "Medical Office", score: 92 },
      { type: "Retail", score: 86 }
    ]
  },
  {
    city: "Raleigh",
    state: "NC",
    latitude: 35.7796,
    longitude: -78.6382,
    score: 88,
    metrics: {
      population_growth: "+2.1%",
      job_growth: "+3.5%",
      price_appreciation: "+12.9%",
      cap_rates: "5.3%",
      median_price: "$375,000",
      inventory: "2.5 months"
    },
    trends: [
      "Life sciences growth",
      "Research expansion",
      "Tech hub development"
    ],
    propertyTypes: [
      { type: "Life Sciences", score: 94 },
      { type: "Office", score: 87 },
      { type: "Multi-Family", score: 89 }
    ]
  }
  // Add more markets as needed
];

const propertyTypeColors = {
  'Multi-Family': '#2563eb', // blue-600
  'Office': '#16a34a', // green-600
  'Industrial': '#9333ea', // purple-600
  'Medical Office': '#dc2626', // red-600
  'Retail': '#ea580c', // orange-600
  'Life Sciences': '#0891b2' // cyan-600
};

export function MarketMap() {
  const [viewState, setViewState] = useState({
    latitude: 39.8283,
    longitude: -98.5795,
    zoom: 3.5
  });
  
  const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null);
  const [activePropertyType, setActivePropertyType] = useState<string | null>(null);

  const propertyTypes = useMemo(() => {
    const types = new Set<string>();
    marketData.forEach(market => {
      market.propertyTypes.forEach(pt => types.add(pt.type));
    });
    return Array.from(types);
  }, []);

  const onMarkerClick = useCallback((market: MarketData) => {
    setSelectedMarket(market);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="relative">
        {/* Map Container */}
        <div className="h-[calc(100vh-64px)]">
          <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/light-v11"
            mapboxAccessToken={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          >
            <NavigationControl />

            {marketData.map((market) => (
              <Marker
                key={`${market.city}-${market.state}`}
                latitude={market.latitude}
                longitude={market.longitude}
                onClick={() => onMarkerClick(market)}
              >
                <div className="relative cursor-pointer group">
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-600 rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
                  <MapPin 
                    className="h-6 w-6 text-blue-600 relative z-10 transform -translate-x-1/2 -translate-y-1/2"
                    fill={market.score > 90 ? "#2563eb" : market.score > 85 ? "#3b82f6" : "#60a5fa"}
                  />
                  <div className="absolute top-0 left-0 transform -translate-y-full -translate-x-1/2 bg-white rounded-lg shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <span className="font-medium">{market.city}, {market.state}</span>
                    <span className="ml-2 text-blue-600">{market.score}</span>
                  </div>
                </div>
              </Marker>
            ))}

            {selectedMarket && (
              <Popup
                latitude={selectedMarket.latitude}
                longitude={selectedMarket.longitude}
                onClose={() => setSelectedMarket(null)}
                closeButton={true}
                closeOnClick={false}
                className="market-popup"
              >
                <div className="p-4 max-w-sm">
                  <h3 className="text-lg font-bold mb-2">
                    {selectedMarket.city}, {selectedMarket.state}
                  </h3>
                  
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="font-medium">Market Score: {selectedMarket.score}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Population Growth</div>
                      <div className="font-medium text-green-600">
                        {selectedMarket.metrics.population_growth}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Job Growth</div>
                      <div className="font-medium text-green-600">
                        {selectedMarket.metrics.job_growth}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Price Appreciation</div>
                      <div className="font-medium text-green-600">
                        {selectedMarket.metrics.price_appreciation}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Cap Rates</div>
                      <div className="font-medium">
                        {selectedMarket.metrics.cap_rates}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="font-medium mb-2">Property Type Scores</div>
                    <div className="space-y-2">
                      {selectedMarket.propertyTypes.map((pt) => (
                        <div key={pt.type} className="flex items-center justify-between">
                          <span className="text-sm">{pt.type}</span>
                          <div className="flex items-center">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full"
                                style={{
                                  width: `${pt.score}%`,
                                  backgroundColor: propertyTypeColors[pt.type as keyof typeof propertyTypeColors] || '#2563eb'
                                }}
                              />
                            </div>
                            <span className="ml-2 text-sm font-medium">{pt.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="font-medium mb-2">Key Trends</div>
                    <ul className="space-y-1">
                      {selectedMarket.trends.map((trend, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <ChevronRight className="h-4 w-4 text-blue-600 mr-1" />
                          {trend}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        </div>

        {/* Controls Panel */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h2 className="text-lg font-bold mb-4">Market Analysis</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type Filter
              </label>
              <div className="flex flex-wrap gap-2">
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setActivePropertyType(activePropertyType === type ? null : type)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      activePropertyType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Market Score Range
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full"
                  defaultValue="80"
                />
                <span className="text-sm font-medium">80+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-8 left-4 bg-white rounded-lg shadow-lg p-4">
          <h3 className="font-medium mb-2">Market Score</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-blue-600" fill="#2563eb" />
              <span className="ml-2 text-sm">90+ (Excellent)</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-blue-500" fill="#3b82f6" />
              <span className="ml-2 text-sm">85-90 (Strong)</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-blue-400" fill="#60a5fa" />
              <span className="ml-2 text-sm">80-85 (Good)</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}