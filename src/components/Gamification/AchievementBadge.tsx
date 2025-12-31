import React from 'react';
import { Lock, CheckCircle } from 'lucide-react';
import { Achievement, getRarityColor } from './types';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onClick?: () => void;
}

export function AchievementBadge({ 
  achievement, 
  size = 'md', 
  showDetails = false,
  onClick 
}: AchievementBadgeProps) {
  const isUnlocked = !!achievement.unlockedAt;
  const rarityColor = getRarityColor(achievement.rarity);
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };
  
  const borderClasses = {
    common: 'border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200',
    uncommon: 'border-emerald-400 bg-gradient-to-br from-emerald-100 to-emerald-200',
    rare: 'border-blue-400 bg-gradient-to-br from-blue-100 to-blue-200',
    epic: 'border-purple-400 bg-gradient-to-br from-purple-100 to-purple-200',
    legendary: 'border-amber-400 bg-gradient-to-br from-amber-100 to-amber-200',
  };
  
  const glowClasses = {
    common: '',
    uncommon: 'shadow-emerald-200',
    rare: 'shadow-blue-200',
    epic: 'shadow-purple-200',
    legendary: 'shadow-amber-300 animate-pulse',
  };
  
  const lockedClasses = 'border-gray-200 bg-gray-100 opacity-50 grayscale';

  return (
    <div 
      className={`relative group ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Badge */}
      <div 
        className={`
          ${sizeClasses[size]} 
          ${isUnlocked ? borderClasses[achievement.rarity] : lockedClasses}
          ${isUnlocked ? glowClasses[achievement.rarity] : ''}
          rounded-2xl border-2 flex items-center justify-center
          transition-all duration-300 
          ${onClick ? 'hover:scale-110' : ''}
          ${isUnlocked && achievement.rarity === 'legendary' ? 'shadow-lg' : 'shadow-md'}
        `}
      >
        {isUnlocked ? (
          <span className="drop-shadow-sm">{achievement.icon}</span>
        ) : (
          <Lock className={`${size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'} text-gray-400`} />
        )}
      </div>
      
      {/* Unlock indicator */}
      {isUnlocked && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <CheckCircle className="h-3 w-3 text-white" />
        </div>
      )}
      
      {/* Rarity indicator for legendary */}
      {isUnlocked && achievement.rarity === 'legendary' && (
        <div className="absolute -top-1 -right-1">
          <span className="text-xs">✨</span>
        </div>
      )}
      
      {/* Tooltip on hover */}
      {showDetails && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl text-center min-w-[150px]">
            <p className="font-semibold text-sm">{achievement.title}</p>
            <p className="text-xs text-slate-300 mt-1">{achievement.description}</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                achievement.rarity === 'common' ? 'bg-gray-600' :
                achievement.rarity === 'uncommon' ? 'bg-emerald-600' :
                achievement.rarity === 'rare' ? 'bg-blue-600' :
                achievement.rarity === 'epic' ? 'bg-purple-600' :
                'bg-amber-600'
              }`}>
                {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
              </span>
              <span className="text-xs text-slate-400">+{achievement.points} pts</span>
            </div>
            {isUnlocked && achievement.unlockedAt && (
              <p className="text-xs text-slate-400 mt-1">
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="w-3 h-3 bg-slate-900 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
}

// Achievement list component
interface AchievementListProps {
  achievements: Achievement[];
  showLocked?: boolean;
  maxDisplay?: number;
}

export function AchievementList({ 
  achievements, 
  showLocked = true,
  maxDisplay 
}: AchievementListProps) {
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);
  
  const displayAchievements = [
    ...unlockedAchievements,
    ...(showLocked ? lockedAchievements : [])
  ].slice(0, maxDisplay);
  
  const hiddenCount = achievements.length - displayAchievements.length;

  return (
    <div className="flex flex-wrap gap-3">
      {displayAchievements.map((achievement) => (
        <AchievementBadge 
          key={achievement.id} 
          achievement={achievement}
          size="md"
          showDetails
        />
      ))}
      {hiddenCount > 0 && (
        <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm font-medium">
          +{hiddenCount}
        </div>
      )}
    </div>
  );
}

// Mini achievement strip for compact display
interface AchievementStripProps {
  achievements: Achievement[];
  maxDisplay?: number;
}

export function AchievementStrip({ achievements, maxDisplay = 5 }: AchievementStripProps) {
  const unlocked = achievements.filter(a => a.unlockedAt);
  const displayAchievements = unlocked.slice(0, maxDisplay);
  const moreCount = unlocked.length - displayAchievements.length;

  return (
    <div className="flex items-center gap-1">
      {displayAchievements.map((achievement) => (
        <div 
          key={achievement.id}
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm"
          title={achievement.title}
        >
          {achievement.icon}
        </div>
      ))}
      {moreCount > 0 && (
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
          +{moreCount}
        </div>
      )}
      {unlocked.length === 0 && (
        <span className="text-sm text-gray-400 italic">No achievements yet</span>
      )}
    </div>
  );
}

