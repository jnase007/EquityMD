// Curated Real Estate Market Data
// Sources: Census Bureau, Bureau of Labor Statistics, HUD, Industry Reports
// Last Updated: Q4 2024

export interface MarketData {
  city: string;
  state: string;
  stateCode: string;
  slug: string;
  tier: 'primary' | 'secondary' | 'emerging';
  
  // Demographics (Source: Census Bureau 2023-2024)
  population: number;
  populationGrowth: number; // YoY percentage
  medianHouseholdIncome: number;
  
  // Employment (Source: Bureau of Labor Statistics)
  unemploymentRate: number;
  jobGrowth: number; // YoY percentage
  topIndustries: string[];
  
  // Real Estate Metrics (Source: Industry Reports Q4 2024)
  medianRent1BR: number;
  medianRent2BR: number;
  rentGrowthYoY: number; // percentage
  vacancyRate: number; // percentage
  capRateRange: { min: number; max: number };
  pricePerUnit: { min: number; max: number }; // typical range
  
  // Investment Score (0-100, composite of factors)
  investmentScore: number;
  
  // Market Highlights
  highlights: string[];
  risks: string[];
  
  // Data freshness
  lastUpdated: string;
}

export const MARKET_DATA: MarketData[] = [
  // TIER 1 - PRIMARY MARKETS (High Growth Sun Belt)
  {
    city: 'Nashville',
    state: 'Tennessee',
    stateCode: 'TN',
    slug: 'nashville',
    tier: 'primary',
    population: 715884,
    populationGrowth: 1.8,
    medianHouseholdIncome: 65610,
    unemploymentRate: 3.1,
    jobGrowth: 3.2,
    topIndustries: ['Healthcare', 'Music & Entertainment', 'Technology', 'Hospitality'],
    medianRent1BR: 1650,
    medianRent2BR: 1950,
    rentGrowthYoY: 4.2,
    vacancyRate: 6.8,
    capRateRange: { min: 5.0, max: 6.5 },
    pricePerUnit: { min: 180000, max: 280000 },
    investmentScore: 92,
    highlights: [
      'Fastest growing major metro in the Southeast',
      'Strong healthcare sector anchored by HCA and Vanderbilt',
      'No state income tax attracts high earners',
      'Diversified economy reduces recession risk'
    ],
    risks: [
      'New supply pipeline is elevated',
      'Affordability concerns as rents outpace income growth'
    ],
    lastUpdated: '2024-12-01'
  },
  {
    city: 'Austin',
    state: 'Texas',
    stateCode: 'TX',
    slug: 'austin',
    tier: 'primary',
    population: 1028225,
    populationGrowth: 2.1,
    medianHouseholdIncome: 80954,
    unemploymentRate: 3.4,
    jobGrowth: 2.8,
    topIndustries: ['Technology', 'Government', 'Education', 'Healthcare'],
    medianRent1BR: 1550,
    medianRent2BR: 1875,
    rentGrowthYoY: 2.1,
    vacancyRate: 8.2,
    capRateRange: { min: 5.0, max: 6.0 },
    pricePerUnit: { min: 200000, max: 320000 },
    investmentScore: 88,
    highlights: [
      'Major tech hub with Tesla, Apple, Google presence',
      'Strong population growth despite recent cooling',
      'State capital provides employment stability',
      'Young, educated workforce'
    ],
    risks: [
      'Significant new supply causing rent concessions',
      'Tech sector volatility affects demand'
    ],
    lastUpdated: '2024-12-01'
  },
  {
    city: 'Charlotte',
    state: 'North Carolina',
    stateCode: 'NC',
    slug: 'charlotte',
    tier: 'primary',
    population: 897720,
    populationGrowth: 1.9,
    medianHouseholdIncome: 68190,
    unemploymentRate: 3.5,
    jobGrowth: 2.6,
    topIndustries: ['Banking & Finance', 'Energy', 'Healthcare', 'Technology'],
    medianRent1BR: 1480,
    medianRent2BR: 1725,
    rentGrowthYoY: 3.8,
    vacancyRate: 6.2,
    capRateRange: { min: 5.25, max: 6.5 },
    pricePerUnit: { min: 160000, max: 250000 },
    investmentScore: 90,
    highlights: [
      'Second largest banking center in the US',
      'Strong in-migration from Northeast',
      'Lower cost of living than peer cities',
      'Business-friendly regulatory environment'
    ],
    risks: [
      'Competition from Raleigh-Durham',
      'Infrastructure strain from rapid growth'
    ],
    lastUpdated: '2024-12-01'
  },
  {
    city: 'Phoenix',
    state: 'Arizona',
    stateCode: 'AZ',
    slug: 'phoenix',
    tier: 'primary',
    population: 1650070,
    populationGrowth: 1.4,
    medianHouseholdIncome: 65740,
    unemploymentRate: 3.6,
    jobGrowth: 2.4,
    topIndustries: ['Technology', 'Healthcare', 'Financial Services', 'Manufacturing'],
    medianRent1BR: 1420,
    medianRent2BR: 1680,
    rentGrowthYoY: 2.8,
    vacancyRate: 7.5,
    capRateRange: { min: 5.25, max: 6.75 },
    pricePerUnit: { min: 170000, max: 260000 },
    investmentScore: 86,
    highlights: [
      'Major semiconductor manufacturing hub (TSMC, Intel)',
      'Strong retirement and healthcare sectors',
      'Affordable relative to California markets',
      'Consistent population growth'
    ],
    risks: [
      'Water scarcity concerns',
      'Elevated new construction pipeline'
    ],
    lastUpdated: '2024-12-01'
  },
  {
    city: 'Tampa',
    state: 'Florida',
    stateCode: 'FL',
    slug: 'tampa',
    tier: 'primary',
    population: 403364,
    populationGrowth: 1.6,
    medianHouseholdIncome: 58890,
    unemploymentRate: 3.2,
    jobGrowth: 2.9,
    topIndustries: ['Healthcare', 'Financial Services', 'Technology', 'Tourism'],
    medianRent1BR: 1620,
    medianRent2BR: 1920,
    rentGrowthYoY: 4.5,
    vacancyRate: 5.8,
    capRateRange: { min: 5.5, max: 7.0 },
    pricePerUnit: { min: 180000, max: 280000 },
    investmentScore: 89,
    highlights: [
      'No state income tax drives migration',
      'Growing tech and finance presence',
      'Strong healthcare employment base',
      'Favorable demographics with retiree migration'
    ],
    risks: [
      'Hurricane and flood insurance costs',
      'Property insurance market challenges'
    ],
    lastUpdated: '2024-12-01'
  },
  {
    city: 'Atlanta',
    state: 'Georgia',
    stateCode: 'GA',
    slug: 'atlanta',
    tier: 'primary',
    population: 510823,
    populationGrowth: 1.3,
    medianHouseholdIncome: 69164,
    unemploymentRate: 3.4,
    jobGrowth: 2.5,
    topIndustries: ['Logistics', 'Technology', 'Film & Entertainment', 'Healthcare'],
    medianRent1BR: 1680,
    medianRent2BR: 2050,
    rentGrowthYoY: 3.2,
    vacancyRate: 7.1,
    capRateRange: { min: 5.25, max: 6.75 },
    pricePerUnit: { min: 175000, max: 275000 },
    investmentScore: 87,
    highlights: [
      'Major logistics and distribution hub',
      'Busiest airport in the world drives commerce',
      'Growing film and entertainment industry',
      'Strong corporate headquarters presence'
    ],
    risks: [
      'Traffic congestion affects quality of life',
      'Suburban sprawl creates submarket disparity'
    ],
    lastUpdated: '2024-12-01'
  },
  
  // TIER 2 - SECONDARY MARKETS (Strong Fundamentals)
  {
    city: 'Raleigh',
    state: 'North Carolina',
    stateCode: 'NC',
    slug: 'raleigh',
    tier: 'secondary',
    population: 474069,
    populationGrowth: 2.3,
    medianHouseholdIncome: 74194,
    unemploymentRate: 2.9,
    jobGrowth: 3.1,
    topIndustries: ['Technology', 'Life Sciences', 'Education', 'Healthcare'],
    medianRent1BR: 1520,
    medianRent2BR: 1780,
    rentGrowthYoY: 4.8,
    vacancyRate: 5.5,
    capRateRange: { min: 5.0, max: 6.25 },
    pricePerUnit: { min: 175000, max: 270000 },
    investmentScore: 91,
    highlights: [
      'Research Triangle drives biotech/pharma growth',
      'Highly educated workforce',
      'Lower cost than Northeast tech hubs',
      'Strong university presence (Duke, NC State, UNC)'
    ],
    risks: [
      'Smaller market size limits liquidity',
      'Heavy reliance on tech/life sciences'
    ],
    lastUpdated: '2024-12-01'
  },
  {
    city: 'Orlando',
    state: 'Florida',
    stateCode: 'FL',
    slug: 'orlando',
    tier: 'secondary',
    population: 320742,
    populationGrowth: 1.8,
    medianHouseholdIncome: 55780,
    unemploymentRate: 3.1,
    jobGrowth: 3.4,
    topIndustries: ['Tourism', 'Healthcare', 'Technology', 'Aerospace'],
    medianRent1BR: 1580,
    medianRent2BR: 1850,
    rentGrowthYoY: 5.2,
    vacancyRate: 5.2,
    capRateRange: { min: 5.5, max: 7.0 },
    pricePerUnit: { min: 165000, max: 250000 },
    investmentScore: 88,
    highlights: [
      'Diversifying beyond tourism',
      'Growing tech and simulation industry',
      'No state income tax',
      'Strong population growth'
    ],
    risks: [
      'Tourism-dependent economy',
      'Hurricane exposure'
    ],
    lastUpdated: '2024-12-01'
  },
  {
    city: 'Denver',
    state: 'Colorado',
    stateCode: 'CO',
    slug: 'denver',
    tier: 'secondary',
    population: 727211,
    populationGrowth: 0.9,
    medianHouseholdIncome: 78177,
    unemploymentRate: 3.3,
    jobGrowth: 1.8,
    topIndustries: ['Technology', 'Aerospace', 'Energy', 'Healthcare'],
    medianRent1BR: 1720,
    medianRent2BR: 2150,
    rentGrowthYoY: 1.5,
    vacancyRate: 7.8,
    capRateRange: { min: 5.0, max: 6.25 },
    pricePerUnit: { min: 220000, max: 350000 },
    investmentScore: 82,
    highlights: [
      'Strong tech and aerospace presence',
      'High quality of life attracts talent',
      'Outdoor recreation lifestyle',
      'Educated workforce'
    ],
    risks: [
      'Elevated supply pipeline',
      'Affordability challenges',
      'Slowing growth compared to Sun Belt'
    ],
    lastUpdated: '2024-12-01'
  },
  {
    city: 'Dallas',
    state: 'Texas',
    stateCode: 'TX',
    slug: 'dallas',
    tier: 'secondary',
    population: 1355047,
    populationGrowth: 1.5,
    medianHouseholdIncome: 60987,
    unemploymentRate: 3.5,
    jobGrowth: 2.7,
    topIndustries: ['Financial Services', 'Technology', 'Healthcare', 'Telecommunications'],
    medianRent1BR: 1450,
    medianRent2BR: 1780,
    rentGrowthYoY: 2.4,
    vacancyRate: 7.2,
    capRateRange: { min: 5.25, max: 6.5 },
    pricePerUnit: { min: 150000, max: 240000 },
    investmentScore: 85,
    highlights: [
      'Corporate relocation magnet',
      'No state income tax',
      'Diverse economy',
      'Major transportation hub'
    ],
    risks: [
      'Significant new supply',
      'Suburban sprawl creates long commutes'
    ],
    lastUpdated: '2024-12-01'
  },
  {
    city: 'Miami',
    state: 'Florida',
    stateCode: 'FL',
    slug: 'miami',
    tier: 'secondary',
    population: 449514,
    populationGrowth: 0.8,
    medianHouseholdIncome: 51327,
    unemploymentRate: 2.8,
    jobGrowth: 2.2,
    topIndustries: ['Finance', 'International Trade', 'Tourism', 'Technology'],
    medianRent1BR: 2350,
    medianRent2BR: 3100,
    rentGrowthYoY: 3.8,
    vacancyRate: 5.5,
    capRateRange: { min: 4.5, max: 5.75 },
    pricePerUnit: { min: 280000, max: 450000 },
    investmentScore: 84,
    highlights: [
      'Gateway to Latin America',
      'Growing finance and tech presence',
      'No state income tax',
      'International appeal'
    ],
    risks: [
      'High property prices limit returns',
      'Insurance and flood risk',
      'Affordability crisis'
    ],
    lastUpdated: '2024-12-01'
  },
  {
    city: 'Salt Lake City',
    state: 'Utah',
    stateCode: 'UT',
    slug: 'salt-lake-city',
    tier: 'secondary',
    population: 212241,
    populationGrowth: 1.2,
    medianHouseholdIncome: 65880,
    unemploymentRate: 2.8,
    jobGrowth: 2.9,
    topIndustries: ['Technology', 'Healthcare', 'Finance', 'Outdoor Recreation'],
    medianRent1BR: 1380,
    medianRent2BR: 1650,
    rentGrowthYoY: 3.5,
    vacancyRate: 5.8,
    capRateRange: { min: 5.0, max: 6.25 },
    pricePerUnit: { min: 200000, max: 300000 },
    investmentScore: 87,
    highlights: [
      'Silicon Slopes tech corridor',
      'Young, growing population',
      'Strong job growth',
      'High quality of life'
    ],
    risks: [
      'Water scarcity concerns',
      'Limited geographic expansion'
    ],
    lastUpdated: '2024-12-01'
  },
  
  // TIER 3 - EMERGING/VALUE MARKETS
  {
    city: 'Charleston',
    state: 'South Carolina',
    stateCode: 'SC',
    slug: 'charleston',
    tier: 'emerging',
    population: 156042,
    populationGrowth: 1.9,
    medianHouseholdIncome: 72096,
    unemploymentRate: 3.0,
    jobGrowth: 2.8,
    topIndustries: ['Aerospace', 'Automotive', 'Tourism', 'Healthcare'],
    medianRent1BR: 1680,
    medianRent2BR: 2050,
    rentGrowthYoY: 4.5,
    vacancyRate: 5.5,
    capRateRange: { min: 5.5, max: 7.0 },
    pricePerUnit: { min: 175000, max: 275000 },
    investmentScore: 86,
    highlights: [
      'Boeing and Volvo manufacturing presence',
      'Strong tourism economy',
      'Growing tech scene',
      'High quality of life'
    ],
    risks: [
      'Small market size',
      'Flood and hurricane risk'
    ],
    lastUpdated: '2024-12-01'
  },
  {
    city: 'Jacksonville',
    state: 'Florida',
    stateCode: 'FL',
    slug: 'jacksonville',
    tier: 'emerging',
    population: 985843,
    populationGrowth: 1.4,
    medianHouseholdIncome: 58525,
    unemploymentRate: 3.3,
    jobGrowth: 2.5,
    topIndustries: ['Logistics', 'Financial Services', 'Healthcare', 'Military'],
    medianRent1BR: 1420,
    medianRent2BR: 1680,
    rentGrowthYoY: 4.2,
    vacancyRate: 6.2,
    capRateRange: { min: 5.75, max: 7.25 },
    pricePerUnit: { min: 140000, max: 220000 },
    investmentScore: 84,
    highlights: [
      'Major port and logistics hub',
      'Strong military presence (stable employment)',
      'More affordable than other FL metros',
      'No state income tax'
    ],
    risks: [
      'Lower income demographics',
      'Hurricane exposure'
    ],
    lastUpdated: '2024-12-01'
  },
  {
    city: 'Kansas City',
    state: 'Missouri',
    stateCode: 'MO',
    slug: 'kansas-city',
    tier: 'emerging',
    population: 508090,
    populationGrowth: 0.6,
    medianHouseholdIncome: 58146,
    unemploymentRate: 3.2,
    jobGrowth: 1.8,
    topIndustries: ['Logistics', 'Technology', 'Healthcare', 'Financial Services'],
    medianRent1BR: 1180,
    medianRent2BR: 1420,
    rentGrowthYoY: 3.8,
    vacancyRate: 6.5,
    capRateRange: { min: 6.0, max: 7.5 },
    pricePerUnit: { min: 100000, max: 165000 },
    investmentScore: 80,
    highlights: [
      'Major logistics and distribution center',
      'Growing tech sector (Google Fiber early adopter)',
      'Affordable entry point',
      'Stable Midwest economy'
    ],
    risks: [
      'Slower population growth',
      'Older housing stock'
    ],
    lastUpdated: '2024-12-01'
  },
  {
    city: 'Indianapolis',
    state: 'Indiana',
    stateCode: 'IN',
    slug: 'indianapolis',
    tier: 'emerging',
    population: 887642,
    populationGrowth: 0.8,
    medianHouseholdIncome: 55580,
    unemploymentRate: 3.4,
    jobGrowth: 2.1,
    topIndustries: ['Logistics', 'Healthcare', 'Technology', 'Manufacturing'],
    medianRent1BR: 1150,
    medianRent2BR: 1380,
    rentGrowthYoY: 4.5,
    vacancyRate: 6.0,
    capRateRange: { min: 6.0, max: 7.5 },
    pricePerUnit: { min: 95000, max: 155000 },
    investmentScore: 81,
    highlights: [
      'Central US logistics hub',
      'Growing tech presence (Salesforce)',
      'Very affordable market',
      'Strong healthcare sector (Eli Lilly)'
    ],
    risks: [
      'Slower growth than Sun Belt',
      'Older housing stock in urban core'
    ],
    lastUpdated: '2024-12-01'
  },
  {
    city: 'San Antonio',
    state: 'Texas',
    stateCode: 'TX',
    slug: 'san-antonio',
    tier: 'emerging',
    population: 1495295,
    populationGrowth: 1.2,
    medianHouseholdIncome: 56774,
    unemploymentRate: 3.6,
    jobGrowth: 2.3,
    topIndustries: ['Military', 'Healthcare', 'Cybersecurity', 'Tourism'],
    medianRent1BR: 1220,
    medianRent2BR: 1480,
    rentGrowthYoY: 3.2,
    vacancyRate: 7.0,
    capRateRange: { min: 5.75, max: 7.0 },
    pricePerUnit: { min: 120000, max: 190000 },
    investmentScore: 82,
    highlights: [
      'Major military presence provides stability',
      'Growing cybersecurity sector',
      'No state income tax',
      'More affordable than Austin/Dallas'
    ],
    risks: [
      'Lower income demographics',
      'Less tech-driven growth'
    ],
    lastUpdated: '2024-12-01'
  },
  {
    city: 'Columbus',
    state: 'Ohio',
    stateCode: 'OH',
    slug: 'columbus',
    tier: 'emerging',
    population: 913921,
    populationGrowth: 1.1,
    medianHouseholdIncome: 60988,
    unemploymentRate: 3.3,
    jobGrowth: 2.4,
    topIndustries: ['Insurance', 'Education', 'Technology', 'Healthcare'],
    medianRent1BR: 1180,
    medianRent2BR: 1420,
    rentGrowthYoY: 4.8,
    vacancyRate: 5.8,
    capRateRange: { min: 5.75, max: 7.0 },
    pricePerUnit: { min: 110000, max: 175000 },
    investmentScore: 83,
    highlights: [
      'Intel chip fab driving massive investment',
      'Ohio State University talent pipeline',
      'Growing tech and startup scene',
      'Affordable with strong fundamentals'
    ],
    risks: [
      'Midwest perception challenges',
      'Winter weather'
    ],
    lastUpdated: '2024-12-01'
  },
  {
    city: 'Richmond',
    state: 'Virginia',
    stateCode: 'VA',
    slug: 'richmond',
    tier: 'emerging',
    population: 230436,
    populationGrowth: 0.9,
    medianHouseholdIncome: 50849,
    unemploymentRate: 3.1,
    jobGrowth: 1.9,
    topIndustries: ['Finance', 'Government', 'Healthcare', 'Manufacturing'],
    medianRent1BR: 1350,
    medianRent2BR: 1580,
    rentGrowthYoY: 3.5,
    vacancyRate: 5.5,
    capRateRange: { min: 5.5, max: 6.75 },
    pricePerUnit: { min: 140000, max: 220000 },
    investmentScore: 79,
    highlights: [
      'State capital provides employment stability',
      'Growing Amazon presence',
      'Historic city with revitalization',
      'Proximity to DC without the prices'
    ],
    risks: [
      'Smaller market size',
      'Less growth than NC/GA metros'
    ],
    lastUpdated: '2024-12-01'
  },
  {
    city: 'Boise',
    state: 'Idaho',
    stateCode: 'ID',
    slug: 'boise',
    tier: 'emerging',
    population: 240713,
    populationGrowth: 1.5,
    medianHouseholdIncome: 64286,
    unemploymentRate: 3.0,
    jobGrowth: 2.6,
    topIndustries: ['Technology', 'Healthcare', 'Manufacturing', 'Agriculture'],
    medianRent1BR: 1280,
    medianRent2BR: 1520,
    rentGrowthYoY: 2.8,
    vacancyRate: 5.2,
    capRateRange: { min: 5.25, max: 6.5 },
    pricePerUnit: { min: 180000, max: 280000 },
    investmentScore: 84,
    highlights: [
      'California migration driving growth',
      'High quality of life',
      'Growing tech sector',
      'Low taxes'
    ],
    risks: [
      'Small market size',
      'Limited institutional liquidity',
      'Recent price appreciation reduces upside'
    ],
    lastUpdated: '2024-12-01'
  }
];

