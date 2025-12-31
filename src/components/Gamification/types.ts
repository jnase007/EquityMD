// Gamification System Types & Achievement Definitions

export type UserRole = 'investor' | 'syndicator';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji or icon name
  category: 'profile' | 'engagement' | 'milestone' | 'social';
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string; // ISO date string when unlocked
  progress?: number; // 0-100 for progressive achievements
  maxProgress?: number;
  role: UserRole | 'both';
}

export interface UserLevel {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  icon: string;
}

export interface NextStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string; // Route or action name
  points: number;
  completed: boolean;
  priority: number; // Lower = higher priority
}

export interface GamificationState {
  totalPoints: number;
  level: number;
  achievements: Achievement[];
  streak: number;
  lastActiveDate: string;
}

// ============================================
// INVESTOR ACHIEVEMENTS
// ============================================
export const INVESTOR_ACHIEVEMENTS: Achievement[] = [
  // Profile Achievements
  {
    id: 'inv_first_steps',
    title: 'First Steps',
    description: 'Create your investor account',
    icon: '🎯',
    category: 'profile',
    points: 50,
    rarity: 'common',
    role: 'investor',
  },
  {
    id: 'inv_profile_photo',
    title: 'Picture Perfect',
    description: 'Add a profile photo',
    icon: '📸',
    category: 'profile',
    points: 25,
    rarity: 'common',
    role: 'investor',
  },
  {
    id: 'inv_profile_complete',
    title: 'All Set',
    description: 'Complete your investor profile (100%)',
    icon: '✅',
    category: 'profile',
    points: 100,
    rarity: 'uncommon',
    role: 'investor',
  },
  {
    id: 'inv_accredited',
    title: 'Accredited Investor',
    description: 'Verify your accredited investor status',
    icon: '🏆',
    category: 'profile',
    points: 150,
    rarity: 'rare',
    role: 'investor',
  },
  {
    id: 'inv_preferences_set',
    title: 'Know What You Want',
    description: 'Set your investment preferences',
    icon: '🎯',
    category: 'profile',
    points: 50,
    rarity: 'common',
    role: 'investor',
  },
  
  // Engagement Achievements
  {
    id: 'inv_first_browse',
    title: 'Window Shopping',
    description: 'Browse deals for the first time',
    icon: '👀',
    category: 'engagement',
    points: 25,
    rarity: 'common',
    role: 'investor',
  },
  {
    id: 'inv_first_favorite',
    title: 'Heart Eyes',
    description: 'Save your first deal to favorites',
    icon: '❤️',
    category: 'engagement',
    points: 30,
    rarity: 'common',
    role: 'investor',
  },
  {
    id: 'inv_favorites_5',
    title: 'Deal Collector',
    description: 'Save 5 deals to favorites',
    icon: '💝',
    category: 'engagement',
    points: 75,
    rarity: 'uncommon',
    role: 'investor',
  },
  {
    id: 'inv_first_interest',
    title: 'Interested Party',
    description: 'Express interest in a deal',
    icon: '🤝',
    category: 'engagement',
    points: 50,
    rarity: 'common',
    role: 'investor',
  },
  {
    id: 'inv_first_message',
    title: 'Conversation Starter',
    description: 'Send your first message to a syndicator',
    icon: '💬',
    category: 'social',
    points: 40,
    rarity: 'common',
    role: 'investor',
  },
  {
    id: 'inv_first_request',
    title: 'Making Moves',
    description: 'Submit your first investment request',
    icon: '💰',
    category: 'milestone',
    points: 200,
    rarity: 'rare',
    role: 'investor',
  },
  
  // Milestone Achievements
  {
    id: 'inv_deals_viewed_10',
    title: 'Due Diligence',
    description: 'View 10 different deals',
    icon: '🔍',
    category: 'milestone',
    points: 100,
    rarity: 'uncommon',
    role: 'investor',
  },
  {
    id: 'inv_syndicators_5',
    title: 'Network Builder',
    description: 'Connect with 5 different syndicators',
    icon: '🌐',
    category: 'social',
    points: 150,
    rarity: 'rare',
    role: 'investor',
  },
  {
    id: 'inv_early_adopter',
    title: 'Early Adopter',
    description: 'Join EquityMD in 2025',
    icon: '🚀',
    category: 'milestone',
    points: 100,
    rarity: 'epic',
    role: 'investor',
  },
  {
    id: 'inv_week_streak',
    title: 'Committed',
    description: 'Log in 7 days in a row',
    icon: '🔥',
    category: 'engagement',
    points: 75,
    rarity: 'uncommon',
    role: 'investor',
  },
];

