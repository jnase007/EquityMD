import React, { useState, useCallback, useMemo, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import MapboxWorker from 'mapbox-gl/dist/mapbox-gl-csp-worker?worker';
import { MapPin, Building2, TrendingUp, DollarSign, ChevronRight, Search, Loader } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { supabase } from '../lib/supabase';
import 'mapbox-gl/dist/mapbox-gl.css';

// Fix Mapbox GL worker for Vite production builds
// @ts-ignore
mapboxgl.workerClass = MapboxWorker;

interface Deal {
  id: string;
  city: string;
  state: string;
  property_type: string;
  target_irr: number;
  minimum_investment: number;
  equity_required: number;
  status: string;
  cover_image_url: string;
  title: string;
  slug: string;
  syndicator_id: string;
  syndicators: {
    company_name: string;
  };
}

interface MarketCluster {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  dealCount: number;
  deals: Deal[];
  propertyTypes: { [type: string]: number };
  investmentRange: {
    min: number;
    max: number;
  };
  averageTargetIRR: number;
  syndicators: string[];
}

// City coordinates lookup table for major US cities
const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
  // California
  'Los Angeles, CA': { lat: 34.0522, lng: -118.2437 },
  'San Francisco, CA': { lat: 37.7749, lng: -122.4194 },
  'San Diego, CA': { lat: 32.7157, lng: -117.1611 },
  'San Jose, CA': { lat: 37.3382, lng: -121.8863 },
  'Sacramento, CA': { lat: 38.5816, lng: -121.4944 },
  'Fresno, CA': { lat: 36.7378, lng: -119.7871 },
  'Oakland, CA': { lat: 37.8044, lng: -122.2711 },
  'Santa Ana, CA': { lat: 33.7456, lng: -117.8677 },
  'Anaheim, CA': { lat: 33.8366, lng: -117.9143 },
  'Riverside, CA': { lat: 33.9533, lng: -117.3962 },
  'Stockton, CA': { lat: 37.9577, lng: -121.2908 },
  'Irvine, CA': { lat: 33.6846, lng: -117.8265 },
  'Fremont, CA': { lat: 37.5485, lng: -121.9886 },
  'Garden Grove, CA': { lat: 33.7739, lng: -117.9415 },
  'Huntington Beach, CA': { lat: 33.6595, lng: -117.9988 },
  'Costa Mesa, CA': { lat: 33.6411, lng: -117.9187 },
  'Fullerton, CA': { lat: 33.8704, lng: -117.9243 },
  'Long Beach, CA': { lat: 33.7701, lng: -118.1937 },
  
  // Texas
  'Houston, TX': { lat: 29.7604, lng: -95.3698 },
  'San Antonio, TX': { lat: 29.4241, lng: -98.4936 },
  'Dallas, TX': { lat: 32.7767, lng: -96.7970 },
  'Austin, TX': { lat: 30.2672, lng: -97.7431 },
  'Fort Worth, TX': { lat: 32.7555, lng: -97.3308 },
  'El Paso, TX': { lat: 31.7619, lng: -106.4850 },
  'Arlington, TX': { lat: 32.7357, lng: -97.1081 },
  'Corpus Christi, TX': { lat: 27.8006, lng: -97.3964 },
  'Plano, TX': { lat: 33.0198, lng: -96.6989 },
  'Lubbock, TX': { lat: 33.5779, lng: -101.8552 },
  
  // Florida
  'Jacksonville, FL': { lat: 30.3322, lng: -81.6557 },
  'Miami, FL': { lat: 25.7617, lng: -80.1918 },
  'Tampa, FL': { lat: 27.9506, lng: -82.4572 },
  'Orlando, FL': { lat: 28.5383, lng: -81.3792 },
  'St. Petersburg, FL': { lat: 27.7676, lng: -82.6403 },
  'Hialeah, FL': { lat: 25.8576, lng: -80.2781 },
  'Tallahassee, FL': { lat: 30.4518, lng: -84.2807 },
  'Fort Lauderdale, FL': { lat: 26.1224, lng: -80.1373 },
  'Port St. Lucie, FL': { lat: 27.2939, lng: -80.3501 },
  'Cape Coral, FL': { lat: 26.5629, lng: -81.9495 },
  
  // New York
  'New York, NY': { lat: 40.7128, lng: -74.0060 },
  'Buffalo, NY': { lat: 42.8864, lng: -78.8784 },
  'Rochester, NY': { lat: 43.1566, lng: -77.6088 },
  'Yonkers, NY': { lat: 40.9312, lng: -73.8988 },
  'Syracuse, NY': { lat: 43.0481, lng: -76.1474 },
  'Albany, NY': { lat: 42.6526, lng: -73.7562 },
  
  // Illinois
  'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
  'Aurora, IL': { lat: 41.7606, lng: -88.3201 },
  'Rockford, IL': { lat: 42.2711, lng: -89.0940 },
  'Joliet, IL': { lat: 41.5250, lng: -88.0817 },
  'Naperville, IL': { lat: 41.7508, lng: -88.1535 },
  'Springfield, IL': { lat: 39.7817, lng: -89.6501 },
  
  // Pennsylvania
  'Philadelphia, PA': { lat: 39.9526, lng: -75.1652 },
  'Pittsburgh, PA': { lat: 40.4406, lng: -79.9959 },
  'Allentown, PA': { lat: 40.6084, lng: -75.4902 },
  'Erie, PA': { lat: 42.1292, lng: -80.0851 },
  'Reading, PA': { lat: 40.3357, lng: -75.9268 },
  
  // Ohio
  'Columbus, OH': { lat: 39.9612, lng: -82.9988 },
  'Cleveland, OH': { lat: 41.4993, lng: -81.6944 },
  'Cincinnati, OH': { lat: 39.1031, lng: -84.5120 },
  'Toledo, OH': { lat: 41.6528, lng: -83.5379 },
  'Akron, OH': { lat: 41.0814, lng: -81.5190 },
  'Dayton, OH': { lat: 39.7589, lng: -84.1916 },
  
  // Georgia
  'Atlanta, GA': { lat: 33.7490, lng: -84.3880 },
  'Columbus, GA': { lat: 32.4609, lng: -84.9877 },
  'Augusta, GA': { lat: 33.4735, lng: -82.0105 },
  'Savannah, GA': { lat: 32.0835, lng: -81.0998 },
  'Athens, GA': { lat: 33.9519, lng: -83.3576 },
  
  // North Carolina
  'Charlotte, NC': { lat: 35.2271, lng: -80.8431 },
  'Raleigh, NC': { lat: 35.7796, lng: -78.6382 },
  'Greensboro, NC': { lat: 36.0726, lng: -79.7920 },
  'Durham, NC': { lat: 35.9940, lng: -78.8986 },
  'Winston-Salem, NC': { lat: 36.0999, lng: -80.2442 },
  'Fayetteville, NC': { lat: 35.0527, lng: -78.8784 },
  
  // Michigan
  'Detroit, MI': { lat: 42.3314, lng: -83.0458 },
  'Grand Rapids, MI': { lat: 42.9634, lng: -85.6681 },
  'Warren, MI': { lat: 42.5075, lng: -83.0275 },
  'Sterling Heights, MI': { lat: 42.5803, lng: -83.0302 },
  'Lansing, MI': { lat: 42.3314, lng: -84.5467 },
  'Ann Arbor, MI': { lat: 42.2808, lng: -83.7430 },
  
  // Tennessee
  'Memphis, TN': { lat: 35.1495, lng: -90.0490 },
  'Nashville, TN': { lat: 36.1627, lng: -86.7816 },
  'Knoxville, TN': { lat: 35.9606, lng: -83.9207 },
  'Chattanooga, TN': { lat: 35.0456, lng: -85.3097 },
  
  // Washington
  'Seattle, WA': { lat: 47.6062, lng: -122.3321 },
  'Spokane, WA': { lat: 47.6587, lng: -117.4260 },
  'Tacoma, WA': { lat: 47.2529, lng: -122.4443 },
  'Vancouver, WA': { lat: 45.6387, lng: -122.6615 },
  'Bellevue, WA': { lat: 47.6101, lng: -122.2015 },
  
  // Massachusetts
  'Boston, MA': { lat: 42.3601, lng: -71.0589 },
  'Worcester, MA': { lat: 42.2626, lng: -71.8023 },
  'Springfield, MA': { lat: 42.1015, lng: -72.5898 },
  'Lowell, MA': { lat: 42.6334, lng: -71.3162 },
  'Cambridge, MA': { lat: 42.3736, lng: -71.1097 },
  
  // Arizona
  'Phoenix, AZ': { lat: 33.4484, lng: -112.0740 },
  'Tucson, AZ': { lat: 32.2217, lng: -110.9265 },
  'Mesa, AZ': { lat: 33.4152, lng: -111.8315 },
  'Chandler, AZ': { lat: 33.3062, lng: -111.8413 },
  'Scottsdale, AZ': { lat: 33.4942, lng: -111.9261 },
  'Glendale, AZ': { lat: 33.5387, lng: -112.1860 },
  
  // Indiana
  'Indianapolis, IN': { lat: 39.7684, lng: -86.1581 },
  'Fort Wayne, IN': { lat: 41.0793, lng: -85.1394 },
  'Evansville, IN': { lat: 37.9716, lng: -87.5710 },
  'South Bend, IN': { lat: 41.6834, lng: -86.2500 },
  
  // Colorado
  'Denver, CO': { lat: 39.7392, lng: -104.9903 },
  'Colorado Springs, CO': { lat: 38.8339, lng: -104.8214 },
  'Aurora, CO': { lat: 39.7294, lng: -104.8319 },
  'Lakewood, CO': { lat: 39.7047, lng: -105.0814 },
  
  // Missouri
  'Kansas City, MO': { lat: 39.0997, lng: -94.5786 },
  'St. Louis, MO': { lat: 38.6270, lng: -90.1994 },
  'Springfield, MO': { lat: 37.2153, lng: -93.2982 },
  'Independence, MO': { lat: 39.0911, lng: -94.4155 },
  
  // Virginia
  'Virginia Beach, VA': { lat: 36.8529, lng: -75.9780 },
  'Norfolk, VA': { lat: 36.9047, lng: -76.2594 },
  'Chesapeake, VA': { lat: 36.7682, lng: -76.2875 },
  'Richmond, VA': { lat: 37.5407, lng: -77.4360 },
  'Newport News, VA': { lat: 36.9787, lng: -76.4951 },
  
  // Wisconsin
  'Milwaukee, WI': { lat: 43.0389, lng: -87.9065 },
  'Madison, WI': { lat: 43.0731, lng: -89.4012 },
  'Green Bay, WI': { lat: 44.5133, lng: -88.0133 },
  
  // Louisiana
  'New Orleans, LA': { lat: 29.9511, lng: -90.0715 },
  'Baton Rouge, LA': { lat: 30.4515, lng: -91.1871 },
  'Shreveport, LA': { lat: 32.5252, lng: -93.7502 },
  'Lafayette, LA': { lat: 30.2241, lng: -92.0198 },
  
  // Nevada
  'Las Vegas, NV': { lat: 36.1699, lng: -115.1398 },
  'Henderson, NV': { lat: 36.0397, lng: -114.9817 },
  'Reno, NV': { lat: 39.5296, lng: -119.8138 },
  
  // Maryland
  'Baltimore, MD': { lat: 39.2904, lng: -76.6122 },
  'Frederick, MD': { lat: 39.4143, lng: -77.4105 },
  'Rockville, MD': { lat: 39.0840, lng: -77.1528 },
  'Gaithersburg, MD': { lat: 39.1434, lng: -77.2014 },
  
  // Minnesota
  'Minneapolis, MN': { lat: 44.9778, lng: -93.2650 },
  'St. Paul, MN': { lat: 44.9537, lng: -93.0900 },
  'Rochester, MN': { lat: 44.0121, lng: -92.4802 },
  'Duluth, MN': { lat: 46.7867, lng: -92.1005 },
  
  // Oklahoma
  'Oklahoma City, OK': { lat: 35.4676, lng: -97.5164 },
  'Tulsa, OK': { lat: 36.1540, lng: -95.9928 },
  'Norman, OK': { lat: 35.2226, lng: -97.4395 },
  
  // New Mexico
  'Albuquerque, NM': { lat: 35.0844, lng: -106.6504 },
  'Las Cruces, NM': { lat: 32.3199, lng: -106.7637 },
  'Rio Rancho, NM': { lat: 35.2328, lng: -106.6630 },
  
  // Oregon
  'Portland, OR': { lat: 45.5152, lng: -122.6784 },
  'Salem, OR': { lat: 44.9429, lng: -123.0351 },
  'Eugene, OR': { lat: 44.0521, lng: -123.0868 },
  'Gresham, OR': { lat: 45.4998, lng: -122.4318 },
  
  // Kentucky
  'Louisville, KY': { lat: 38.2527, lng: -85.7585 },
  'Lexington, KY': { lat: 38.0406, lng: -84.5037 },
  'Bowling Green, KY': { lat: 36.9685, lng: -86.4808 },
  
  // Alabama
  'Birmingham, AL': { lat: 33.5186, lng: -86.8104 },
  'Montgomery, AL': { lat: 32.3792, lng: -86.3077 },
  'Mobile, AL': { lat: 30.6954, lng: -88.0399 },
  'Huntsville, AL': { lat: 34.7304, lng: -86.5861 },
  
  // South Carolina
  'Columbia, SC': { lat: 34.0007, lng: -81.0348 },
  'Charleston, SC': { lat: 32.7765, lng: -79.9311 },
  'North Charleston, SC': { lat: 32.8546, lng: -79.9748 },
  'Greenville, SC': { lat: 34.8526, lng: -82.3940 },
  
  // Connecticut
  'Bridgeport, CT': { lat: 41.1792, lng: -73.1894 },
  'New Haven, CT': { lat: 41.3083, lng: -72.9279 },
  'Hartford, CT': { lat: 41.7658, lng: -72.6734 },
  'Stamford, CT': { lat: 41.0534, lng: -73.5387 },
  
  // Iowa
  'Des Moines, IA': { lat: 41.5868, lng: -93.6250 },
  'Cedar Rapids, IA': { lat: 41.9779, lng: -91.6656 },
  'Davenport, IA': { lat: 41.5236, lng: -90.5776 },
  
  // Arkansas
  'Little Rock, AR': { lat: 34.7465, lng: -92.2896 },
  'Fort Smith, AR': { lat: 35.3859, lng: -94.3985 },
  'Fayetteville, AR': { lat: 36.0822, lng: -94.1574 },
  
  // Utah
  'Salt Lake City, UT': { lat: 40.7608, lng: -111.8910 },
  'West Valley City, UT': { lat: 40.6916, lng: -112.0010 },
  'Provo, UT': { lat: 40.2338, lng: -111.6585 },
  'West Jordan, UT': { lat: 40.6097, lng: -111.9391 },
  
  // Kansas
  'Wichita, KS': { lat: 37.6872, lng: -97.3301 },
  'Overland Park, KS': { lat: 38.9822, lng: -94.6708 },
  'Kansas City, KS': { lat: 39.1142, lng: -94.6275 },
  'Topeka, KS': { lat: 39.0473, lng: -95.6890 },
  
  // Mississippi
  'Jackson, MS': { lat: 32.2988, lng: -90.1848 },
  'Gulfport, MS': { lat: 30.3674, lng: -89.0928 },
  'Southaven, MS': { lat: 34.9890, lng: -90.0262 },
  
  // West Virginia
  'Charleston, WV': { lat: 38.3498, lng: -81.6326 },
  'Huntington, WV': { lat: 38.4192, lng: -82.4452 },
  'Morgantown, WV': { lat: 39.6295, lng: -79.9553 },
  
  // Idaho
  'Boise, ID': { lat: 43.6150, lng: -116.2023 },
  'Meridian, ID': { lat: 43.6121, lng: -116.3915 },
  'Nampa, ID': { lat: 43.5407, lng: -116.5635 },
  
  // Hawaii
  'Honolulu, HI': { lat: 21.3099, lng: -157.8581 },
  'Pearl City, HI': { lat: 21.3972, lng: -157.9751 },
  'Hilo, HI': { lat: 19.7297, lng: -155.0900 },
  
  // New Hampshire
  'Manchester, NH': { lat: 42.9956, lng: -71.4548 },
  'Nashua, NH': { lat: 42.7654, lng: -71.4676 },
  'Concord, NH': { lat: 43.2081, lng: -71.5376 },
  
  // Maine
  'Portland, ME': { lat: 43.6591, lng: -70.2568 },
  'Lewiston, ME': { lat: 44.1009, lng: -70.2148 },
  'Bangor, ME': { lat: 44.8016, lng: -68.7712 },
  
  // Rhode Island
  'Providence, RI': { lat: 41.8240, lng: -71.4128 },
  'Warwick, RI': { lat: 41.7001, lng: -71.4162 },
  'Cranston, RI': { lat: 41.7798, lng: -71.4371 },
  
  // Montana
  'Billings, MT': { lat: 45.7833, lng: -108.5007 },
  'Missoula, MT': { lat: 46.8721, lng: -113.9940 },
  'Great Falls, MT': { lat: 47.5053, lng: -111.3008 },
  
  // Delaware
  'Wilmington, DE': { lat: 39.7391, lng: -75.5398 },
  'Dover, DE': { lat: 39.1612, lng: -75.5264 },
  'Newark, DE': { lat: 39.6837, lng: -75.7497 },
  
  // South Dakota
  'Sioux Falls, SD': { lat: 43.5460, lng: -96.7313 },
  'Rapid City, SD': { lat: 44.0805, lng: -103.2310 },
  'Aberdeen, SD': { lat: 45.4247, lng: -98.4865 },
  
  // North Dakota
  'Fargo, ND': { lat: 46.8772, lng: -96.7898 },
  'Bismarck, ND': { lat: 46.8083, lng: -100.7837 },
  'Grand Forks, ND': { lat: 47.9253, lng: -97.0329 },
  
  // Alaska
  'Anchorage, AK': { lat: 61.2181, lng: -149.9003 },
  'Fairbanks, AK': { lat: 64.8378, lng: -147.7164 },
  'Juneau, AK': { lat: 58.3019, lng: -134.4197 },
  
  // Vermont
  'Burlington, VT': { lat: 44.4759, lng: -73.2121 },
  'South Burlington, VT': { lat: 44.4669, lng: -73.1709 },
  'Rutland, VT': { lat: 43.6106, lng: -72.9726 },
  
  // Wyoming
  'Cheyenne, WY': { lat: 41.1400, lng: -104.8197 },
  'Casper, WY': { lat: 42.8666, lng: -106.3131 },
  'Laramie, WY': { lat: 41.3114, lng: -105.5911 }
};

