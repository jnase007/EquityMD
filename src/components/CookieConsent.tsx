import React, { useState, useEffect } from 'react';
import { Cookie, X, Shield, BarChart3, Megaphone, Check } from 'lucide-react';
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

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
        checked
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
          : 'bg-gray-300'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      aria-checked={checked}
      role="switch"
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
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
        if (parsed.version !== CONSENT_VERSION) {
          setIsVisible(true);
        }
        setPreferences(parsed);
      } catch {
        setIsVisible(true);
      }
    } else {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Step aside when a full-screen modal (auth, etc.) is open so the cookie
  // banner never overlaps the modal's bottom fields on mobile.
  useEffect(() => {
    const sync = () => setModalOpen(document.body.classList.contains('modal-open'));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const savePreferences = (prefs: ConsentPreferences) => {
    const updated = { ...prefs, timestamp: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(updated));
    setPreferences(updated);
    setIsVisible(false);
    setShowSettings(false);
    applyPreferences(updated);
  };

  const acceptAll = () =>
    savePreferences({ ...preferences, analytics: true, marketing: true });

  const acceptNecessary = () =>
    savePreferences({ ...preferences, analytics: false, marketing: false });

  const saveCustom = () => savePreferences(preferences);

  const applyPreferences = (prefs: ConsentPreferences) => {
    if (prefs.analytics) {
      console.log('Analytics enabled');
    } else {
      console.log('Analytics disabled');
    }
  };

  if (!isVisible) return null;
  // Hide while a modal is open (but keep showing if the user is mid-settings).
  if (modalOpen && !showSettings) return null;

  return (
    <>
      {/* Backdrop only when settings are open */}
      {showSettings && (
        <div
          className="fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowSettings(false)}
        />
      )}

      <div
        className={`fixed z-[70] animate-slide-up ${
          showSettings
            ? 'inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:max-w-sm'
            : 'inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:max-w-[300px]'
        }`}
      >
        <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl shadow-2xl ring-1 ring-gray-900/5 transition hover:bg-white/95">
          {/* Gradient top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />

          {showSettings ? (
            /* ============ SETTINGS PANEL ============ */
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20">
                    <Cookie className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Cookie Preferences
                  </h3>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                {/* Necessary */}
                <div className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3">
                  <div className="flex gap-2.5">
                    <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Necessary
                      </p>
                      <p className="text-xs text-gray-500">
                        Required for the site to function. Always on.
                      </p>
                    </div>
                  </div>
                  <Toggle checked disabled />
                </div>

                {/* Analytics */}
                <div className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-3 transition hover:border-gray-200">
                  <div className="flex gap-2.5">
                    <BarChart3 className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Analytics
                      </p>
                      <p className="text-xs text-gray-500">
                        Helps us understand how visitors use the site.
                      </p>
                    </div>
                  </div>
                  <Toggle
                    checked={preferences.analytics}
                    onChange={() =>
                      setPreferences((p) => ({ ...p, analytics: !p.analytics }))
                    }
                  />
                </div>

                {/* Marketing */}
                <div className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-3 transition hover:border-gray-200">
                  <div className="flex gap-2.5">
                    <Megaphone className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Marketing
                      </p>
                      <p className="text-xs text-gray-500">
                        Used to deliver relevant offers and measure campaigns.
                      </p>
                    </div>
                  </div>
                  <Toggle
                    checked={preferences.marketing}
                    onChange={() =>
                      setPreferences((p) => ({ ...p, marketing: !p.marketing }))
                    }
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={acceptNecessary}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Decline All
                </button>
                <button
                  onClick={saveCustom}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98]"
                >
                  Save Choices
                </button>
              </div>
            </div>
          ) : (
            /* ============ MAIN BANNER ============ */
            <div className="p-3.5">
              <div className="mb-2.5 flex items-start gap-2.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-600/20">
                  <Cookie className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    We value your privacy
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
                    We use cookies to improve your experience.{' '}
                    <Link
                      to="/legal/privacy"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowSettings(true)}
                  className="rounded-lg border border-gray-200 bg-white/70 px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Customize
                </button>
                <button
                  onClick={acceptNecessary}
                  className="rounded-lg border border-gray-200 bg-white/70 px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Decline
                </button>
                <button
                  onClick={acceptAll}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-blue-600/25 transition hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98]"
                >
                  <Check className="h-3 w-3" />
                  Accept All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
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