// National averages for comparison
export const NATIONAL_AVERAGES = {
  rentGrowthYoY: 2.8,
  vacancyRate: 6.5,
  capRate: 5.8,
  populationGrowth: 0.5,
  jobGrowth: 1.8,
  unemploymentRate: 3.7,
  lastUpdated: '2024-12-01'
};

// Data source citations
export const DATA_SOURCES = {
  population: 'U.S. Census Bureau, 2023 Estimates',
  employment: 'Bureau of Labor Statistics, November 2024',
  rent: 'HUD Fair Market Rents, Apartment List, Zillow Research',
  capRates: 'CBRE, Marcus & Millichap Q3 2024 Reports',
  general: 'Data compiled from public sources. Actual performance may vary.'
};

// Helper function to get market by slug
export function getMarketBySlug(slug: string): MarketData | undefined {
  return MARKET_DATA.find(m => m.slug === slug);
}

// Helper function to get markets by tier
export function getMarketsByTier(tier: 'primary' | 'secondary' | 'emerging'): MarketData[] {
  return MARKET_DATA.filter(m => m.tier === tier);
}

// Helper function to format currency
export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

// Helper function to get score color
export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
}

// Helper function to get score label
export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Strong';
  if (score >= 70) return 'Moderate';
  return 'Caution';
}

