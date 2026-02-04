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
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'investor' | 'syndicator'>(initialView || 'investor');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
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

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
              <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-blue-600 animate-pulse" />
            </div>
            <p className="text-gray-600 mt-6 font-medium">Preparing your dashboard...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Navbar />
      
      {showConfetti && <Confetti />}
      
      {/* Welcome Modal for First-time Users */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
              <button
                onClick={dismissWelcome}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4" />
                  Welcome to EquityMD
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  {getGreeting()}, {firstName}! 👋
                </h2>
                <p className="text-blue-100 text-lg">
                  Choose your dashboard experience
                </p>
              </div>
            </div>
            
            {/* Options */}
            <div className="p-8">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Investor Option */}
                <button
                  onClick={() => handleWelcomeChoice('investor')}
                  className="group p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <TrendingUp className="h-7 w-7 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Investor View</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Browse deals, track investments, and grow your portfolio
                    </p>
                    <ul className="space-y-2">
                      {[
                        'Browse active deals',
                        'Track your investments',
                        'View returns & distributions',
                        'Access due diligence docs'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                      Select Investor <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </button>

                {/* Syndicator Option */}
                <button
                  onClick={() => canAccessSyndicatorView ? handleWelcomeChoice('syndicator') : navigate('/syndicator-setup')}
                  className="group p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Building2 className="h-7 w-7 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Syndicator View</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      List deals, manage investors, and grow your syndication business
                    </p>
                    <ul className="space-y-2">
                      {[
                        'List new investment deals',
                        'Manage investor relations',
                        'Track fundraising progress',
                        'Send updates & documents'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-center gap-2 text-purple-600 font-medium group-hover:gap-3 transition-all">
                      {canAccessSyndicatorView ? 'Select Syndicator' : 'Set Up Profile'} <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </button>
              </div>

              <p className="text-center text-gray-500 text-sm mt-6">
                💡 Don't worry — you can switch views anytime using the toggle above your dashboard
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {getGreeting()}, {firstName}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentView === 'investor' 
                  ? 'Track your investments and discover new opportunities'
                  : 'Manage your deals and connect with investors'
                }
              </p>
            </div>
            
            {/* Dashboard View Toggle - Premium Design */}
            <div className="relative">
              <div className="flex items-center gap-1 p-1.5 bg-white rounded-2xl shadow-lg border border-gray-200/80">
                {/* Investor Toggle */}
                <button
                  onClick={() => handleViewChange('investor')}
                  onMouseEnter={() => setHoveredView('investor')}
                  onMouseLeave={() => setHoveredView(null)}
                  className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    currentView === 'investor'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/30'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <TrendingUp className={`h-4 w-4 transition-transform ${currentView === 'investor' ? 'scale-110' : ''}`} />
                  <span className="hidden sm:inline">Investor</span>
                  <span className="sm:hidden">Invest</span>
                </button>

                {/* Syndicator Toggle */}
                <button
                  onClick={() => {
                    if (!canAccessSyndicatorView) {
                      navigate('/syndicator-setup');
                    } else {
                      handleViewChange('syndicator');
                    }
                  }}
                  onMouseEnter={() => setHoveredView('syndicator')}
                  onMouseLeave={() => setHoveredView(null)}
                  className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    currentView === 'syndicator'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md shadow-purple-500/30'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Building2 className={`h-4 w-4 transition-transform ${currentView === 'syndicator' ? 'scale-110' : ''}`} />
                  <span className="hidden sm:inline">Syndicator</span>
                  <span className="sm:hidden">List</span>
                  {!canAccessSyndicatorView && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                    </span>
                  )}
                </button>
              </div>

              {/* Hover Tooltips */}
              {hoveredView === 'investor' && currentView !== 'investor' && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-gray-100 w-56 z-10 animate-fade-in">
                  <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                    <TrendingUp className="h-4 w-4" />
                    Investor View
                  </div>
                  <ul className="space-y-1.5 text-xs text-gray-600">
                    <li className="flex items-center gap-1.5"><BarChart3 className="h-3 w-3" /> Browse active deals</li>
                    <li className="flex items-center gap-1.5"><DollarSign className="h-3 w-3" /> Track investments</li>
                    <li className="flex items-center gap-1.5"><FileText className="h-3 w-3" /> Access documents</li>
                  </ul>
                </div>
              )}

              {hoveredView === 'syndicator' && currentView !== 'syndicator' && canAccessSyndicatorView && (
                <div className="absolute top-full right-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-gray-100 w-56 z-10 animate-fade-in">
                  <div className="flex items-center gap-2 text-purple-600 font-medium mb-2">
                    <Building2 className="h-4 w-4" />
                    Syndicator View
                  </div>
                  <ul className="space-y-1.5 text-xs text-gray-600">
                    <li className="flex items-center gap-1.5"><Plus className="h-3 w-3" /> List new deals</li>
                    <li className="flex items-center gap-1.5"><Users className="h-3 w-3" /> Manage investors</li>
                    <li className="flex items-center gap-1.5"><BarChart3 className="h-3 w-3" /> Track fundraising</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Quick CTA for non-syndicators */}
          {!canAccessSyndicatorView && (
            <button
              onClick={() => navigate('/syndicator-setup')}
              className="mt-4 inline-flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-xl hover:bg-purple-100 transition font-medium group"
            >
              <Plus className="h-4 w-4" />
              <span>Have a deal to list? Become a Syndicator</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Dashboard Content with Transition */}
        <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          {currentView === 'syndicator' ? (
            <SyndicatorDashboard />
          ) : (
            <InvestorDashboard />
          )}
        </div>
      </div>
      
      <Footer />

      {/* Add required animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
