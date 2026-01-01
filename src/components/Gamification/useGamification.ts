import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import {
  Achievement,
  NextStep,
  UserRole,
  INVESTOR_ACHIEVEMENTS,
  SYNDICATOR_ACHIEVEMENTS,
  INVESTOR_NEXT_STEPS,
  SYNDICATOR_NEXT_STEPS,
  getLevelFromPoints,
  getProgressToNextLevel,
} from './types';

interface GamificationData {
  totalPoints: number;
  achievements: Achievement[];
  nextSteps: NextStep[];
  streak: number;
  level: ReturnType<typeof getLevelFromPoints>;
  progressToNextLevel: number;
  achievementCount: number;
  totalAchievements: number;
  isLoading: boolean;
  newAchievement: Achievement | null;
  clearNewAchievement: () => void;
  refreshData: () => Promise<void>;
}

const STORAGE_KEY = 'equitymd_gamification';

interface StoredGamificationData {
  unlockedAchievements: string[];
  lastActiveDate: string;
  streak: number;
  viewedDeals: string[];
  totalPoints: number;
}

function getStoredData(userId: string): StoredGamificationData {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading gamification data:', e);
  }
  return {
    unlockedAchievements: [],
    lastActiveDate: '',
    streak: 0,
    viewedDeals: [],
    totalPoints: 0,
  };
}

function saveStoredData(userId: string, data: StoredGamificationData): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving gamification data:', e);
  }
}

