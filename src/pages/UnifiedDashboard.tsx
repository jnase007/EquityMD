import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { InvestorDashboard, SyndicatorDashboard } from '../components/Dashboard';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { 
  TrendingUp, 
  Building2, 
  Plus, 
  X, 
  Sparkles, 
  ChevronRight,
  BarChart3,
  FileText,
  Users,
  DollarSign,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

// Confetti component for celebration
function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        >
          <div
            className="w-3 h-3 rounded-sm"
            style={{
              backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 5)],
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

interface UnifiedDashboardProps {
  initialView?: 'investor' | 'syndicator';
}

export function UnifiedDashboard({ initialView }: UnifiedDashboardProps = {}) {
  const { user, profile, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const [hasSyndicators, setHasSyndicators] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileTimeout, setProfileTimeout] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'investor' | 'syndicator'>(initialView || 'investor');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-refresh session when user returns to tab (prevents "session expired" on idle)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && user) {
        try {
          await supabase.auth.refreshSession();
        } catch (err) {
          console.warn('[Dashboard] Background refresh failed:', err);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);
  const [hoveredView, setHoveredView] = useState<'investor' | 'syndicator' | null>(null);
  const [hasInitialViewOverride] = useState(!!initialView); // Track if URL specified a view

  // Redirect to home if not authenticated (but wait a bit for auth to initialize)
  useEffect(() => {
    const checkAuth = setTimeout(() => {
      if (!user && !loading) {
        console.log('No user found after loading, redirecting to home');
        navigate('/');
      }
    }, 2000); // Give auth 2 seconds to initialize
    
    return () => clearTimeout(checkAuth);
  }, [user, loading, navigate]);

  // Safety net: if profile doesn't load within 8s, verify session then show escape hatch
  useEffect(() => {
    if (!user || profile) {
      setProfileTimeout(false);
      return;
    }
    
    const timer = setTimeout(async () => {
      // Profile hasn't loaded — check if session is actually expired
      try {
        console.log('[Dashboard] Profile not loaded after 3s — checking session...');
        const { data, error } = await supabase.auth.getSession();
        if (error || !data?.session) {
          console.warn('[Dashboard] Session expired:', error?.message);
          setProfileTimeout(true);
        } else {
          // Session is valid but profile didn't load — try refreshing and re-fetching
          console.log('[Dashboard] Session valid, refreshing...');
          const { data: refreshData } = await supabase.auth.refreshSession();
          if (refreshData?.session?.user) {
            // Try fetching profile directly
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', refreshData.session.user.id)
              .maybeSingle();
            if (profileData) {
              useAuthStore.getState().setProfile(profileData);
              setLoading(false);
              return;
            }
          }
          // Still no profile after retry
          setTimeout(() => {
            if (!useAuthStore.getState().profile) {
              setProfileTimeout(true);
            }
          }, 2000);
        }
      } catch (err) {
        console.error('[Dashboard] Session check failed:', err);
        setProfileTimeout(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [profile, user]);

  // Hard ceiling: if loading hasn't resolved in 10s, force it
  useEffect(() => {
    const hardCeiling = setTimeout(() => {
      if (loading) {
        console.warn('[Dashboard] Hard ceiling hit — forcing loading=false');
        setLoading(false);
      }
    }, 5000);
    return () => clearTimeout(hardCeiling);
  }, [loading]);

  // Show loading state while checking auth
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  // Check if user has seen the welcome modal before
  // Also check database preference - if they have one saved, they've already chosen
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('equitymd_seen_dashboard_welcome');
    const hasPreferenceSaved = profile?.dashboard_preference != null;
    
    // If they have a saved preference in DB, mark as seen in localStorage too
    if (hasPreferenceSaved && !hasSeenWelcome) {
      localStorage.setItem('equitymd_seen_dashboard_welcome', 'true');
    }
    
    // Only show modal if they haven't seen it AND have no saved preference
    if (!hasSeenWelcome && !hasPreferenceSaved && profile && !loading) {
      const timer = setTimeout(() => setShowWelcomeModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, [profile, loading]);

  const handleWelcomeChoice = async (view: 'investor' | 'syndicator') => {
    localStorage.setItem('equitymd_seen_dashboard_welcome', 'true');
    setShowWelcomeModal(false);
    setShowConfetti(true);
    setCurrentView(view);
    setTimeout(() => setShowConfetti(false), 4000);
    
    // Always save preference to database when user makes initial choice
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ dashboard_preference: view })
          .eq('id', user.id);
        
        if (!error && profile) {
          setProfile({ ...profile, dashboard_preference: view });
        }
        console.log('Dashboard preference saved:', view);
      } catch (err) {
        console.error('Error saving initial preference:', err);
      }
    }
  };

  const dismissWelcome = () => {
    localStorage.setItem('equitymd_seen_dashboard_welcome', 'true');
    setShowWelcomeModal(false);
  };

  useEffect(() => {
    if (user) {
      checkUserSyndicators();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Set initial view based on URL, syndicator status, and preference
  // Priority: 1) URL-specified view (initialView prop)
  //           2) If user has syndicators -> show syndicator dashboard
  //           3) Else use their saved preference
  //           4) Default to investor
  useEffect(() => {
    if (profile && hasSyndicators !== null) {
      // If URL specified a view, respect it (but only if valid)
      if (hasInitialViewOverride) {
        if (initialView === 'syndicator' && !hasSyndicators) {
          // Can't show syndicator view without syndicators - redirect to main dashboard
          navigate('/dashboard', { replace: true });
        }
        // Otherwise, initialView is already set in state
        return;
      }
      
      // If user has created a syndicator company, default to syndicator view
      if (hasSyndicators) {
        setCurrentView('syndicator');
        // Update preference if not already syndicator
        if (profile.dashboard_preference !== 'syndicator') {
          supabase
            .from('profiles')
            .update({ dashboard_preference: 'syndicator' })
            .eq('id', profile.id)
            .then(() => {
              console.log('Auto-set dashboard preference to syndicator (has syndicators)');
            });
        }
      } else {
        // No syndicators, use their preference or default to investor
        const preference = profile.dashboard_preference || profile.user_type || 'investor';
        if (preference === 'syndicator') {
          // They want syndicator view but don't have syndicators - fall back to investor
          setCurrentView('investor');
        } else {
          setCurrentView(preference);
        }
      }
    }
  }, [profile, hasSyndicators, hasInitialViewOverride, initialView, navigate]);

  async function checkUserSyndicators() {
    try {
      setError(null);
      const { count, error: queryError } = await supabase
        .from('syndicators')
        .select('*', { count: 'exact', head: true })
        .eq('claimed_by', user!.id);
      
      if (queryError) {
        console.error('Syndicator query error:', queryError);
      }
      
      setHasSyndicators((count || 0) > 0);
    } catch (err) {
      console.error('Error checking syndicators:', err);
      setError('Unable to load dashboard. Please try again.');
      setHasSyndicators(false);
    } finally {
      setLoading(false);
    }
  }

  // Save preference when user switches views with smooth transition
  async function handleViewChange(view: 'investor' | 'syndicator') {
    if (view === currentView) return;
    
    setIsTransitioning(true);
    
    // Brief delay for transition effect
    setTimeout(() => {
      setCurrentView(view);
      setTimeout(() => setIsTransitioning(false), 150);
    }, 150);
    
    // Save preference to database
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ dashboard_preference: view })
          .eq('id', user.id);
        
        if (!error && profile) {
          setProfile({ ...profile, dashboard_preference: view });
        }
      } catch (err) {
        console.error('Error saving preference:', err);
      }
    }
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (loading || (!profile && !profileTimeout)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center py-20">
            {profileTimeout ? (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <X className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-gray-800 text-lg font-medium mb-2">Session expired</p>
                <p className="text-gray-500 mb-6">Your session couldn't be restored. Please sign in again.</p>
                <button
                  onClick={async () => {
                    try {
                      await supabase.auth.signOut();
                    } catch (_) {}
                    useAuthStore.getState().clearAuth();
                    window.location.href = '/';
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Sign In Again
                </button>
              </>
            ) : (
              <>
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
                  <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-blue-600 animate-pulse" />
                </div>
                <p className="text-gray-600 mt-6 font-medium">Preparing your dashboard...</p>
              </>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-red-600 mb-4 text-lg">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all hover:shadow-lg font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const canAccessSyndicatorView = profile?.user_type === 'syndicator' || hasSyndicators;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {getGreeting()}, {firstName}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentView === 'investor' 
                  ? 'Discover opportunities and track your investments'
                  : 'Manage your deals and connect with investors'
                }
              </p>
            </div>
            
            {/* Simple View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-xl shadow-sm border border-gray-200">
              <button
                onClick={() => handleViewChange('investor')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  currentView === 'investor'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Investor
              </button>

              <button
                onClick={() => {
                  if (!canAccessSyndicatorView) {
                    navigate('/syndicator-setup');
                  } else {
                    handleViewChange('syndicator');
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  currentView === 'syndicator'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Building2 className="h-4 w-4" />
                Syndicator
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {currentView === 'syndicator' ? (
            <SyndicatorDashboard />
          ) : (
            <InvestorDashboard />
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
