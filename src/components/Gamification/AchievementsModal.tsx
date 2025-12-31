import React, { useState } from 'react';
import { X, Trophy, Lock, CheckCircle2, Zap, Filter } from 'lucide-react';
import { Achievement, getRarityColor } from './types';
import { AchievementBadge } from './AchievementBadge';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  totalPoints: number;
}

type FilterType = 'all' | 'unlocked' | 'locked';
type CategoryType = 'all' | 'profile' | 'engagement' | 'milestone' | 'social';

export function AchievementsModal({ isOpen, onClose, achievements, totalPoints }: AchievementsModalProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [category, setCategory] = useState<CategoryType>('all');
  
  if (!isOpen) return null;
  
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  
  const filteredAchievements = achievements.filter(a => {
    const filterMatch = filter === 'all' || 
      (filter === 'unlocked' && a.unlockedAt) || 
      (filter === 'locked' && !a.unlockedAt);
    const categoryMatch = category === 'all' || a.category === category;
    return filterMatch && categoryMatch;
  });
  
  // Group by rarity for display
  const groupedByRarity = {
    legendary: filteredAchievements.filter(a => a.rarity === 'legendary'),
    epic: filteredAchievements.filter(a => a.rarity === 'epic'),
    rare: filteredAchievements.filter(a => a.rarity === 'rare'),
    uncommon: filteredAchievements.filter(a => a.rarity === 'uncommon'),
    common: filteredAchievements.filter(a => a.rarity === 'common'),
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Your Achievements</h2>
                  <p className="text-amber-100">
                    {unlockedCount} of {achievements.length} unlocked
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Zap className="h-5 w-5 text-yellow-300" />
                    <span className="text-2xl font-bold">{totalPoints}</span>
                  </div>
                  <p className="text-amber-200 text-sm">total points</p>
                </div>
                
                <button 
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Filter:</span>
            </div>
            
            <div className="flex gap-2">
              {(['all', 'unlocked', 'locked'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === f 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'unlocked' ? 'Unlocked' : 'Locked'}
                </button>
              ))}
            </div>
            
            <div className="h-4 w-px bg-gray-200" />
            
            <div className="flex gap-2 flex-wrap">
              {(['all', 'profile', 'engagement', 'milestone', 'social'] as CategoryType[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    category === c 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Achievements list */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredAchievements.length === 0 ? (
              <div className="text-center py-12">
                <Lock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No achievements match your filters</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Legendary */}
                {groupedByRarity.legendary.length > 0 && (
                  <RaritySection 
                    title="Legendary" 
                    color="amber"
                    achievements={groupedByRarity.legendary}
                  />
                )}
                
                {/* Epic */}
                {groupedByRarity.epic.length > 0 && (
                  <RaritySection 
                    title="Epic" 
                    color="purple"
                    achievements={groupedByRarity.epic}
                  />
                )}
                
                {/* Rare */}
                {groupedByRarity.rare.length > 0 && (
                  <RaritySection 
                    title="Rare" 
                    color="blue"
                    achievements={groupedByRarity.rare}
                  />
                )}
                
                {/* Uncommon */}
                {groupedByRarity.uncommon.length > 0 && (
                  <RaritySection 
                    title="Uncommon" 
                    color="emerald"
                    achievements={groupedByRarity.uncommon}
                  />
                )}
                
                {/* Common */}
                {groupedByRarity.common.length > 0 && (
                  <RaritySection 
                    title="Common" 
                    color="gray"
                    achievements={groupedByRarity.common}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface RaritySectionProps {
  title: string;
  color: string;
  achievements: Achievement[];
}

function RaritySection({ title, color, achievements }: RaritySectionProps) {
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    legendary: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    epic: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    rare: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    uncommon: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    common: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    gray: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  };
  
  const colors = colorClasses[color] || colorClasses.gray;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${colors.bg} ${colors.text}`}>
          {title}
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
      
      <div className="grid gap-3">
        {achievements.map((achievement) => (
          <AchievementRow key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}

function AchievementRow({ achievement }: { achievement: Achievement }) {
  const isUnlocked = !!achievement.unlockedAt;
  
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
      isUnlocked 
        ? 'bg-white border-gray-200 shadow-sm' 
        : 'bg-gray-50 border-gray-100 opacity-60'
    }`}>
      {/* Icon */}
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
        isUnlocked 
          ? 'bg-gradient-to-br from-gray-100 to-gray-200' 
          : 'bg-gray-200 grayscale'
      }`}>
        {isUnlocked ? achievement.icon : <Lock className="h-6 w-6 text-gray-400" />}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={`font-semibold ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
            {achievement.title}
          </h4>
          {isUnlocked && (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          )}
        </div>
        <p className={`text-sm ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
          {achievement.description}
        </p>
      </div>
      
      {/* Points */}
      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
        isUnlocked ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-500'
      }`}>
        <Zap className="h-4 w-4" />
        <span className="font-bold text-sm">{achievement.points}</span>
      </div>
    </div>
  );
}

