export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  user_type?: "investor" | "syndicator"; // Now optional - profiles are user-centric
  is_verified: boolean;
  is_admin: boolean;
  sms_opt_in: boolean;
  sms_opt_in_timestamp: string | null;
  created_at: string;
  updated_at: string;
  email_notifications: {
    messages: boolean;
    deal_updates: boolean;
    investment_status: boolean;
  };
}

export interface InvestorProfile {
  id: string;
  accredited_status: boolean;
  accreditation_proof: string | null;
  investment_preferences: Record<string, any>;
  minimum_investment: number | null;
  preferred_property_types: string[];
  preferred_locations: string[];
  risk_tolerance: string | null;
  investment_goals: string | null;
  linkedin_url: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

// Legacy type for backwards compatibility
export interface SyndicatorProfile {
  id: string;
  company_name: string;
  company_description: string | null;
  company_logo_url: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  years_in_business: number | null;
  total_deal_volume: number | null;
  verification_documents: Record<string, any>;
  verification_status: "unverified" | "verified" | "featured" | "premium";
  verification_notes: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  state: string | null;
  city: string | null;
  slug: string;
}

// New Syndicator type that aligns with the refactored schema
export interface Syndicator {
  id: string;
  company_name: string;
  company_description: string | null;
  company_logo_url: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  years_in_business: number | null;
  total_deal_volume: number | null;
  verification_documents: Record<string, any>;
  verification_status: "unverified" | "verified" | "premier";
  average_rating: number;
  total_reviews: number;
  active_deals: number;
  specialties: string[];
  team_size: number;
  notable_projects: string[];
  investment_focus: string[];
  min_investment: number;
  target_markets: string[];
  certifications: string[];
  created_at: string;
  updated_at: string;
  state: string | null;
  city: string | null;
  slug: string | null;
  claimable: boolean;
  claimed_at: string | null;
  claimed_by: string | null; // References profiles.id
}

export interface Deal {
  id: string;
  syndicator_id: string; // Now references syndicators.id
  title: string;
  description: string | null;
  property_type: string;
  location: string;
  address: Record<string, any>;
  investment_highlights: string[];
  minimum_investment: number;
  target_irr: number;
  investment_term: number;
  total_equity: number;
  status: "draft" | "active" | "closed" | "archived";
  featured: boolean;
  highlighted: boolean;
  cover_image_url: string | null;
  media_urls?: string[];
  created_at: string;
  updated_at: string;
  slug: string;
}

export interface DealFile {
  name: string;
  url: string;
}

export interface DealInterest {
  id: string;
  deal_id: string;
  investor_id: string;
  status: "interested" | "contacted" | "invested" | "passed";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  investor_id: string;
  deal_id: string;
  created_at: string;
  updated_at: string;
}

export interface InvestmentRequest {
  id: string;
  deal_id: string;
  user_id: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  created_at: string;
  updated_at: string;
}

export interface SyndicatorVerificationHistory {
  id: string;
  syndicator_id: string; // References syndicators.id
  previous_status: string | null;
  new_status: string;
  changed_by: string | null; // References profiles.id
  admin_notes: string | null;
  created_at: string;
}

export interface SyndicatorClaimRequest {
  id: string;
  syndicator_id: string; // References syndicators.id
  requester_id: string; // References profiles.id
  company_email: string;
  company_website: string;
  proof_documents: Record<string, any>;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}
