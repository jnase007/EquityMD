// Gamification System Types & Achievement Definitions

export type UserRole = 'investor' | 'syndicator';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  celebrationTitle?: string; // More exciting title for the popup
  celebrationMessage?: string; // Celebratory message for the popup
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
    celebrationTitle: "You're In! 🎉",
    celebrationMessage: "Welcome to EquityMD! Your journey to building wealth through real estate starts now.",
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
    celebrationTitle: "Looking Good! 📸",
    celebrationMessage: "Syndicators are 3x more likely to respond to investors with profile photos!",
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
    celebrationTitle: "Profile Complete! ✨",
    celebrationMessage: "You're now in the top 15% of investors. Syndicators love complete profiles!",
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
    celebrationTitle: "Verified & Ready! 🏆",
    celebrationMessage: "You now have full access to all investment opportunities. Time to find your next deal!",
    icon: '🏆',
    category: 'profile',
    points: 150,
    rarity: 'rare',
    role: 'investor',
  },
  {
    id: 'inv_preferences_set',
    title: 'Investment Goals Set',
    description: 'Set your investment preferences',
    celebrationTitle: "Goals Locked In! 🎯",
    celebrationMessage: "We'll now show you deals that match YOUR criteria. Smart investing starts here!",
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
    celebrationTitle: "Exploring! 👀",
    celebrationMessage: "You've started browsing deals. Each one is a potential wealth-building opportunity!",
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
    celebrationTitle: "Found a Gem! ❤️",
    celebrationMessage: "Great eye! Saving deals helps you track opportunities and compare options.",
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
    celebrationTitle: "Building Your Watchlist! 💝",
    celebrationMessage: "You're doing your homework! 5 deals saved means you're serious about finding the right fit.",
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
    celebrationTitle: "Taking Action! 🤝",
    celebrationMessage: "You've made your first move! The syndicator has been notified of your interest.",
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
    celebrationTitle: "Making Connections! 💬",
    celebrationMessage: "Building relationships is key in real estate. Great job reaching out!",
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
    celebrationTitle: "Big Step Forward! 💰",
    celebrationMessage: "You've submitted your first investment request! This is how wealth is built.",
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
    celebrationTitle: "Research Mode! 🔍",
    celebrationMessage: "You've reviewed 10 deals! Smart investors do their homework. Keep going!",
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
    celebrationTitle: "Power Networker! 🌐",
    celebrationMessage: "You're building a powerful network! Great syndicators lead to great deals.",
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
    celebrationTitle: "OG Status! 🚀",
    celebrationMessage: "You're one of our founding members! Early adopters get the best opportunities.",
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
    celebrationTitle: "On Fire! 🔥",
    celebrationMessage: "7 days straight! Consistency is the key to finding the perfect deal.",
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
    celebrationTitle: "You're In! 🎉",
    celebrationMessage: "Welcome to EquityMD! Start building your investor network today.",
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
    celebrationTitle: "Looking Professional! 🏢",
    celebrationMessage: "Your brand is now visible! Investors trust syndicators with strong branding.",
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
    celebrationTitle: "Profile Complete! ✨",
    celebrationMessage: "You're in the top 10% of syndicators! Complete profiles get 5x more interest.",
    icon: '✅',
    category: 'profile',
    points: 100,
    rarity: 'uncommon',
    role: 'syndicator',
  },
  {
    id: 'syn_verified',
    title: 'Verified Identity',
    description: 'Get your syndicator profile verified',
    celebrationTitle: "Verified! ✔️",
    celebrationMessage: "You now have the trusted verification badge. Your identity has been confirmed!",
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
    celebrationTitle: "Connected! 🌐",
    celebrationMessage: "Investors can now learn more about you. Great for building trust!",
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
    celebrationTitle: "First Deal Created! 🏠",
    celebrationMessage: "Your first listing is ready! Add details and photos to attract investors.",
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
    celebrationTitle: "You're Live! 📢",
    celebrationMessage: "Investors can now see your deal! Time to start raising capital.",
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
    celebrationTitle: "Showcase Ready! 📷",
    celebrationMessage: "Listings with 5+ photos get 3x more investor interest. Great job!",
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
    celebrationTitle: "Growing Portfolio! 📊",
    celebrationMessage: "3 deals and counting! You're becoming a power player on EquityMD.",
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
    celebrationTitle: "Investors Interested! 👁️",
    celebrationMessage: "Your first investor showed interest! Reach out quickly to make a connection.",
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
    celebrationTitle: "You're Popular! 🔥",
    celebrationMessage: "10 investors are interested! Your deals are getting serious attention.",
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
    celebrationTitle: "Making Connections! 💬",
    celebrationMessage: "Fast responses build trust. You're on your way to closing deals!",
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
    celebrationTitle: "Lightning Fast! ⚡",
    celebrationMessage: "Under 1 hour response! Investors love syndicators who respond quickly.",
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
    celebrationTitle: "First Investor! 💰",
    celebrationMessage: "You've approved your first investor! This is how syndications are built.",
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
    celebrationTitle: "Six Figures! 💵",
    celebrationMessage: "You've raised over $100K through EquityMD! You're a true deal maker.",
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
    celebrationTitle: "MILLION DOLLAR CLUB! 🏆",
    celebrationMessage: "You've raised over $1 MILLION! You're among the elite syndicators on EquityMD!",
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
    celebrationTitle: "OG Syndicator! 🚀",
    celebrationMessage: "You're one of our founding syndicators! Thank you for being here from the start.",
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