export function useGamification(): GamificationData {
  const { user, profile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [storedData, setStoredData] = useState<StoredGamificationData | null>(null);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [syndicator, setSyndicator] = useState<any>(null);
  const [investorProfile, setInvestorProfile] = useState<any>(null);
  
  // Safe defaults when profile isn't loaded yet
  const userRole: UserRole = profile?.user_type === 'syndicator' ? 'syndicator' : 'investor';
  const baseAchievements = userRole === 'investor' ? INVESTOR_ACHIEVEMENTS : SYNDICATOR_ACHIEVEMENTS;
  const baseNextSteps = userRole === 'investor' ? INVESTOR_NEXT_STEPS : SYNDICATOR_NEXT_STEPS;

  // Return early with safe defaults if user or profile isn't ready
  const isReady = !!user?.id && !!profile;

  // Fetch syndicator or investor profile data
  useEffect(() => {
    async function fetchProfileData() {
      if (!isReady) {
        setIsLoading(false);
        return;
      }
      
      try {
        if (profile!.user_type === 'syndicator') {
          // Fetch syndicator profile
          const { data, error } = await supabase
            .from('syndicators')
            .select('*')
            .eq('claimed_by', user!.id)
            .maybeSingle();
          if (!error) setSyndicator(data);
        } else {
          // Fetch investor profile
          const { data, error } = await supabase
            .from('investor_profiles')
            .select('*')
            .eq('id', user!.id)
            .maybeSingle();
          if (!error) setInvestorProfile(data);
        }
      } catch (e) {
        console.error('Error fetching profile data for gamification:', e);
      }
    }
    
    fetchProfileData();
  }, [isReady, user?.id, profile?.user_type]);

  // Calculate which achievements are unlocked based on profile data
  const calculateUnlockedAchievements = useCallback(async (): Promise<string[]> => {
    if (!user || !profile) return [];
    
    const unlocked: string[] = [];
    
    if (userRole === 'investor') {
      // Profile achievements
      unlocked.push('inv_first_steps'); // They have an account
      
      if (profile.avatar_url) {
        unlocked.push('inv_profile_photo');
      }
      
      if (investorProfile) {
        // Check profile completeness
        const hasPreferences = investorProfile.preferred_property_types?.length > 0 ||
          investorProfile.investment_range_min || investorProfile.preferred_locations?.length > 0;
        if (hasPreferences) {
          unlocked.push('inv_preferences_set');
        }
        
        if (investorProfile.accreditation_status === 'verified') {
          unlocked.push('inv_accredited');
        }
        
        // Check for complete profile
        if (profile.full_name && profile.avatar_url && hasPreferences) {
          unlocked.push('inv_profile_complete');
        }
      }
      
      // Check engagement - favorites
      try {
        const { count: favCount } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (favCount && favCount > 0) {
          unlocked.push('inv_first_favorite');
          unlocked.push('inv_first_browse');
        }
        if (favCount && favCount >= 5) {
          unlocked.push('inv_favorites_5');
        }
      } catch (e) {
        console.error('Error checking favorites:', e);
      }
      
      // Check messages
      try {
        const { count: msgCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', user.id);
        
        if (msgCount && msgCount > 0) {
          unlocked.push('inv_first_message');
        }
      } catch (e) {
        console.error('Error checking messages:', e);
      }
      
      // Check interest requests
      try {
        const { count: interestCount } = await supabase
          .from('interest_requests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (interestCount && interestCount > 0) {
          unlocked.push('inv_first_interest');
        }
      } catch (e) {
        console.error('Error checking interests:', e);
      }
      
      // Check investment requests
      try {
        const { count: reqCount } = await supabase
          .from('investment_requests')
          .select('*', { count: 'exact', head: true })
          .eq('investor_id', user.id);
        
        if (reqCount && reqCount > 0) {
          unlocked.push('inv_first_request');
        }
      } catch (e) {
        console.error('Error checking investment requests:', e);
      }
      
      // Early adopter check (joined in 2025)
      const joinDate = new Date(profile.created_at);
      if (joinDate.getFullYear() <= 2025) {
        unlocked.push('inv_early_adopter');
      }
      
    } else {
      // Syndicator achievements
      unlocked.push('syn_first_steps'); // They have an account
      
      if (syndicator) {
        if (syndicator.logo_url) {
          unlocked.push('syn_company_logo');
        }
        
        if (syndicator.website) {
          unlocked.push('syn_website_added');
        }
        
        if (syndicator.is_verified) {
          unlocked.push('syn_verified');
        }
        
        // Check for complete profile
        if (syndicator.company_name && syndicator.logo_url && syndicator.description && syndicator.website) {
          unlocked.push('syn_profile_complete');
        }
        
        // Check deals
        try {
          const { data: deals, count: dealCount } = await supabase
            .from('deals')
            .select('*', { count: 'exact' })
            .eq('syndicator_id', syndicator.id);
          
          if (dealCount && dealCount > 0) {
            unlocked.push('syn_first_listing');
            
            // Check for published deals
            const publishedDeals = deals?.filter(d => d.status === 'active');
            if (publishedDeals && publishedDeals.length > 0) {
              unlocked.push('syn_listing_published');
            }
            
            // Check for deals with 5+ images
            const dealsWithPhotos = deals?.filter(d => d.images && d.images.length >= 5);
            if (dealsWithPhotos && dealsWithPhotos.length > 0) {
              unlocked.push('syn_listing_photos');
            }
          }
          if (dealCount && dealCount >= 3) {
            unlocked.push('syn_listings_3');
          }
        } catch (e) {
          console.error('Error checking deals:', e);
        }
        
        // Check interest received
        try {
          const { count: interestCount } = await supabase
            .from('interest_requests')
            .select('*', { count: 'exact', head: true })
            .eq('syndicator_id', syndicator.id);
          
          if (interestCount && interestCount > 0) {
            unlocked.push('syn_first_interest');
          }
          if (interestCount && interestCount >= 10) {
            unlocked.push('syn_interests_10');
          }
        } catch (e) {
          console.error('Error checking interests received:', e);
        }
        
        // Check messages sent (replies)
        try {
          const { count: msgCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', user.id);
          
          if (msgCount && msgCount > 0) {
            unlocked.push('syn_first_message');
          }
        } catch (e) {
          console.error('Error checking messages:', e);
        }
        
        // Check investment approvals
        try {
          const { count: approvalCount } = await supabase
            .from('investment_requests')
            .select('*', { count: 'exact', head: true })
            .eq('syndicator_id', syndicator.id)
            .eq('status', 'approved');
          
          if (approvalCount && approvalCount > 0) {
            unlocked.push('syn_first_approval');
          }
        } catch (e) {
          console.error('Error checking approvals:', e);
        }
      }
      
      // Early adopter check
      const joinDate = new Date(profile.created_at);
      if (joinDate.getFullYear() <= 2025) {
        unlocked.push('syn_early_adopter');
      }
    }
    
    return unlocked;
  }, [user, profile, investorProfile, syndicator, userRole]);

  // Calculate next steps completion status
  const calculateNextSteps = useCallback((): NextStep[] => {
    if (!profile) return baseNextSteps;
    
    if (userRole === 'investor') {
      return baseNextSteps.map(step => {
        let completed = false;
        
        switch (step.id) {
          case 'complete_profile':
            completed = !!(profile.full_name && profile.avatar_url && profile.phone_number);
            break;
          case 'verify_accreditation':
            completed = investorProfile?.accreditation_status === 'verified';
            break;
          case 'set_preferences':
            completed = !!(investorProfile?.preferred_property_types?.length || 
              investorProfile?.investment_range_min || 
              investorProfile?.preferred_locations?.length);
            break;
          // Other steps would need async data - mark as not completed for now
          default:
            completed = false;
        }
        
        return { ...step, completed };
      });
    } else {
      return baseNextSteps.map(step => {
        let completed = false;
        
        switch (step.id) {
          case 'complete_company_profile':
            completed = !!(syndicator?.company_name && syndicator?.logo_url && syndicator?.description);
            break;
          case 'add_website':
            completed = !!syndicator?.website;
            break;
          // Other steps would need async data
          default:
            completed = false;
        }
        
        return { ...step, completed };
      });
    }
  }, [profile, investorProfile, syndicator, userRole, baseNextSteps]);

  // Load and refresh data
  const refreshData = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    
    try {
      // Get stored data
      const stored = getStoredData(user.id);
      
      // Calculate current unlocked achievements
      const currentUnlocked = await calculateUnlockedAchievements();
      
      // Find new achievements (not in stored but now unlocked)
      const newUnlocked = currentUnlocked.filter(id => !stored.unlockedAchievements.includes(id));
      
      // Update streak
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      let newStreak = stored.streak;
      
      if (stored.lastActiveDate === yesterday) {
        newStreak = stored.streak + 1;
      } else if (stored.lastActiveDate !== today) {
        newStreak = 1;
      }
      
      // Calculate total points from unlocked achievements
      const totalPoints = currentUnlocked.reduce((sum, id) => {
        const achievement = baseAchievements.find(a => a.id === id);
        return sum + (achievement?.points || 0);
      }, 0);
      
      // Update stored data
      const newStoredData: StoredGamificationData = {
        ...stored,
        unlockedAchievements: currentUnlocked,
        lastActiveDate: today,
        streak: newStreak,
        totalPoints,
      };
      
      saveStoredData(user.id, newStoredData);
      setStoredData(newStoredData);
      
      // Show new achievement notification
      if (newUnlocked.length > 0) {
        const firstNewAchievement = baseAchievements.find(a => a.id === newUnlocked[0]);
        if (firstNewAchievement) {
          setNewAchievement({
            ...firstNewAchievement,
            unlockedAt: new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      console.error('Error refreshing gamification data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, calculateUnlockedAchievements, baseAchievements]);

  // Initial load and refresh when profile data changes
  useEffect(() => {
    if (user?.id && (syndicator || investorProfile || profile)) {
      refreshData();
    }
  }, [user?.id, profile, investorProfile, syndicator, refreshData]);

  // Build achievements with unlock status
  const achievements = useMemo((): Achievement[] => {
    if (!storedData) return baseAchievements;
    
    return baseAchievements.map(achievement => ({
      ...achievement,
      unlockedAt: storedData.unlockedAchievements.includes(achievement.id)
        ? new Date().toISOString()
        : undefined,
    }));
  }, [baseAchievements, storedData]);

  const nextSteps = useMemo(() => calculateNextSteps(), [calculateNextSteps]);
  
  const totalPoints = storedData?.totalPoints || 0;
  const level = getLevelFromPoints(totalPoints, userRole);
  const progressToNextLevel = getProgressToNextLevel(totalPoints, userRole);
  const achievementCount = achievements.filter(a => a.unlockedAt).length;

  return {
    totalPoints,
    achievements,
    nextSteps,
    streak: storedData?.streak || 0,
    level,
    progressToNextLevel,
    achievementCount,
    totalAchievements: baseAchievements.length,
    isLoading,
    newAchievement,
    clearNewAchievement: () => setNewAchievement(null),
    refreshData,
  };
}

