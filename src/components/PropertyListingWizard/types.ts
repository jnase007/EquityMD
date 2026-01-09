// Types for the Property Listing Wizard

export interface PropertyFormData {
  // Basic Info
  title: string;
  propertyType: string;
  syndicatorId: string;
  
  // Location
  location: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  
  // Investment Details
  minimumInvestment: string;
  targetIrr: string;
  investmentTerm: string;
  totalEquity: string;
  preferredReturn: string;
  equityMultiple: string;
  closingDate: string; // ISO date string for investment deadline
  
  // Description & Highlights
  description: string;
  investmentHighlights: string[];
  
  // Media
  images: UploadedImage[];
  coverImageIndex: number;
  videoUrl: string; // YouTube or Vimeo URL
}

export interface UploadedImage {
  id: string;
  file?: File;
  url: string;
  preview: string;
  title: string;
  order: number;
  isUploading?: boolean;
  progress?: number;
}

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const PROPERTY_TYPES = [
  { value: 'Multi-Family', label: 'Multi-Family', icon: '🏢', description: 'Apartment buildings, duplexes, condos' },
  { value: 'Office', label: 'Office', icon: '🏬', description: 'Commercial office spaces' },
  { value: 'Retail', label: 'Retail', icon: '🏪', description: 'Shopping centers, storefronts' },
  { value: 'Industrial', label: 'Industrial', icon: '🏭', description: 'Warehouses, manufacturing' },
  { value: 'Medical', label: 'Medical', icon: '🏥', description: 'Medical offices, healthcare facilities' },
  { value: 'Student Housing', label: 'Student Housing', icon: '🎓', description: 'Near universities and colleges' },
  { value: 'Hospitality', label: 'Hospitality', icon: '🏨', description: 'Hotels, resorts, vacation rentals' },
  { value: 'Mixed-Use', label: 'Mixed-Use', icon: '🏗️', description: 'Combination of residential & commercial' },
];

export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

export const WIZARD_STEPS: WizardStep[] = [
  { id: 'basics', title: 'Property Basics', description: 'Name and type', icon: '🏠' },
  { id: 'location', title: 'Location', description: 'Where is it?', icon: '📍' },
  { id: 'investment', title: 'Investment Terms', description: 'Financial details', icon: '💰' },
  { id: 'details', title: 'Description', description: 'Tell your story', icon: '📝' },
  { id: 'media', title: 'Photos & Media', description: 'Show it off', icon: '📸' },
  { id: 'review', title: 'Review & Publish', description: 'Final check', icon: '✅' },
];

export const initialFormData: PropertyFormData = {
  title: '',
  propertyType: '',
  syndicatorId: '',
  location: '',
  address: {
    street: '',
    city: '',
    state: '',
    zip: ''
  },
  minimumInvestment: '',
  targetIrr: '',
  investmentTerm: '',
  totalEquity: '',
  preferredReturn: '',
  equityMultiple: '',
  closingDate: '',
  description: '',
  investmentHighlights: [''],
  images: [],
  coverImageIndex: 0,
  videoUrl: '',
};

// Helper to extract YouTube video ID - handles various URL formats
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/ // Just the video ID
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

// Helper to extract Vimeo video ID
export function extractVimeoId(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

// Check if URL looks like a valid video URL
export function isValidVideoUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
}

// Get video thumbnail URL
export function getVideoThumbnail(url: string): string | null {
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }
  // Vimeo requires API call for thumbnail, return null
  return null;
}

// Get embed URL for video
export function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}`;
  }
  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}`;
  }
  return null;
}

