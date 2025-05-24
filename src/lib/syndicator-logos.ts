// Temporary syndicator logo mapping until database can be updated via admin access
const SYNDICATOR_LOGO_MAP: Record<string, string> = {
  'Sutera Properties': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/suteraproperties.png`,
  'Back Bay Capital': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/syndicatorlogos/backbay.png`,
};

// Temporary location overrides for specific syndicators
const SYNDICATOR_LOCATION_MAP: Record<string, { city: string; state: string }> = {
  'Sutera Properties': { city: 'Nashville', state: 'TN' },
  'Back Bay Capital': { city: 'Newport Beach', state: 'CA' },
};

// Temporary description overrides for specific syndicators
const SYNDICATOR_DESCRIPTION_MAP: Record<string, string> = {
  'Sutera Properties': `Sutera is an emerging Multifamily Investment & Property Management firm based in Nashville, Tennessee focused on Value-Add Acquisitions and Management, primarily in the Southeast. Every aspect of our business is designed to create value and enrich the lives of our partners, team members and residents.

Our approach is characterized by strategic analytics, streamlined processes, transparent communication/reporting, and proactive cost-saving strategies while maintaining high service quality and experience-based living for our residents.`,
  'Back Bay Capital': `Back Bay Investment Group, Southern California's premier real estate investment and development firm, creates value in multifamily and residential assets utilizing our proven 4 step system consisting of identifying, acquiring, improving, and monetizing.

Our focus is on creating high-quality investments through real estate syndication as a way for investors to pool together their financial and intellectual resources to invest in multifamily and residential real estate properties that are much bigger than they could afford or manage on their own.

Our team of real estate professionals leverages their expertise and experience to deliver leading solutions to generate the maximal amount of value over time.development incentives to unlock untapped potential for rental growth as well as property appreciation. Back Bay Investment Group has applied this approach to investing across the Southern California market and across the US.
improve operational efficiency and maximize revenue.`
};

export function getSyndicatorLogo(companyName: string, currentLogoUrl?: string | null): string | null {
  // If there's already a logo URL set, use it
  if (currentLogoUrl) {
    // If it's a relative path, construct the full URL
    if (!currentLogoUrl.startsWith('http')) {
      return `${import.meta.env.VITE_SUPABASE_URL}${currentLogoUrl}`;
    }
    return currentLogoUrl;
  }

  // Check if we have a hardcoded logo for this syndicator
  return SYNDICATOR_LOGO_MAP[companyName] || null;
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