import { useState, useEffect } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { InvestorDashboard, SyndicatorDashboard } from '../components/Dashboard';
import { useAuthStore } from '../lib/store';
import { supabase, withTimeout } from '../lib/supabase';
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
  ArrowRight,
  Eye,
  Edit
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
  const { user, profile, setProfile, isAdmin } = useAuthStore();
  const adminMode = isAdmin();
  const navigate = useNavigate();
  const [adminDeals, setAdminDeals] = useState<any[]>([]);
  const [adminDealsLoading, setAdminDealsLoading] = useState(false);
  // Admin-only: newest signups to the site
  const [recentSignups, setRecentSignups] = useState<any[]>([]);
  const [signupsLoading, setSignupsLoading] = useState(false);
  // Admin-only: deals others submitted that are awaiting review
  const [pendingDeals, setPendingDeals] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  // Admin-only: recent interest (who's eyeing my created deals)
  const [recentInterest, setRecentInterest] = useState<any[]>([]);
  const [showAllSignups, setShowAllSignups] = useState(false);
  const [actioningDeal, setActioningDeal] = useState<string | null>(null);
  const [hasSyndicators, setHasSyndicators] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileTimeout, setProfileTimeout] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'investor' | 'syndicator'>(initialView || 'investor');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Admin: load deals THIS admin personally created (incl. ones posted on behalf
  // of syndicators). Scoped to created_by = me, so deals other people created
  // for other syndicators do NOT appear here.
  useEffect(() => {
    if (user && adminMode) {
      (async () => {
        try {
          setAdminDealsLoading(true);
          const { data, error } = await supabase
            .from('deals')
            .select(`id, title, location, status, total_equity, cover_image_url, slug, created_at, created_by, syndicator:syndicator_id ( company_name )`)
            .eq('created_by', user.id)
            .order('created_at', { ascending: false });
          if (error) throw error;
          setAdminDeals(data || []);
        } catch (e) {
          console.error('Error fetching admin created deals:', e);
        } finally {
          setAdminDealsLoading(false);
        }
      })();

      // Recent signups (newest profiles)
      (async () => {
        try {
          setSignupsLoading(true);
          const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, user_type, created_at')
            .order('created_at', { ascending: false })
            .limit(25);
          if (error) throw error;
          setRecentSignups(data || []);
        } catch (e) {
          console.error('Error fetching recent signups:', e);
        } finally {
          setSignupsLoading(false);
        }
      })();

      // Pending deals awaiting review
      (async () => {
        try {
          setPendingLoading(true);
          const { data, error } = await supabase
            .from('deals')
            .select(`id, title, slug, location, created_at, approval_status, syndicator:syndicator_id ( company_name )`)
            .eq('approval_status', 'pending')
            .order('created_at', { ascending: false });
          if (error) throw error;
          setPendingDeals(data || []);
        } catch (e) {
          console.error('Error fetching pending deals:', e);
        } finally {
          setPendingLoading(false);
        }
      })();

      // Recent interest on MY created deals (investment requests)
      (async () => {
        try {
          // First get my deal ids
          const { data: myDeals } = await supabase
            .from('deals')
            .select('id, title, slug')
            .eq('created_by', user.id);
          const dealMap = new Map((myDeals || []).map((d: any) => [d.id, d]));
          const dealIds = (myDeals || []).map((d: any) => d.id);
          if (dealIds.length === 0) { setRecentInterest([]); return; }
          const { data: reqs } = await supabase
            .from('investment_requests')
            .select('id, deal_id, user_id, amount, status, created_at')
            .in('deal_id', dealIds)
            .order('created_at', { ascending: false })
            .limit(10);
          // hydrate investor names
          const userIds = [...new Set((reqs || []).map((r: any) => r.user_id))];
          const { data: profs } = userIds.length
            ? await supabase.from('profiles').select('id, full_name, email').in('id', userIds)
            : { data: [] as any[] };
          const profMap = new Map((profs || []).map((p: any) => [p.id, p]));
          setRecentInterest((reqs || []).map((r: any) => ({
            ...r,
            deal: dealMap.get(r.deal_id),
            investor: profMap.get(r.user_id),
          })));
        } catch (e) {
          console.error('Error fetching recent interest:', e);
        }
      })();
    }
  }, [user, adminMode]);

  // Inline approve/reject for pending deals
  async function handleDealAction(dealId: string, action: 'approved' | 'rejected') {
    setActioningDeal(dealId);
    try {
      await supabase
        .from('deals')
        .update({
          approval_status: action,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', dealId);
      setPendingDeals((prev) => prev.filter((d) => d.id !== dealId));
    } catch (e) {
      console.error('Error updating deal approval:', e);
    } finally {
      setActioningDeal(null);
    }
  }

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
    
    // Profile not loaded yet — retry every 2s up to 3 times
    let retries = 0;
    const timer = setInterval(async () => {
      retries++;
      if (useAuthStore.getState().profile) {
        clearInterval(timer);
        return;
      }
      console.log(`[Dashboard] Profile retry ${retries}/3 for user ${user?.id}`);
      try {
        const { data: profileData } = await withTimeout(
          supabase.from('profiles').select('*').eq('id', user!.id).maybeSingle(),
          7000,
          'dashboardProfileRetry'
        );
        if (profileData) {
          console.log('[Dashboard] Profile loaded on retry');
          useAuthStore.getState().setProfile(profileData);
          setLoading(false);
          clearInterval(timer);
          return;
        }
      } catch (err) {
        console.error('[Dashboard] Profile retry failed:', err);
      }
      if (retries >= 3) {
        console.warn('[Dashboard] Profile not found after 3 retries');
        setProfileTimeout(true);
        clearInterval(timer);
      }
    }, 2000);
    
    return () => clearInterval(timer);
  }, [profile, user]);

  // Hard ceiling: if loading hasn't resolved in 5s, force it.
  useEffect(() => {
    const hardCeiling = setTimeout(() => {
      if (loading) {
        console.warn('[Dashboard] Hard ceiling hit — forcing loading=false');
        setLoading(false);
      }
    }, 5000);
    return () => clearTimeout(hardCeiling);
  }, [loading]);

  // Final fallback: if we have a user but the profile NEVER loads (e.g. a stale
  // token made every query hang/timeout) and the retry path somehow didn't trip,
  // force the "Session expired" escape hatch after 20s so the user is never
  // trapped forever on "Preparing your dashboard...".
  useEffect(() => {
    if (!user || profile || profileTimeout) return;
    const trap = setTimeout(() => {
      if (!useAuthStore.getState().profile) {
        console.warn('[Dashboard] Profile never loaded after 20s — showing escape hatch');
        setProfileTimeout(true);
        setLoading(false);
      }
    }, 20000);
    return () => clearTimeout(trap);
  }, [user, profile, profileTimeout]);

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
      const { count, error: queryError } = await withTimeout(
        supabase
          .from('syndicators')
          .select('*', { count: 'exact', head: true })
          .eq('claimed_by', user!.id),
        8000,
        'checkUserSyndicators'
      );
      
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
      <SEO title="My Dashboard | EquityMD" noindex={true} />
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

        {/* Admin: Needs You summary bar */}
        {adminMode && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Pending Review', value: pendingDeals.length, accent: 'text-amber-600', bg: 'bg-amber-50', ring: 'border-amber-200', anchor: 'sec-pending' },
              { label: 'Recent Interest', value: recentInterest.length, accent: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'border-emerald-200', anchor: 'sec-interest' },
              { label: 'My Deals', value: adminDeals.length, accent: 'text-blue-600', bg: 'bg-blue-50', ring: 'border-blue-200', anchor: 'sec-deals' },
              { label: 'New Signups', value: recentSignups.length, accent: 'text-purple-600', bg: 'bg-purple-50', ring: 'border-purple-200', anchor: 'sec-signups' },
            ].map((t) => (
              <button
                key={t.label}
                onClick={() => document.getElementById(t.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className={`${t.bg} border ${t.ring} rounded-2xl p-5 text-left hover:shadow-md transition cursor-pointer`}
              >
                <div className={`text-3xl font-bold ${t.accent}`}>{t.value}</div>
                <div className="text-sm text-gray-600 mt-1">{t.label}</div>
              </button>
            ))}
          </div>
        )}

        {/* Admin: Pending Deals to Review */}
        {adminMode && (
          <div id="sec-pending" className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden mb-8 scroll-mt-24">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-amber-50/40">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pending Deals to Review</h2>
                <p className="text-gray-500 text-sm">Deals submitted by syndicators awaiting your approval</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${pendingDeals.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'}`}>
                  {pendingLoading ? 'Loading…' : `${pendingDeals.length} pending`}
                </span>
                <Link to="/admin" className="text-sm font-medium text-blue-600 hover:text-blue-800">Review queue →</Link>
              </div>
            </div>
            {pendingDeals.length === 0 && !pendingLoading ? (
              <div className="p-8 text-center text-sm text-gray-500">Nothing waiting — no deals pending review. 🎉</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Syndicator</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingDeals.map((deal) => {
                      const dealSlug = deal.slug || deal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      return (
                        <tr key={deal.id} className="bg-amber-50/20">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                            <div className="text-sm text-gray-500">{deal.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{deal.syndicator?.company_name || '—'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {deal.created_at ? new Date(deal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDealAction(deal.id, 'approved')}
                                disabled={actioningDeal === deal.id}
                                className="inline-flex items-center px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-xs font-semibold disabled:opacity-50"
                              >
                                {actioningDeal === deal.id ? '…' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleDealAction(deal.id, 'rejected')}
                                disabled={actioningDeal === deal.id}
                                className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-xs font-semibold disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <Link to={`/deals/${deal.slug || ''}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">View</Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Admin: Connected Deals — deals posted on behalf of syndicators (shown on either view) */}
        {adminMode && (
          <div id="sec-deals" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 scroll-mt-24">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">My Created Deals</h2>
                <p className="text-gray-500 text-sm">Deals you created — including ones connected to a syndicator</p>
              </div>
              <span className="text-sm font-medium text-gray-500">
                {adminDealsLoading ? 'Loading…' : `${adminDeals.length} deal${adminDeals.length !== 1 ? 's' : ''}`}
              </span>
            </div>
            {adminDeals.length === 0 && !adminDealsLoading ? (
              <div className="p-8 text-center text-sm text-gray-500">
                You haven't created any deals yet. Use <span className="font-medium">New Deal</span> to create one (you can connect it to any syndicator).
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Syndicator</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Raise</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {adminDeals.map((deal) => {
                      const dealSlug = deal.slug || deal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      return (
                        <tr key={deal.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link to={`/deals/${dealSlug}`} className="flex items-center group">
                              <img
                                className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                                src={deal.cover_image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'}
                                alt={deal.title}
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{deal.title}</div>
                                <div className="text-sm text-gray-500">{deal.location}</div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{deal.syndicator?.company_name || '—'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              deal.status === 'active' ? 'bg-green-100 text-green-800' :
                              deal.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Number(deal.total_equity || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <Link to={`/deals/${dealSlug}`} className="text-blue-600 hover:text-blue-900" title="View deal">
                                <Eye className="h-5 w-5" />
                              </Link>
                              <Link to={`/deals/${dealSlug}/edit`} className="text-gray-600 hover:text-blue-900" title="Edit deal">
                                <Edit className="h-5 w-5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Admin: Recent Interest (who's eyeing my deals) */}
        {adminMode && recentInterest.length > 0 && (
          <div id="sec-interest" className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden mb-8 scroll-mt-24">
            <div className="px-6 py-5 border-b border-gray-100 bg-emerald-50/40">
              <h2 className="text-xl font-bold text-gray-900">Recent Interest</h2>
              <p className="text-gray-500 text-sm">People expressing interest in deals you created — give your syndicator a heads-up</p>
            </div>
            <div className="divide-y divide-gray-100">
              {recentInterest.map((r) => (
                <div key={r.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {r.investor?.full_name || 'Someone'} · <span className="text-emerald-700">{r.deal?.title || 'a deal'}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {r.amount ? `$${Number(r.amount).toLocaleString()} interest` : 'Expressed interest'}
                      {r.created_at ? ` · ${new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {r.investor?.email && (
                      <a href={`mailto:${r.investor.email}`} className="text-sm text-blue-600 hover:text-blue-800">Email</a>
                    )}
                    {r.deal?.slug && (
                      <Link to={`/deals/${r.deal.slug}`} className="text-sm text-gray-600 hover:text-gray-900">View deal</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin: Recent Signups */}
        {adminMode && (
          <div id="sec-signups" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 scroll-mt-24">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">New Signups</h2>
                <p className="text-gray-500 text-sm">Newest users to join the site</p>
              </div>
              <span className="text-sm font-medium text-gray-500">
                {signupsLoading ? 'Loading…' : `${recentSignups.length} recent`}
              </span>
            </div>
            {recentSignups.length === 0 && !signupsLoading ? (
              <div className="p-8 text-center text-sm text-gray-500">No signups yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(showAllSignups ? recentSignups : recentSignups.slice(0, 5)).map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.full_name || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {u.email ? <a href={`mailto:${u.email}`} className="text-blue-600 hover:text-blue-800">{u.email}</a> : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            u.user_type === 'syndicator' ? 'bg-purple-100 text-purple-800' :
                            u.user_type === 'investor' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {u.user_type ? u.user_type.charAt(0).toUpperCase() + u.user_type.slice(1) : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {recentSignups.length > 5 && (
                  <button
                    onClick={() => setShowAllSignups((s) => !s)}
                    className="w-full py-3 text-sm font-medium text-blue-600 hover:bg-gray-50 border-t border-gray-100 transition"
                  >
                    {showAllSignups ? 'Show less' : `View all ${recentSignups.length} signups →`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

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
