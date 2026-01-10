import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Sunrise, Sparkles, TrendingUp, Target, Flame, ChevronRight, Zap, Trophy } from 'lucide-react';

interface PersonalizedGreetingProps {
  userName: string;
  streak?: number;
  points?: number;
  level?: number;
  levelTitle?: string;
  profileCompletion?: number;
  lastViewedDeal?: { title: string; slug: string } | null;
  onViewAchievements?: () => void;
  achievementsButtonRef?: React.RefObject<HTMLButtonElement>;
}

export function PersonalizedGreeting({
  userName,
  streak = 0,
  points = 0,
  level = 1,
  levelTitle = 'Newcomer',
  profileCompletion = 0,
  lastViewedDeal,
  onViewAchievements,
  achievementsButtonRef
}: PersonalizedGreetingProps) {
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: <Sunrise className="h-6 w-6 text-amber-400" /> };
    if (hour < 17) return { text: 'Good afternoon', icon: <Sun className="h-6 w-6 text-yellow-400" /> };
    return { text: 'Good evening', icon: <Moon className="h-6 w-6 text-indigo-400" /> };
  };

  const greeting = getTimeBasedGreeting();
  const firstName = userName?.split(' ')[0] || 'Investor';

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
      
      {/* Decorative Blurs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="relative">
        {/* Main Greeting */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {greeting.icon}
              <h1 className="text-2xl lg:text-3xl font-bold">
                {greeting.text}, {firstName}!
              </h1>
            </div>
            <p className="text-slate-400 text-lg">
              Ready to discover your next investment opportunity?
            </p>
            
            {/* Quick Stats Row */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {streak > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 rounded-full">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-300">{streak} day streak</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 rounded-full">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-300">{points.toLocaleString()} pts</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 rounded-full">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Level {level}: {levelTitle}</span>
              </div>
              {onViewAchievements && (
                <button
                  ref={achievementsButtonRef}
                  onClick={onViewAchievements}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 rounded-full hover:bg-blue-500/30 transition-colors cursor-pointer"
                >
                  <Trophy className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">View Achievements</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-col gap-2">
            <Link
              to="/find"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
            >
              <TrendingUp className="h-5 w-5" />
              Browse Deals
            </Link>
            {profileCompletion < 100 && (
              <Link
                to="/profile"
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition-all text-sm"
              >
                <Target className="h-4 w-4" />
                Complete Profile ({profileCompletion}%)
              </Link>
            )}
          </div>
        </div>
        
        {/* Continue Where You Left Off */}
        {lastViewedDeal && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <Link
              to={`/deals/${lastViewedDeal.slug}`}
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Continue where you left off</p>
                  <p className="font-semibold">{lastViewedDeal.title}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