// ============================================
// SYNDICATOR ACHIEVEMENTS
// ============================================
export const SYNDICATOR_ACHIEVEMENTS: Achievement[] = [
  // Profile Achievements
  {
    id: 'syn_first_steps',
    title: 'Welcome Aboard',
    description: 'Create your syndicator account',
    icon: '🎯',
    category: 'profile',
    points: 50,
    rarity: 'common',
    role: 'syndicator',
  },
  {
    id: 'syn_company_logo',
    title: 'Brand Identity',
    description: 'Upload your company logo',
    icon: '🏢',
    category: 'profile',
    points: 30,
    rarity: 'common',
    role: 'syndicator',
  },
  {
    id: 'syn_profile_complete',
    title: 'Professional',
    description: 'Complete your company profile (100%)',
    icon: '✅',
    category: 'profile',
    points: 100,
    rarity: 'uncommon',
    role: 'syndicator',
  },
  {
    id: 'syn_verified',
    title: 'Verified Syndicator',
    description: 'Get your syndicator profile verified',
    icon: '✔️',
    category: 'profile',
    points: 250,
    rarity: 'epic',
    role: 'syndicator',
  },
  {
    id: 'syn_website_added',
    title: 'Web Presence',
    description: 'Add your company website',
    icon: '🌐',
    category: 'profile',
    points: 25,
    rarity: 'common',
    role: 'syndicator',
  },
  
  // Listing Achievements
  {
    id: 'syn_first_listing',
    title: 'First Listing',
    description: 'Create your first investment listing',
    icon: '🏠',
    category: 'milestone',
    points: 100,
    rarity: 'uncommon',
    role: 'syndicator',
  },
  {
    id: 'syn_listing_published',
    title: 'Live Deal',
    description: 'Publish your first active listing',
    icon: '📢',
    category: 'milestone',
    points: 150,
    rarity: 'rare',
    role: 'syndicator',
  },
  {
    id: 'syn_listing_photos',
    title: 'Picture Perfect',
    description: 'Add 5+ photos to a listing',
    icon: '📷',
    category: 'engagement',
    points: 50,
    rarity: 'common',
    role: 'syndicator',
  },
  {
    id: 'syn_listings_3',
    title: 'Portfolio Builder',
    description: 'Create 3 investment listings',
    icon: '📊',
    category: 'milestone',
    points: 200,
    rarity: 'rare',
    role: 'syndicator',
  },
  
  // Engagement Achievements
  {
    id: 'syn_first_interest',
    title: 'Catching Eyes',
    description: 'Receive your first investor interest',
    icon: '👁️',
    category: 'engagement',
    points: 75,
    rarity: 'uncommon',
    role: 'syndicator',
  },
  {
    id: 'syn_interests_10',
    title: 'In Demand',
    description: 'Receive 10 investor interests',
    icon: '🔥',
    category: 'milestone',
    points: 200,
    rarity: 'rare',
    role: 'syndicator',
  },
  {
    id: 'syn_first_message',
    title: 'Responsive',
    description: 'Reply to your first investor message',
    icon: '💬',
    category: 'social',
    points: 40,
    rarity: 'common',
    role: 'syndicator',
  },
  {
    id: 'syn_quick_responder',
    title: 'Quick Responder',
    description: 'Reply to a message within 1 hour',
    icon: '⚡',
    category: 'social',
    points: 50,
    rarity: 'uncommon',
    role: 'syndicator',
  },
  {
    id: 'syn_first_approval',
    title: 'Deal Maker',
    description: 'Approve your first investment request',
    icon: '💰',
    category: 'milestone',
    points: 300,
    rarity: 'epic',
    role: 'syndicator',
  },
  
  // Milestone Achievements
  {
    id: 'syn_raised_100k',
    title: '$100K Club',
    description: 'Raise $100,000 in total investments',
    icon: '💵',
    category: 'milestone',
    points: 500,
    rarity: 'epic',
    role: 'syndicator',
  },
  {
    id: 'syn_raised_1m',
    title: 'Million Dollar Syndicator',
    description: 'Raise $1,000,000 in total investments',
    icon: '🏆',
    category: 'milestone',
    points: 1000,
    rarity: 'legendary',
    role: 'syndicator',
  },
  {
    id: 'syn_early_adopter',
    title: 'Pioneer',
    description: 'Join EquityMD in 2025',
    icon: '🚀',
    category: 'milestone',
    points: 100,
    rarity: 'epic',
    role: 'syndicator',
  },
];

// ============================================
// USER LEVELS
// ============================================
export const INVESTOR_LEVELS: UserLevel[] = [
  { level: 1, title: 'Newcomer', minPoints: 0, maxPoints: 100, color: 'gray', icon: '🌱' },
  { level: 2, title: 'Explorer', minPoints: 100, maxPoints: 250, color: 'blue', icon: '🔍' },
  { level: 3, title: 'Active Investor', minPoints: 250, maxPoints: 500, color: 'green', icon: '📈' },
  { level: 4, title: 'Seasoned Investor', minPoints: 500, maxPoints: 1000, color: 'purple', icon: '💎' },
  { level: 5, title: 'Elite Investor', minPoints: 1000, maxPoints: 2000, color: 'gold', icon: '👑' },
  { level: 6, title: 'Master Investor', minPoints: 2000, maxPoints: Infinity, color: 'platinum', icon: '🏆' },
];

