export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  user_type: 'investor' | 'syndicator';
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
  created_at: string;
  updated_at: string;
}

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
  verification_status: 'unverified' | 'verified' | 'featured' | 'premium';
  verification_notes: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  state: string | null;
  city: string | null;
  slug: string;
}

export interface Deal {
  id: string;
  syndicator_id: string;
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
  status: 'draft' | 'active' | 'closed' | 'archived';
  featured: boolean;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  slug: string;
}

export interface DealFile {
  id: string;
  deal_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  is_private: boolean;
  created_at: string;
}

export interface DealInterest {
  id: string;
  deal_id: string;
  investor_id: string;
  status: 'interested' | 'contacted' | 'invested' | 'passed';
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

export interface SyndicatorVerificationHistory {
  id: string;
  syndicator_id: string;
  previous_status: string | null;
  new_status: string;
  changed_by: string | null;
  admin_notes: string | null;
  created_at: string;
}