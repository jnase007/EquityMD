import React, { useEffect, useState } from 'react';
import { X, Sparkles, Star, Trophy, Zap } from 'lucide-react';
import { Achievement, getRarityColor } from './types';

interface AchievementUnlockedProps {
  achievement: Achievement;
  onClose: () => void;
  onContinue?: () => void;
}

export function AchievementUnlocked({ achievement, onClose, onContinue }: AchievementUnlockedProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);
  const [showContent, setShowContent] = useState(false);
  
  useEffect(() => {
    // Generate confetti particles
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setConfetti(particles);
    
    // Trigger content animation
    setTimeout(() => setShowContent(true), 100);
    
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  const rarityColors = {
    common: { bg: 'from-gray-500 to-gray-600', text: 'text-gray-100' },
    uncommon: { bg: 'from-emerald-500 to-teal-600', text: 'text-emerald-100' },
    rare: { bg: 'from-blue-500 to-indigo-600', text: 'text-blue-100' },
    epic: { bg: 'from-purple-500 to-pink-600', text: 'text-purple-100' },
    legendary: { bg: 'from-amber-500 to-orange-600', text: 'text-amber-100' },
  };

  const colors = rarityColors[achievement.rarity];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-3 h-3 animate-confetti"
            style={{
              left: `${particle.left}%`,
              top: '-20px',
              backgroundColor: particle.color,
              animationDelay: `${particle.delay}s`,
              borderRadius: Math.random() > 0.5 ? '50%' : '0%',
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>
      
      {/* Stars burst */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <Star 
            key={i}
            className={`absolute h-6 w-6 text-yellow-400 animate-star-burst`}
            style={{
              animationDelay: `${i * 0.1}s`,
              transform: `rotate(${i * 45}deg) translateY(-80px)`,
            }}
          />
        ))}
      </div>
      
      {/* Modal */}
      <div 
        className={`relative bg-gradient-to-br ${colors.bg} rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-500 ${
          showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Trophy/Sparkle decoration */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <Trophy className="h-12 w-12 text-yellow-400 opacity-50" />
            </div>
            <Trophy className="h-12 w-12 text-yellow-400 relative" />
          </div>
        </div>
        
        {/* Content */}
        <div className="text-center mt-4">
          <p className={`text-sm font-medium ${colors.text} mb-2 uppercase tracking-wider`}>
            Achievement Unlocked!
          </p>
          
          {/* Achievement icon */}
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center text-5xl shadow-lg animate-bounce-slow">
              {achievement.icon}
            </div>
            {achievement.rarity === 'legendary' && (
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-spin-slow" />
            )}
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-2">
            {achievement.title}
          </h2>
          
          {/* Description */}
          <p className={`${colors.text} mb-4`}>
            {achievement.description}
          </p>
          
          {/* Points and rarity */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="px-4 py-2 bg-white/20 backdrop-blur rounded-full flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-300" />
              <span className="text-white font-bold">+{achievement.points} pts</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
              achievement.rarity === 'common' ? 'bg-gray-600/50 text-gray-200' :
              achievement.rarity === 'uncommon' ? 'bg-emerald-600/50 text-emerald-200' :
              achievement.rarity === 'rare' ? 'bg-blue-600/50 text-blue-200' :
              achievement.rarity === 'epic' ? 'bg-purple-600/50 text-purple-200' :
              'bg-amber-600/50 text-amber-200'
            }`}>
              {achievement.rarity}
            </div>
          </div>
          
          {/* Continue button */}
          <button
            onClick={onContinue || onClose}
            className="w-full py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            Awesome!
          </button>
        </div>
      </div>
      
      {/* CSS for confetti animation */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes star-burst {
          0% {
            opacity: 0;
            transform: rotate(var(--rotation)) translateY(0) scale(0);
          }
          50% {
            opacity: 1;
            transform: rotate(var(--rotation)) translateY(-100px) scale(1);
          }
          100% {
            opacity: 0;
            transform: rotate(var(--rotation)) translateY(-150px) scale(0.5);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-confetti {
          animation: confetti-fall 3s ease-out forwards;
        }
        
        .animate-star-burst {
          animation: star-burst 1s ease-out forwards;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Level up celebration
interface LevelUpProps {
  newLevel: { level: number; title: string; icon: string };
  onClose: () => void;
}

export function LevelUpCelebration({ newLevel, onClose }: LevelUpProps) {
  const [showContent, setShowContent] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div 
        className={`relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-500 ${
          showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">{newLevel.icon}</div>
          <p className="text-purple-200 text-sm font-medium uppercase tracking-wider mb-2">
            Level Up!
          </p>
          <h2 className="text-3xl font-bold text-white mb-2">
            Level {newLevel.level}
          </h2>
          <p className="text-xl text-purple-100 mb-6">
            {newLevel.title}
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

