import React, { useState } from 'react';
import { Lock, UserPlus, LogIn, TrendingUp, Shield, Bell } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { AuthModal } from './AuthModal';
import { useTheme } from '../contexts/ThemeContext';

interface ContentGateProps {
  children: React.ReactNode;
  /** Height of the visible teaser before blur (in pixels) */
  teaserHeight?: number;
  /** Whether to show the full gate overlay instead of gradient blur */
  fullGate?: boolean;
  /** Custom message to display */
  message?: string;
}

export function ContentGate({ 
  children, 
  teaserHeight = 150,
  fullGate = false,
  message = "Sign up to see full deal details"
}: ContentGateProps) {
  const { user } = useAuthStore();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'dim';
  // Fade-to color matches the page surface so the gate doesn't flash white in dark mode.
  const fade = isDark
    ? { c50: 'rgba(15,17,21,0.5)', c95: 'rgba(15,17,21,0.95)', solid: '#0f1115' }
    : { c50: 'rgba(255,255,255,0.5)', c95: 'rgba(255,255,255,0.95)', solid: '#ffffff' };
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'sign_in' | 'sign_up'>('sign_up');

  // If user is logged in, show content normally
  if (user) {
    return <>{children}</>;
  }

  const handleSignUp = () => {
    setAuthMode('sign_up');
    setShowAuthModal(true);
  };

  const handleSignIn = () => {
    setAuthMode('sign_in');
    setShowAuthModal(true);
  };

  if (fullGate) {
    // Full overlay gate - completely blocks content
    return (
      <>
        <div className="relative">
          <div className="blur-md pointer-events-none select-none opacity-50">
            {children}
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundImage: `linear-gradient(to bottom, ${isDark ? 'rgba(15,17,21,0.8)' : 'rgba(255,255,255,0.8)'}, ${fade.c95}, ${fade.solid})` }}
          >
            <div className="text-center px-6 py-8 max-w-md">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{message}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Join 7,400+ accredited investors accessing exclusive CRE opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleSignUp}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-5 w-5" />
                  Create Free Account
                </button>
                <button
                  onClick={handleSignIn}
                  className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)} 
            defaultView={authMode}
          />
        )}
      </>
    );
  }

  // Gradient blur gate - shows teaser then fades to blur
  return (
    <>
      <div className="relative">
        {/* Content with gradient mask */}
        <div 
          className="relative overflow-hidden"
          style={{ maxHeight: teaserHeight + 200 }}
        >
          <div className="pointer-events-none select-none">
            {children}
          </div>
          {/* Gradient overlay that transitions to blur */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, 
                transparent 0%, 
                transparent ${Math.max(0, teaserHeight - 50)}px, 
                ${fade.c50} ${teaserHeight}px, 
                ${fade.c95} ${teaserHeight + 100}px, 
                ${fade.solid} 100%
              )`,
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              maskImage: `linear-gradient(to bottom, transparent 0%, transparent ${teaserHeight - 50}px, black ${teaserHeight}px)`,
              WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, transparent ${teaserHeight - 50}px, black ${teaserHeight}px)`,
            }}
          />
        </div>
        
        {/* Sign up prompt */}
        <div
          className="relative -mt-20 pt-24 pb-8"
          style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${fade.solid}, ${fade.solid})` }}
        >
          <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-500/10 dark:via-[#181b20] dark:to-indigo-500/10 border border-blue-100 dark:border-white/10 rounded-2xl p-6 md:p-8 max-w-xl mx-auto shadow-lg">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {message}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Create a free account to unlock all deal information, documents, and investment details.
              </p>
              
              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-left">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-green-100 rounded">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">Full Financials</div>
                    <div className="text-gray-500 dark:text-gray-400">IRR, projections & more</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-blue-100 rounded">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">Due Diligence</div>
                    <div className="text-gray-500 dark:text-gray-400">PPM, legal docs & reports</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-purple-100 rounded">
                    <Bell className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">Deal Alerts</div>
                    <div className="text-gray-500 dark:text-gray-400">Get notified on new deals</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleSignUp}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md"
                >
                  <UserPlus className="h-5 w-5" />
                  Create Free Account
                </button>
                <button
                  onClick={handleSignIn}
                  className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In
                </button>
              </div>
              
              <p className="text-xs text-gray-400 mt-4">
                Join 7,400+ accredited investors. Free to join, no credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          defaultView={authMode}
        />
      )}
    </>
  );
}

