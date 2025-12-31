import React from 'react';
import { Flame, Trophy, TrendingUp, Zap, ChevronRight, Star } from 'lucide-react';
import { UserLevel, UserRole, getLevelFromPoints, getProgressToNextLevel, INVESTOR_LEVELS, SYNDICATOR_LEVELS } from './types';

interface ProgressCardProps {
  totalPoints: number;
  role: UserRole;
  streak?: number;
  achievementCount: number;
  totalAchievements: number;
  onViewAchievements?: () => void;
}

export function ProgressCard({
  totalPoints,
  role,
  streak = 0,
  achievementCount,
  totalAchievements,
  onViewAchievements,
}: ProgressCardProps) {
  const currentLevel = getLevelFromPoints(totalPoints, role);
  const progressToNext = getProgressToNextLevel(totalPoints, role);
  const levels = role === 'investor' ? INVESTOR_LEVELS : SYNDICATOR_LEVELS;
  const nextLevel = levels.find(l => l.level === currentLevel.level + 1);
  const pointsToNext = nextLevel ? nextLevel.minPoints - totalPoints : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header with gradient based on level */}
      <div className={`bg-gradient-to-r ${
        currentLevel.level <= 2 ? 'from-gray-600 to-slate-700' :
        currentLevel.level <= 3 ? 'from-emerald-600 to-teal-600' :
        currentLevel.level <= 4 ? 'from-blue-600 to-indigo-600' :
        'from-purple-600 to-pink-600'
      } px-6 py-5 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
              {currentLevel.icon}
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium">Level {currentLevel.level}</p>
              <h3 className="text-xl font-bold">{currentLevel.title}</h3>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-yellow-300">
              <Zap className="h-5 w-5" />
              <span className="text-2xl font-bold">{totalPoints.toLocaleString()}</span>
            </div>
            <p className="text-white/70 text-sm">total points</p>
          </div>
        </div>
        
        {/* Progress bar */}
        {nextLevel && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>Progress to Level {nextLevel.level}</span>
              <span>{pointsToNext} pts needed</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Stats */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Achievements */}
          <div 
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={onViewAchievements}
          >
            <Trophy className="h-6 w-6 text-amber-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{achievementCount}</p>
            <p className="text-xs text-gray-500">of {totalAchievements} badges</p>
          </div>
          
          {/* Streak */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4">
            <Flame className={`h-6 w-6 ${streak > 0 ? 'text-orange-500' : 'text-gray-400'} mb-2`} />
            <p className="text-2xl font-bold text-gray-900">{streak}</p>
            <p className="text-xs text-gray-500">day streak</p>
          </div>
          
          {/* Progress */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
            <TrendingUp className="h-6 w-6 text-emerald-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{Math.round((achievementCount / totalAchievements) * 100)}%</p>
            <p className="text-xs text-gray-500">complete</p>
          </div>
        </div>
        
        {/* View all achievements button */}
        <button
          onClick={onViewAchievements}
          className="w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center gap-2 text-gray-700 font-medium transition-colors"
        >
          <Trophy className="h-4 w-4" />
          View All Achievements
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Compact level badge for profile headers
interface LevelBadgeProps {
  points: number;
  role: UserRole;
  size?: 'sm' | 'md';
}

export function LevelBadge({ points, role, size = 'md' }: LevelBadgeProps) {
  const level = getLevelFromPoints(points, role);
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
  };
  
  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
  };

  return (
    <div className={`inline-flex items-center bg-gradient-to-r ${
      level.level <= 2 ? 'from-gray-100 to-slate-100 text-gray-700' :
      level.level <= 3 ? 'from-emerald-100 to-teal-100 text-emerald-700' :
      level.level <= 4 ? 'from-blue-100 to-indigo-100 text-blue-700' :
      'from-purple-100 to-pink-100 text-purple-700'
    } rounded-full ${sizeClasses[size]}`}>
      <span className={iconSizes[size]}>{level.icon}</span>
      <span className="font-medium">Lvl {level.level}</span>
    </div>
  );
}

// Points display with animation
interface PointsDisplayProps {
  points: number;
  showChange?: number;
}

export function PointsDisplay({ points, showChange }: PointsDisplayProps) {
  return (
    <div className="relative inline-flex items-center gap-1">
      <Zap className="h-4 w-4 text-amber-500" />
      <span className="font-bold text-gray-900">{points.toLocaleString()}</span>
      
      {showChange && showChange > 0 && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-emerald-500 font-bold text-sm animate-float-up">
          +{showChange}
        </span>
      )}
      
      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
        }
        .animate-float-up {
          animation: float-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// Star rating for profile completeness
interface ProfileCompletenessProps {
  percentage: number;
}

export function ProfileCompleteness({ percentage }: ProfileCompletenessProps) {
  const filledStars = Math.floor(percentage / 20);
  const partialStar = (percentage % 20) / 20;

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="relative">
          <Star 
            className={`h-5 w-5 ${i < filledStars ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
          />
          {i === filledStars && partialStar > 0 && (
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${partialStar * 100}%` }}
            >
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            </div>
          )}
        </div>
      ))}
      <span className="ml-1 text-sm text-gray-600">{percentage}%</span>
    </div>
  );
}