export const SYNDICATOR_LEVELS: UserLevel[] = [
  { level: 1, title: 'New Syndicator', minPoints: 0, maxPoints: 150, color: 'gray', icon: '🌱' },
  { level: 2, title: 'Growing Syndicator', minPoints: 150, maxPoints: 400, color: 'emerald', icon: '📊' },
  { level: 3, title: 'Established Syndicator', minPoints: 400, maxPoints: 800, color: 'teal', icon: '🏢' },
  { level: 4, title: 'Top Syndicator', minPoints: 800, maxPoints: 1500, color: 'blue', icon: '⭐' },
  { level: 5, title: 'Elite Syndicator', minPoints: 1500, maxPoints: 3000, color: 'purple', icon: '💎' },
  { level: 6, title: 'Master Syndicator', minPoints: 3000, maxPoints: Infinity, color: 'gold', icon: '👑' },
];

// ============================================
// NEXT STEPS DEFINITIONS
// ============================================
export const INVESTOR_NEXT_STEPS: NextStep[] = [
  {
    id: 'complete_profile',
    title: 'Complete Your Profile',
    description: 'Add your photo and contact info',
    icon: '👤',
    action: '/profile',
    points: 50,
    completed: false,
    priority: 1,
  },
  {
    id: 'verify_accreditation',
    title: 'Verify Accreditation',
    description: 'Confirm your accredited investor status',
    icon: '✓',
    action: '/profile#accreditation',
    points: 100,
    completed: false,
    priority: 2,
  },
  {
    id: 'set_preferences',
    title: 'Set Preferences',
    description: 'Tell us what you\'re looking for',
    icon: '🎯',
    action: '/profile#preferences',
    points: 30,
    completed: false,
    priority: 3,
  },
  {
    id: 'browse_deals',
    title: 'Browse Opportunities',
    description: 'Explore active investment deals',
    icon: '🏠',
    action: '/browse',
    points: 25,
    completed: false,
    priority: 4,
  },
  {
    id: 'save_favorite',
    title: 'Save a Deal',
    description: 'Favorite a deal you\'re interested in',
    icon: '❤️',
    action: '/browse',
    points: 30,
    completed: false,
    priority: 5,
  },
  {
    id: 'contact_syndicator',
    title: 'Reach Out',
    description: 'Message a syndicator about a deal',
    icon: '💬',
    action: '/browse',
    points: 50,
    completed: false,
    priority: 6,
  },
];

export const SYNDICATOR_NEXT_STEPS: NextStep[] = [
  {
    id: 'complete_company_profile',
    title: 'Complete Company Profile',
    description: 'Add logo, description, and details',
    icon: '🏢',
    action: '/profile',
    points: 75,
    completed: false,
    priority: 1,
  },
  {
    id: 'add_website',
    title: 'Add Your Website',
    description: 'Link your company website',
    icon: '🌐',
    action: '/profile',
    points: 25,
    completed: false,
    priority: 2,
  },
  {
    id: 'create_listing',
    title: 'Create Your First Listing',
    description: 'List an investment opportunity',
    icon: '📝',
    action: '/deals/new',
    points: 100,
    completed: false,
    priority: 3,
  },
  {
    id: 'add_photos',
    title: 'Add Property Photos',
    description: 'Upload 5+ photos to your listing',
    icon: '📷',
    action: '/deals/new',
    points: 50,
    completed: false,
    priority: 4,
  },
  {
    id: 'publish_listing',
    title: 'Publish Your Deal',
    description: 'Make your listing live',
    icon: '🚀',
    action: '/dashboard',
    points: 75,
    completed: false,
    priority: 5,
  },
  {
    id: 'request_verification',
    title: 'Get Verified',
    description: 'Apply for verified status',
    icon: '✔️',
    action: '/profile#verification',
    points: 100,
    completed: false,
    priority: 6,
  },
];

// Helper function to get rarity color
export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common': return 'gray';
    case 'uncommon': return 'green';
    case 'rare': return 'blue';
    case 'epic': return 'purple';
    case 'legendary': return 'amber';
    default: return 'gray';
  }
}

// Helper function to get level from points
export function getLevelFromPoints(points: number, role: UserRole): UserLevel {
  const levels = role === 'investor' ? INVESTOR_LEVELS : SYNDICATOR_LEVELS;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].minPoints) {
      return levels[i];
    }
  }
  return levels[0];
}

// Helper function to get progress to next level
export function getProgressToNextLevel(points: number, role: UserRole): number {
  const currentLevel = getLevelFromPoints(points, role);
  const levels = role === 'investor' ? INVESTOR_LEVELS : SYNDICATOR_LEVELS;
  const currentIndex = levels.findIndex(l => l.level === currentLevel.level);
  
  if (currentIndex === levels.length - 1) return 100; // Max level
  
  const nextLevel = levels[currentIndex + 1];
  const pointsInLevel = points - currentLevel.minPoints;
  const pointsNeeded = nextLevel.minPoints - currentLevel.minPoints;
  
  return Math.min(100, Math.round((pointsInLevel / pointsNeeded) * 100));
}

