import type { Profile } from '../types/database';

export interface ProfileCompletionResult {
  percentage: number;
  completedFields: number;
  totalFields: number;
  missingFields: string[];
  nextSteps: string[];
}

interface InvestorProfile {
  accredited_status: boolean;
  minimum_investment: number | null;
  preferred_property_types: string[];
  preferred_locations: string[];
  investment_preferences: {
    experience_level?: string;
    years_investing?: string;
    bio?: string;
    phone_number?: string;
  } | null;
}

interface SyndicatorProfile {
  company_name: string;
  company_description: string | null;
  company_logo_url: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  years_in_business: number | null;
  total_deal_volume: number | null;
  city: string | null;
  state: string | null;
}

export function calculateProfileCompletion(
  profile: Profile,
  additionalProfile?: InvestorProfile | SyndicatorProfile
): ProfileCompletionResult {
  const missingFields: string[] = [];
  const nextSteps: string[] = [];
  let completedFields = 1; // Start at 1 for account creation (10%)
  let totalFields = 10; // Base total fields

  // Check basic profile fields (shared)
  if (profile.full_name) {
    completedFields++;
  } else {
    missingFields.push('Full Name');
    nextSteps.push('Add your full name');
  }

  if (profile.avatar_url) {
    completedFields++;
  } else {
    missingFields.push('Profile Picture');
    nextSteps.push('Upload a profile picture');
  }

  if (profile.phone_number) {
    completedFields++;
  } else {
    missingFields.push('Phone Number');
    nextSteps.push('Add your phone number');
  }

  // Type-specific fields
  if (profile.user_type === 'investor' && additionalProfile) {
    const investorProfile = additionalProfile as InvestorProfile;
    
    // Accreditation status
    completedFields++; // Always count this as it has a default

    // Investment preferences
    if (investorProfile.minimum_investment) {
      completedFields++;
    } else {
      missingFields.push('Investment Range');
      nextSteps.push('Set your investment range');
    }

    if (investorProfile.preferred_property_types?.length > 0) {
      completedFields++;
    } else {
      missingFields.push('Property Types');
      nextSteps.push('Select preferred property types');
    }

    if (investorProfile.preferred_locations?.length > 0) {
      completedFields++;
    } else {
      missingFields.push('Preferred Locations');
      nextSteps.push('Add preferred investment locations');
    }

    // Investment experience
    if (investorProfile.investment_preferences?.experience_level) {
      completedFields++;
    } else {
      missingFields.push('Experience Level');
      nextSteps.push('Indicate your experience level');
    }

    if (investorProfile.investment_preferences?.years_investing) {
      completedFields++;
    } else {
      missingFields.push('Years Investing');
      nextSteps.push('Add years of investing experience');
    }

    if (investorProfile.investment_preferences?.bio) {
      completedFields++;
    } else {
      missingFields.push('Bio');
      nextSteps.push('Write a brief bio');
    }

  } else if (profile.user_type === 'syndicator' && additionalProfile) {
    const syndicatorProfile = additionalProfile as SyndicatorProfile;
    totalFields = 12; // Syndicators have more fields
    
    // Company name is required
    if (syndicatorProfile.company_name) {
      completedFields++;
    } else {
      missingFields.push('Company Name');
      nextSteps.push('Add your company name');
    }

    if (syndicatorProfile.company_description) {
      completedFields++;
    } else {
      missingFields.push('Company Description');
      nextSteps.push('Write a company description');
    }

    if (syndicatorProfile.company_logo_url) {
      completedFields++;
    } else {
      missingFields.push('Company Logo');
      nextSteps.push('Upload your company logo');
    }

    if (syndicatorProfile.website_url) {
      completedFields++;
    } else {
      missingFields.push('Website URL');
      nextSteps.push('Add your website URL');
    }

    if (syndicatorProfile.linkedin_url) {
      completedFields++;
    } else {
      missingFields.push('LinkedIn URL');
      nextSteps.push('Add your LinkedIn profile');
    }

    if (syndicatorProfile.years_in_business) {
      completedFields++;
    } else {
      missingFields.push('Years in Business');
      nextSteps.push('Add years in business');
    }

    if (syndicatorProfile.total_deal_volume) {
      completedFields++;
    } else {
      missingFields.push('Total Deal Volume');
      nextSteps.push('Add your total deal volume');
    }

    if (syndicatorProfile.city && syndicatorProfile.state) {
      completedFields++;
    } else {
      missingFields.push('Location');
      nextSteps.push('Add your city and state');
    }
  }

  const percentage = Math.min(100, Math.round((completedFields / totalFields) * 100));

  return {
    percentage,
    completedFields,
    totalFields,
    missingFields,
    nextSteps: nextSteps.slice(0, 3) // Show top 3 next steps
  };
}

export function getCompletionBadgeColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-200';
  if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (percentage >= 40) return 'bg-orange-100 text-orange-800 border-orange-200';
  return 'bg-red-100 text-red-800 border-red-200';
}

export function getCompletionBadgeIcon(percentage: number): string {
  if (percentage >= 80) return '✓';
  if (percentage >= 60) return '⚡';
  if (percentage >= 40) return '��';
  return '🚀';
} 