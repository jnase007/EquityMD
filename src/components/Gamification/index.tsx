// Gamification System - Main Export
export * from './types';
export * from './AchievementBadge';
export * from './AchievementUnlocked';
export * from './ProgressCard';
export * from './NextSteps';
export * from './AchievementsModal';
export * from './useGamification';

import React, { useState } from 'react';
import { useGamification } from './useGamification';
import { ProgressCard } from './ProgressCard';
import { NextStepsCard, WelcomeBackCard } from './NextSteps';
import { AchievementsModal } from './AchievementsModal';
import { AchievementUnlocked, LevelUpCelebration } from './AchievementUnlocked';
import { useAuthStore } from '../../lib/store';

// Full gamification dashboard component
export function GamificationDashboard() {
  const { profile } = useAuthStore();
  const gamification = useGamification();
  const [showAchievements, setShowAchievements] = useState(false);
  
  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const nextIncomplete = gamification.nextSteps.find(s => !s.completed);

  return (
    <div className="space-y-6">
      {/* Welcome back card */}
      <WelcomeBackCard
        userName={firstName}
        streak={gamification.streak}
        todayPoints={0}
        nextStep={nextIncomplete}
      />
      
      {/* Stats and level */}
      <ProgressCard
        totalPoints={gamification.totalPoints}
        role={profile?.user_type === 'syndicator' ? 'syndicator' : 'investor'}
        streak={gamification.streak}
        achievementCount={gamification.achievementCount}
        totalAchievements={gamification.totalAchievements}
        onViewAchievements={() => setShowAchievements(true)}
      />
      
      {/* Next steps */}
      <NextStepsCard
        steps={gamification.nextSteps}
        title="Your Journey"
        subtitle="Complete these to level up"
      />
      
      {/* Achievements modal */}
      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        achievements={gamification.achievements}
        totalPoints={gamification.totalPoints}
      />
      
      {/* Achievement unlock celebration */}
      {gamification.newAchievement && (
        <AchievementUnlocked
          achievement={gamification.newAchievement}
          onClose={gamification.clearNewAchievement}
        />
      )}
    </div>
  );
}

// Compact widget for sidebar or profile pages
interface GamificationWidgetProps {
  showNextSteps?: boolean;
  compact?: boolean;
}

export function GamificationWidget({ showNextSteps = true, compact = false }: GamificationWidgetProps) {
  const { profile } = useAuthStore();
  const gamification = useGamification();
  const [showAchievements, setShowAchievements] = useState(false);
  
  if (gamification.isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <ProgressCard
        totalPoints={gamification.totalPoints}
        role={profile?.user_type === 'syndicator' ? 'syndicator' : 'investor'}
        streak={gamification.streak}
        achievementCount={gamification.achievementCount}
        totalAchievements={gamification.totalAchievements}
        onViewAchievements={() => setShowAchievements(true)}
      />
      
      {showNextSteps && gamification.nextSteps.some(s => !s.completed) && (
        <div className="mt-4">
          <NextStepsCard
            steps={gamification.nextSteps}
            title="Next Steps"
            subtitle="Earn points by completing these"
          />
        </div>
      )}
      
      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        achievements={gamification.achievements}
        totalPoints={gamification.totalPoints}
      />
      
      {gamification.newAchievement && (
        <AchievementUnlocked
          achievement={gamification.newAchievement}
          onClose={gamification.clearNewAchievement}
        />
      )}
    </>
  );
}