async function geocodeCity(city: string, state: string, mapboxToken: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city + ', ' + state)}.json?access_token=${mapboxToken}&limit=1`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding city:', error);
    return null;
  }
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  } else {
    return `$${amount}`;
  }
}

export function MarketMap() {
  const [viewState, setViewState] = useState({
    latitude: 39.8283,
    longitude: -98.5795,
    zoom: 3.5
  });
  
  const [selectedMarket, setSelectedMarket] = useState<MarketCluster | null>(null);
  const [marketClusters, setMarketClusters] = useState<MarketCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePropertyType, setActivePropertyType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch deals and create market clusters
  useEffect(() => {
    async function fetchDealsAndCreateClusters() {
      try {
        setLoading(true);
        setError(null);

        // Fetch active deals with syndicator info
        const { data: deals, error: dealsError } = await supabase
          .from('deals')
          .select(`
            *,
            syndicators!inner(company_name, city, state)
          `)
          .eq('status', 'active');

        if (dealsError) {
          throw new Error(`Failed to fetch deals: ${dealsError.message}`);
        }

        if (!deals || deals.length === 0) {
          setMarketClusters([]);
          setLoading(false);
          return;
        }

        // Group deals by city/state
        const marketMap = new Map<string, Deal[]>();
        deals.forEach((deal) => {
          if (deal.city && deal.state) {
            const marketKey = `${deal.city}, ${deal.state}`;
            if (!marketMap.has(marketKey)) {
              marketMap.set(marketKey, []);
            }
            marketMap.get(marketKey)!.push(deal);
          }
        });

        // Create market clusters with geocoding
        const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
        const clusters: MarketCluster[] = [];

        for (const [marketKey, marketDeals] of marketMap) {
          const [city, state] = marketKey.split(', ');
          
          // Get coordinates from lookup table or geocode
          let coordinates = cityCoordinates[marketKey];
          if (!coordinates && mapboxToken) {
            const geocoded = await geocodeCity(city, state, mapboxToken);
            if (geocoded) {
              coordinates = geocoded;
            }
          }

          if (!coordinates) {
            console.warn(`Could not find coordinates for ${marketKey}`);
            continue;
          }

          // Calculate market metrics
          const propertyTypes: { [type: string]: number } = {};
          let totalInvestment = 0;
          let totalIRR = 0;
          let minInvestment = Infinity;
          let maxInvestment = 0;
          const syndicatorSet = new Set<string>();

          marketDeals.forEach(deal => {
            // Property types
            if (deal.property_type) {
              propertyTypes[deal.property_type] = (propertyTypes[deal.property_type] || 0) + 1;
            }

            // Investment range
            if (deal.minimum_investment) {
              minInvestment = Math.min(minInvestment, deal.minimum_investment);
              maxInvestment = Math.max(maxInvestment, deal.minimum_investment);
              totalInvestment += deal.minimum_investment;
            }

            // IRR
            if (deal.target_irr) {
              totalIRR += deal.target_irr;
            }

            // Syndicators
            if (deal.syndicators?.company_name) {
              syndicatorSet.add(deal.syndicators.company_name);
            }
          });

          const cluster: MarketCluster = {
            city,
            state,
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            dealCount: marketDeals.length,
            deals: marketDeals,
            propertyTypes,
            investmentRange: {
              min: minInvestment === Infinity ? 0 : minInvestment,
              max: maxInvestment
            },
            averageTargetIRR: marketDeals.length > 0 ? totalIRR / marketDeals.length : 0,
            syndicators: Array.from(syndicatorSet)
          };

          clusters.push(cluster);
        }

        setMarketClusters(clusters);
      } catch (err) {
        console.error('Error fetching deals:', err);
        setError(err instanceof Error ? err.message : 'Failed to load market data');
      } finally {
        setLoading(false);
      }
    }

    fetchDealsAndCreateClusters();
  }, []);

  // Filter clusters based on property type and search
  const filteredClusters = useMemo(() => {
    return marketClusters.filter(cluster => {
      // Property type filter
      if (activePropertyType && !cluster.propertyTypes[activePropertyType]) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const marketName = `${cluster.city}, ${cluster.state}`.toLowerCase();
        return marketName.includes(searchLower);
      }

      return true;
    });
  }, [marketClusters, activePropertyType, searchTerm]);

  // Get unique property types for filter
  const propertyTypes = useMemo(() => {
    const types = new Set<string>();
    marketClusters.forEach(cluster => {
      Object.keys(cluster.propertyTypes).forEach(type => types.add(type));
    });
    return Array.from(types).sort();
  }, [marketClusters]);

  const onMarkerClick = useCallback((cluster: MarketCluster) => {
    setSelectedMarket(cluster);
  }, []);

  // Calculate marker size based on deal count
  const getMarkerSize = (dealCount: number) => {
    if (dealCount >= 10) return 12;
    if (dealCount >= 5) return 10;
    if (dealCount >= 3) return 8;
    return 6;
  };

  // Calculate marker color based on deal count
  const getMarkerColor = (dealCount: number) => {
    if (dealCount >= 10) return '#1e40af'; // blue-800
    if (dealCount >= 5) return '#2563eb'; // blue-600
    if (dealCount >= 3) return '#3b82f6'; // blue-500
    return '#60a5fa'; // blue-400
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading market data...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading market data</p>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="relative">
        {/* Map Container */}
        <div className="h-[calc(100vh-64px)]">
          {filteredClusters.length === 0 ? (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Deals Found</h2>
                <p className="text-gray-600 mb-4">
                  {searchTerm || activePropertyType 
                    ? "No deals match your current filters. Try adjusting your search criteria."
                    : "There are currently no active real estate deals available on the platform."
                  }
                </p>
                {!searchTerm && !activePropertyType && (
                  <p className="text-sm text-gray-500">
                    Are you a syndicator? Start listing your deals to see them on the map!
                  </p>
                )}
              </div>
            </div>
          ) : (
            <Map
              {...viewState}
              onMove={evt => setViewState(evt.viewState)}
              mapStyle="mapbox://styles/mapbox/light-v11"
              mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
            >
              <NavigationControl />

              {filteredClusters.map((cluster) => (
                <Marker
                  key={`${cluster.city}-${cluster.state}`}
                  latitude={cluster.latitude}
                  longitude={cluster.longitude}
                  onClick={() => onMarkerClick(cluster)}
                >
                  <div className="relative cursor-pointer group">
                    <div 
                      className="absolute -top-2 -left-2 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"
                      style={{
                        width: `${getMarkerSize(cluster.dealCount) + 8}px`,
                        height: `${getMarkerSize(cluster.dealCount) + 8}px`,
                        backgroundColor: getMarkerColor(cluster.dealCount)
                      }}
                    />
                    <MapPin 
                      className="relative z-10 transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        width: `${getMarkerSize(cluster.dealCount)}px`,
                        height: `${getMarkerSize(cluster.dealCount)}px`,
                        color: getMarkerColor(cluster.dealCount)
                      }}
                      fill={getMarkerColor(cluster.dealCount)}
                    />
                    <div 
                      className="absolute top-0 left-0 transform -translate-y-full -translate-x-1/2 bg-white rounded-lg shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                      style={{ fontSize: '12px' }}
                    >
                      <span className="font-medium">{cluster.city}, {cluster.state}</span>
                      <span className="ml-2 text-blue-600">{cluster.dealCount} deals</span>
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
                      <Building2 className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="font-medium">
                        {selectedMarket.dealCount} Active Deal{selectedMarket.dealCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Property Types */}
                    <div className="mb-4">
                      <div className="font-medium mb-2">Property Types</div>
                      <div className="space-y-1">
                        {Object.entries(selectedMarket.propertyTypes).map(([type, count]) => (
                          <div key={type} className="flex justify-between text-sm">
                            <span>{type}</span>
                            <span className="font-medium">{count} deal{count !== 1 ? 's' : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Investment Range */}
                    {selectedMarket.investmentRange.max > 0 && (
                      <div className="mb-4">
                        <div className="font-medium mb-1">Investment Range</div>
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                          {formatCurrency(selectedMarket.investmentRange.min)} - {formatCurrency(selectedMarket.investmentRange.max)}
                        </div>
                      </div>
                    )}

                    {/* Average IRR */}
                    {selectedMarket.averageTargetIRR > 0 && (
                      <div className="mb-4">
                        <div className="font-medium mb-1">Average Target IRR</div>
                        <div className="flex items-center text-sm text-gray-600">
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                          {selectedMarket.averageTargetIRR.toFixed(1)}%
                        </div>
                      </div>
                    )}

                    {/* Syndicators */}
                    {selectedMarket.syndicators.length > 0 && (
                      <div className="mb-4">
                        <div className="font-medium mb-2">Active Syndicators</div>
                        <div className="space-y-1">
                          {selectedMarket.syndicators.slice(0, 3).map((syndicator) => (
                            <div key={syndicator} className="flex items-center text-sm text-gray-600">
                              <ChevronRight className="h-4 w-4 text-blue-600 mr-1" />
                              {syndicator}
                            </div>
                          ))}
                          {selectedMarket.syndicators.length > 3 && (
                            <div className="text-sm text-gray-500">
                              +{selectedMarket.syndicators.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Browse Deals Link */}
                    <div className="pt-3 border-t">
                      <a
                        href={`/find?location=${encodeURIComponent(selectedMarket.city)}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Browse Deals
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  </div>
                </Popup>
              )}
            </Map>
          )}
        </div>

        {/* Controls Panel */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h2 className="text-lg font-bold mb-4">Market Filter</h2>
          
          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Markets
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="City, State"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Property Type Filter */}
            {propertyTypes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActivePropertyType(null)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      activePropertyType === null
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
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
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-8 left-4 bg-white rounded-lg shadow-lg p-4">
          <h3 className="font-medium mb-2">Deal Count</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <MapPin className="h-6 w-6 text-blue-800" fill="#1e40af" />
              <span className="ml-2 text-sm">10+ deals</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-blue-600" fill="#2563eb" />
              <span className="ml-2 text-sm">5-9 deals</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-blue-500" fill="#3b82f6" />
              <span className="ml-2 text-sm">3-4 deals</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-3 w-3 text-blue-400" fill="#60a5fa" />
              <span className="ml-2 text-sm">1-2 deals</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}