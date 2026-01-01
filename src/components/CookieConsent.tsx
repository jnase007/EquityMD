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
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 animate-slide-up">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {showSettings ? (
          /* Compact Settings */
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Cookie Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">Necessary</span>
                <div className="w-10 h-5 bg-emerald-500 rounded-full flex items-center justify-end px-0.5">
                  <div className="w-4 h-4 bg-white rounded-full shadow" />
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">Analytics</span>
                <button
                  onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                  className={`w-10 h-5 rounded-full flex items-center px-0.5 transition ${
                    preferences.analytics ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow" />
                </button>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">Marketing</span>
                <button
                  onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                  className={`w-10 h-5 rounded-full flex items-center px-0.5 transition ${
                    preferences.marketing ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow" />
                </button>
              </div>
            </div>

            <button
              onClick={saveCustom}
              className="w-full py-2 bg-emerald-600 text-white text-sm rounded-lg font-medium hover:bg-emerald-700 transition"
            >
              Save
            </button>
          </div>
        ) : (
          /* Compact Banner */
          <div className="p-3">
            <div className="flex items-center gap-3 mb-3">
              <Cookie className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                We use cookies.{' '}
                <Link to="/legal/privacy" className="text-emerald-600 hover:underline">Learn more</Link>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                <Settings className="h-3 w-3 inline mr-1" />
                Settings
              </button>
              <button
                onClick={acceptNecessary}
                className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                Decline
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
              >
                Accept
              </button>
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

