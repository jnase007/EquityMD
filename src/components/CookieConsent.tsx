import React, { useState, useEffect } from 'react';
import { Cookie, X, Settings, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'equitymd_cookie_consent';
const CONSENT_VERSION = '1.0';

interface ConsentPreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  version: string;
  timestamp: string;
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    analytics: true,
    marketing: false,
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Show again if version changed
        if (parsed.version !== CONSENT_VERSION) {
          setIsVisible(true);
        }
        setPreferences(parsed);
      } catch {
        setIsVisible(true);
      }
    } else {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: ConsentPreferences) => {
    const updated = { ...prefs, timestamp: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(updated));
    setPreferences(updated);
    setIsVisible(false);
    
    // Apply preferences (e.g., enable/disable analytics)
    applyPreferences(updated);
  };

  const acceptAll = () => {
    savePreferences({
      ...preferences,
      analytics: true,
      marketing: true,
    });
  };

  const acceptNecessary = () => {
    savePreferences({
      ...preferences,
      analytics: false,
      marketing: false,
    });
  };

  const saveCustom = () => {
    savePreferences(preferences);
    setShowSettings(false);
  };

  const applyPreferences = (prefs: ConsentPreferences) => {
    // Here you would enable/disable analytics based on preferences
    if (prefs.analytics) {
      // Enable Google Analytics, etc.
      console.log('Analytics enabled');
    } else {
      // Disable analytics
      console.log('Analytics disabled');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {showSettings ? (
          /* Detailed Settings */
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Cookie Preferences</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Necessary */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">Necessary</span>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">Required</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Essential for the website to function properly
                  </p>
                </div>
                <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center justify-end px-1">
                  <div className="w-4 h-4 bg-white rounded-full shadow" />
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <span className="font-medium text-gray-900">Analytics</span>
                  <p className="text-sm text-gray-500 mt-1">
                    Help us understand how visitors use our site
                  </p>
                </div>
                <button
                  onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                  className={`w-12 h-6 rounded-full flex items-center px-1 transition ${
                    preferences.analytics ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow" />
                </button>
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <span className="font-medium text-gray-900">Marketing</span>
                  <p className="text-sm text-gray-500 mt-1">
                    Personalized ads and recommendations
                  </p>
                </div>
                <button
                  onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                  className={`w-12 h-6 rounded-full flex items-center px-1 transition ${
                    preferences.marketing ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={acceptNecessary}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                Necessary Only
              </button>
              <button
                onClick={saveCustom}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
              >
                Save Preferences
              </button>
            </div>
          </div>
        ) : (
          /* Simple Banner */
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-shrink-0 p-3 bg-amber-100 rounded-xl">
                <Cookie className="h-6 w-6 text-amber-600" />
              </div>
              
              <div className="flex-1">
                <p className="text-gray-700">
                  We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
                  <Link to="/legal/privacy" className="text-emerald-600 hover:underline">
                    Learn more
                  </Link>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Customize</span>
                </button>
                <button
                  onClick={acceptNecessary}
                  className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Decline
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
                >
                  <Check className="h-4 w-4" />
                  Accept All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook to check consent status
export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentPreferences | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        setConsent(JSON.parse(stored));
      } catch {
        setConsent(null);
      }
    }
  }, []);

  return {
    hasConsent: consent !== null,
    analyticsEnabled: consent?.analytics ?? false,
    marketingEnabled: consent?.marketing ?? false,
  };
}

