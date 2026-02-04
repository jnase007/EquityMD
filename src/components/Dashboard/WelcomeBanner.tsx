import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, Camera, Search, Heart, Plus, 
  ArrowRight, Sparkles, Target, Users
} from 'lucide-react';
import { useAuthStore } from '../../lib/store';

interface WelcomeBannerProps {
  userType: 'investor' | 'syndicator';
  userName: string;
  onDismiss: () => void;
}

export function WelcomeBanner({ userType, userName, onDismiss }: WelcomeBannerProps) {
  const { profile } = useAuthStore();
  const hasAvatar = !!profile?.avatar_url;
  
  const investorActions = [
    {
      icon: Search,
      label: 'Browse Deals',
      description: 'Find your next investment',
      href: '/find',
      color: 'bg-blue-500',
      primary: true,
    },
    {
      icon: Camera,
      label: 'Add Photo',
      description: 'Complete your profile',
      href: '/profile',
      color: 'bg-purple-500',
      show: !hasAvatar,
    },
    {
      icon: Heart,
      label: 'Save Deals',
      description: 'Build your watchlist',
      href: '/favorites',
      color: 'bg-red-500',
    },
  ].filter(a => a.show !== false);

  const syndicatorActions = [
    {
      icon: Plus,
      label: 'Create Deal',
      description: 'List your first property',
      href: '/deals/new',
      color: 'bg-emerald-500',
      primary: true,
    },
    {
      icon: Camera,
      label: 'Add Logo',
      description: 'Build brand trust',
      href: '/profile',
      color: 'bg-purple-500',
    },
    {
      icon: Users,
      label: 'View Directory',
      description: 'See other syndicators',
      href: '/syndicators',
      color: 'bg-blue-500',
    },
  ];

  const actions = userType === 'investor' ? investorActions : syndicatorActions;

  return (
    <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 lg:p-8 text-white shadow-xl overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              Welcome, {userName}! 🎉
            </h2>
            <p className="text-blue-100">
              Here's how to get started
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {actions.slice(0, 3).map((action, index) => (
            <Link
              key={action.label}
              to={action.href}
              className={`group relative p-4 rounded-xl transition-all ${
                action.primary 
                  ? 'bg-white text-gray-900 hover:shadow-lg hover:scale-105' 
                  : 'bg-white/10 hover:bg-white/20 backdrop-blur'
              }`}
            >
              <div className={`w-10 h-10 ${action.primary ? action.color : 'bg-white/20'} rounded-lg flex items-center justify-center mb-3`}>
                <action.icon className={`h-5 w-5 ${action.primary ? 'text-white' : ''}`} />
              </div>
              <h3 className={`font-semibold ${action.primary ? 'text-gray-900' : ''}`}>
                {action.label}
              </h3>
              <p className={`text-sm mt-1 ${action.primary ? 'text-gray-600' : 'text-blue-100'}`}>
                {action.description}
              </p>
              <ArrowRight className={`absolute top-4 right-4 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                action.primary ? 'text-gray-400' : 'text-white/60'
              }`} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Floating Profile Completion Nudge
export function ProfileNudge({ percentage, onClick }: { percentage: number; onClick: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isVisible || percentage >= 80) return null;

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
      >
        <Target className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {percentage}%
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-72">
        {/* Close button */}
        <button
          onClick={() => setIsMinimized(true)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Progress Ring */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-14 h-14">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray={`${percentage}, 100`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-900">{percentage}%</span>
            </div>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Complete Profile</p>
            <p className="text-sm text-gray-500">Unlock full features</p>
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-emerald-500">✓</span>
            Get verified badge at 80%
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-emerald-500">✓</span>
            More relevant deal listings
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onClick}
          className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          Complete Now
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// Hook to manage welcome banner state
export function useWelcomeBanner() {
  const { user } = useAuthStore();
  const storageKey = `welcome_banner_dismissed_${user?.id}`;
  
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(storageKey) === 'true';
    }
    return false;
  });

  const dismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(storageKey, 'true');
  };

  return { isDismissed, dismiss };
}

