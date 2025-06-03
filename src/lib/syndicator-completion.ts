interface SyndicatorProfile {
  company_name: string;
  company_description: string | null;
  company_logo_url: string | null;
  state: string | null;
  city: string | null;
  website_url: string | null;
  years_in_business: number | null;
  total_deal_volume: number | null;
}

interface CompletionResult {
  percentage: number;
  isComplete: boolean;
  missingFields: string[];
}

/**
 * Calculate the completion percentage of a syndicator profile
 */
export function calculateProfileCompletion(profile: SyndicatorProfile): CompletionResult {
  const requiredFields = [
    { key: 'company_name', label: 'Company Name', weight: 25 },
    { key: 'company_description', label: 'Company Description', weight: 20 },
    { key: 'state', label: 'State', weight: 15 },
    { key: 'city', label: 'City', weight: 15 },
    { key: 'website_url', label: 'Website URL', weight: 10 },
    { key: 'years_in_business', label: 'Years in Business', weight: 10 },
    { key: 'company_logo_url', label: 'Company Logo', weight: 5 }
  ];

  let completedWeight = 0;
  const missingFields: string[] = [];

  requiredFields.forEach(field => {
    const value = profile[field.key as keyof SyndicatorProfile];
    const isComplete = value !== null && value !== undefined && value !== '';
    
    if (isComplete) {
      // Additional validation for specific fields
      if (field.key === 'company_description' && typeof value === 'string' && value.length < 50) {
        missingFields.push(`${field.label} (needs at least 50 characters)`);
        return;
      }
      if (field.key === 'company_name' && typeof value === 'string' && value.length < 3) {
        missingFields.push(`${field.label} (too short)`);
        return;
      }
      
      completedWeight += field.weight;
    } else {
      missingFields.push(field.label);
    }
  });

  const percentage = completedWeight;
  
  // Require at least 80% completion to be listed in directory
  const isComplete = percentage >= 80 && 
    profile.company_name && 
    profile.company_name.length >= 3 &&
    profile.state && 
    profile.city &&
    profile.company_description && 
    profile.company_description.length >= 50;

  return {
    percentage,
    isComplete,
    missingFields
  };
}

/**
 * Check if a syndicator profile is complete enough for directory listing
 */
export function isProfileCompleteForDirectory(profile: SyndicatorProfile): boolean {
  return calculateProfileCompletion(profile).isComplete;
}

/**
 * Get a user-friendly completion status message
 */
export function getCompletionStatusMessage(profile: SyndicatorProfile): string {
  const { percentage, missingFields } = calculateProfileCompletion(profile);
  
  if (percentage >= 80) {
    return "Profile complete! Visible in directory.";
  } else if (percentage >= 60) {
    return `Profile ${percentage}% complete. Complete your profile to appear in the directory.`;
  } else {
    return `Profile ${percentage}% complete. Please add: ${missingFields.slice(0, 3).join(', ')}${missingFields.length > 3 ? ', and more' : ''}.`;
  }
} 