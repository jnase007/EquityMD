// Temporary syndicator logo mapping until database can be updated via admin access
const SYNDICATOR_LOGO_MAP: Record<string, string> = {
  'Sutera Properties': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/sutera.png`,
  'Back Bay Capital': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/backbay.png`,
  'Starboard Realty': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/Starboard_reality.jpg`,
  'Clarion Partners': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/clarionpartners.png`,
  '37th Parallel Properties': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/37thParallelProperties.jpg`,
  'Summit Capital Partners': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/Summit.png`,
  'Horizon Investment Group': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/HorizonInvestmentGroup.png`,
  'Cardone Capital': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/Cardone.png`,
  'Blackstone Real Estate': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/BlackstoneRealEstate.png`,
  'Nuveen Real Estate': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/nuveen.png`,
  'Prologis': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/Prologis.png`,
  'DLP Capital': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/DLPCapital.png`,
  'Ashcroft Capital': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/AshcroftCapital.png`,
  'Simon Property Group': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/SimonPropertyGroup.png`,
  'Hunt Capital Partners': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/Hunt.png`,
  'WNC': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/WNC.png`,
  'Crow Holdings': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/Crow_Holdings_Logo_Stacked_08-2021.jpg`,
};

// Temporary location overrides for specific syndicators
const SYNDICATOR_LOCATION_MAP: Record<string, { city: string; state: string }> = {
  'Sutera Properties': { city: 'Nashville', state: 'TN' },
  'Back Bay Capital': { city: 'Newport Beach', state: 'CA' },
  'Starboard Realty': { city: 'Irvine', state: 'CA' },
};

// Temporary description overrides for specific syndicators
const SYNDICATOR_DESCRIPTION_MAP: Record<string, string> = {
  'Sutera Properties': `Sutera is an emerging Multifamily Investment & Property Management firm based in Nashville, Tennessee focused on Value-Add Acquisitions and Management, primarily in the Southeast. Every aspect of our business is designed to create value and enrich the lives of our partners, team members and residents.

Our approach is characterized by strategic analytics, streamlined processes, transparent communication/reporting, and proactive cost-saving strategies while maintaining high service quality and experience-based living for our residents.`,
  'Back Bay Capital': `Back Bay Investment Group, Southern California's premier real estate investment and development firm, creates value in multifamily and residential assets utilizing our proven 4 step system consisting of identifying, acquiring, improving, and monetizing.

Our focus is on creating high-quality investments through real estate syndication as a way for investors to pool together their financial and intellectual resources to invest in multifamily and residential real estate properties that are much bigger than they could afford or manage on their own.

Our team of real estate professionals leverages their expertise and experience to deliver leading solutions to generate the maximal amount of value over time.development incentives to unlock untapped potential for rental growth as well as property appreciation. Back Bay Investment Group has applied this approach to investing across the Southern California market and across the US.
improve operational efficiency and maximize revenue.`,
  'Starboard Realty': `Headquartered in Irvine, California, Starboard Realty Advisors, LLC, is a privately held, fully-integrated real estate firm, whose principals have more than 30 years of hands-on, cycle-tested experience in acquiring, developing, leasing, repositioning, managing, financing and disposing of retail, multifamily, office and industrial real estate. Starboard acquires multifamily, multi-tenant retail shopping centers, and NNN lease properties. Starboard's mission is to acquire well-located properties across the U.S., in which current rents have growth potential and which can be acquired at below replacement cost. Starboard acquires primarily stabilized properties with a 7- to 10-year hold period for its 1031 exchange clients and value added properties with a 1- to 5-year hold.`
};

export function getSyndicatorLogo(companyName: string, currentLogoUrl?: string | null): string | null {
  // FIRST check if we have a hardcoded logo for this syndicator (these are verified working)
  if (SYNDICATOR_LOGO_MAP[companyName]) {
    return SYNDICATOR_LOGO_MAP[companyName];
  }
  
  // If there's a logo URL set in database, use it
  if (currentLogoUrl) {
    // If it's a relative path, construct the full URL
    if (!currentLogoUrl.startsWith('http')) {
      return `${import.meta.env.VITE_SUPABASE_URL}${currentLogoUrl}`;
    }
    return currentLogoUrl;
  }

  return null;
}

export function getSyndicatorLocation(companyName: string, currentCity?: string, currentState?: string): { city: string; state: string } {
  // Check if we have a location override for this syndicator
  const override = SYNDICATOR_LOCATION_MAP[companyName];
  if (override) {
    return override;
  }

  // Return current location or defaults
  return {
    city: currentCity || 'Unknown',
    state: currentState || 'Unknown'
  };
}

export function getSyndicatorDescription(companyName: string, currentDescription?: string | null): string {
  // Check if we have a description override for this syndicator
  const override = SYNDICATOR_DESCRIPTION_MAP[companyName];
  if (override) {
    return override;
  }

  // Return current description or default
  return currentDescription || 'No description available.';
} 