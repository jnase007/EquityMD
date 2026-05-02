import React, { useEffect, useState, Suspense, lazy, useCallback } from 'react';

// Build version check — type in console: window.__EQUITYMD_BUILD__
declare const __BUILD_TIME__: string;
(window as any).__EQUITYMD_BUILD__ = __BUILD_TIME__;
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore } from './lib/store';
import { preloadCriticalResources, preloadRoute } from './utils/performance';
import { authLogger } from './lib/logger';
import { initGA, trackPageView } from './lib/gtag';

// Force deployment refresh - production loading fix
// Lazy load with chunk-error recovery: if a deploy nukes old chunks,
// retry once (auto-reload) instead of showing a blank page forever.
function lazyRetry<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T } | { [key: string]: T }>,
  namedExport?: string
): React.LazyExoticComponent<T> {
  return lazy(() =>
    (importFn() as Promise<any>)
      .then((module: any) => ({ default: namedExport ? module[namedExport] : module.default }))
      .catch((err: any) => {
        // Chunk load failed — likely a new deploy. Reload once.
        const key = 'chunk_reload_' + window.location.pathname;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          window.location.reload();
          // Return a never-resolving promise to prevent React from rendering the error
          return new Promise(() => {});
        }
        // Already reloaded once — let ErrorBoundary handle it
        throw err;
      })
  );
}

const Home = lazyRetry(() => import('./pages/Home'), 'Home');
const Browse = lazyRetry(() => import('./pages/Browse'), 'Browse');
const Profile = lazyRetry(() => import('./pages/ProfileNew'), 'ProfileNew');
const Dashboard = lazyRetry(() => import('./pages/UnifiedDashboard'), 'UnifiedDashboard');
const Welcome = lazyRetry(() => import('./pages/Welcome'), 'Welcome');
const DealDetails = lazyRetry(() => import('./pages/DealDetails'), 'DealDetails');
const NewDeal = lazyRetry(() => import('./pages/NewDeal'), 'NewDeal');
const EditDeal = lazyRetry(() => import('./pages/EditDeal'), 'EditDeal');
const SyndicatorProfile = lazyRetry(() => import('./pages/SyndicatorProfile'), 'SyndicatorProfile');
const Directory = lazyRetry(() => import('./pages/Directory'), 'Directory');
const Compare = lazyRetry(() => import('./pages/Compare'), 'Compare');
const Rankings = lazyRetry(() => import('./pages/Rankings'), 'Rankings');
const MarketMap = lazyRetry(() => import('./pages/MarketMap'), 'MarketMap');
const Inbox = lazyRetry(() => import('./pages/Inbox'), 'Inbox');
const AdminDashboard = lazyRetry(() => import('./pages/admin/Dashboard'));
const Favorites = lazyRetry(() => import('./pages/Favorites'), 'Favorites');
const Portfolio = lazyRetry(() => import('./pages/Portfolio'), 'Portfolio');
const BrandingGuide = lazyRetry(() => import('./pages/BrandingGuide'), 'BrandingGuide');
const Leaderboard = lazyRetry(() => import('./pages/Leaderboard'), 'Leaderboard');
const Discover = lazyRetry(() => import('./pages/Discover'), 'Discover');
const Calendar = lazyRetry(() => import('./pages/Calendar'), 'Calendar');
const Goals = lazyRetry(() => import('./pages/Goals'), 'Goals');
const SyndicatorSetup = lazyRetry(() => import('./pages/SyndicatorSetup'), 'SyndicatorSetup');
// GoToMarket merged into Strategy — /gtm redirects to /strategy
const Strategy = lazyRetry(() => import('./pages/Strategy'));
const InvestorFeed = lazyRetry(() => import('./pages/InvestorFeed'));

// Keep lightweight components as regular imports
import { NotFound } from './pages/NotFound';
import { HowItWorks } from './pages/HowItWorks';
import { HowItWorksImproved } from './pages/HowItWorksImproved';

import { SuccessStories } from './pages/SuccessStories';
import { DueDiligence } from './pages/resources/DueDiligence';
import { InvestmentCalculator } from './pages/resources/InvestmentCalculator';
// import { MarketReports } from './pages/resources/MarketReports';
import { MarketReportsHub } from './pages/resources/market-reports/index';
import { StateMarketReport } from './pages/resources/market-reports/[state]';
import { CityMarketReport } from './pages/cities/[city]';
// import { CityDeals } from './pages/CityDeals';
import { Education } from './pages/resources/Education';
import { Glossary } from './pages/resources/Glossary';
import { Privacy } from './pages/legal/Privacy';
import { Terms } from './pages/legal/Terms';
import { Disclaimer } from './pages/legal/Disclaimer';
import { Accreditation } from './pages/legal/Accreditation';
import { Compliance } from './pages/legal/Compliance';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { Pricing } from './pages/Pricing';
import { NewPricing } from './pages/new-pricing';
import { EmailPreview } from './pages/EmailPreview';
import { EmailTest } from './pages/EmailTest';
import { LoaderDemo } from './pages/LoaderDemo';
import { TestMessaging } from './pages/TestMessaging';
import { TestAuth } from './pages/TestAuth';
import { OnboardingDemo } from './pages/OnboardingDemo';
import { AuthModal } from './components/AuthModal';
// Signup pages removed - now using simplified social auth flow
// All users start as investors and can upgrade to syndicator when listing a deal
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { DashboardReview } from './pages/DashboardReview';
import { TooltipDemo } from './pages/TooltipDemo';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminErrorBoundary } from './components/AdminErrorBoundary';
import { ScrollToTop } from './components/ScrollToTop';
// CookieConsent removed per user request
// import { CookieConsent } from './components/CookieConsent';
import { ExitIntentPopup } from './components/ExitIntentPopup';
import { FeedbackWedge } from './components/FeedbackWedge';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { consumeOAuthNextPath, clearOAuthNextPath } from './lib/oauthRedirect';

// Minimal loading fallback for Suspense boundaries
const MinimalLoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    <div className="h-16 bg-white border-b border-gray-200"></div>
    <div className="p-8">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>
);

// Emergency logout route — always accessible, clears everything
function LogoutRoute() {
  useEffect(() => {
    supabase.auth.signOut().finally(() => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    });
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Signing out...</p>
    </div>
  );
}

export default function App() {
  const { user, profile, setUser, setProfile, clearAuth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [requireAuth, setRequireAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Enable keyboard shortcuts for power users
  useKeyboardShortcuts();

  // Initialize Google Analytics and preload critical resources on app start
  useEffect(() => {
    initGA();
    preloadCriticalResources();
  }, []);

  // Track page views on route change
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  // Scroll to top on route change (but not for hash-only changes)
  useEffect(() => {
    // Only scroll to top if there's no hash (hash navigation is handled by individual pages)
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  // Preload likely next routes based on current page
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Preload common next routes
    if (currentPath === '/') {
      preloadRoute(() => import('./pages/Browse'));
      preloadRoute(() => import('./pages/Directory'));
    } else if (currentPath === '/find') {
      preloadRoute(() => import('./pages/DealDetails'));
    } else if (currentPath === '/directory') {
      preloadRoute(() => import('./pages/SyndicatorProfile'));
    }
  }, [location.pathname]);

  const fetchProfile = useCallback(async (userId: string, retryCount = 0) => {
    try {
      authLogger.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        if (error.message.includes('fetch') && retryCount < 3) {
          authLogger.log(`Retrying profile fetch... Attempt ${retryCount + 1}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return fetchProfile(userId, retryCount + 1);
        }
        throw error;
      }

      if (!data) {
        authLogger.log('No profile found, creating profile automatically...');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');

        authLogger.log('User metadata:', user.user_metadata);
        authLogger.log('App metadata:', user.app_metadata);

        // For social users, create profile automatically as investor (default)
        // For email users, also create profile automatically
        const userType = user.user_metadata?.user_type || 'investor';
        
        authLogger.log('Creating profile with user type:', userType);
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url,
            user_type: userType,
            is_verified: true
          }])
          .select()
          .single();

        if (createError) {
          authLogger.error('Error creating profile:', createError);
          throw createError;
        }

        authLogger.log('Profile created successfully:', newProfile);

        // Create type-specific profile
        if (newProfile.user_type === 'investor') {
          authLogger.log('Creating investor profile...');
          const { error: investorError } = await supabase
            .from('investor_profiles')
            .insert([{ 
              id: userId,
              accredited_status: false,
              investment_preferences: {},
              preferred_property_types: [],
              preferred_locations: []
            }]);
          
          if (investorError) {
            authLogger.error('Error creating investor profile:', investorError);
          } else {
            authLogger.log('Investor profile created successfully');
          }
        } else {
          authLogger.log('Creating syndicator profile...');
          const { error: syndicatorError } = await supabase
            .from('syndicator_profiles')
            .insert([{ 
              id: userId,
              company_name: user.user_metadata?.full_name || 'My Company',
              verification_documents: {}
            }]);
          
          if (syndicatorError) {
            authLogger.error('Error creating syndicator profile:', syndicatorError);
          } else {
            authLogger.log('Syndicator profile created successfully');
          }
        }

        setProfile(newProfile);
        return;
      }

      authLogger.log('Profile found:', data);
      setProfile(data);
    } catch (error: any) {
      authLogger.error('Error in fetchProfile:', error);
      // NEVER clear auth from profile fetch errors.
      // Only onAuthStateChange SIGNED_OUT should clear auth.
      // Profile fetch can fail for many transient reasons (deploy, network, stale token)
      // and the session may still be perfectly valid.
      authLogger.log('Profile fetch failed — keeping session, will retry on next navigation');
    }
  }, [clearAuth, setProfile]);

  useEffect(() => {
    let mounted = true;
    let authProcessed = false;
    
    // Check if this is an OAuth callback (has hash fragment with tokens)
    const hasAuthTokens = window.location.hash.includes('access_token') || 
                          window.location.hash.includes('error=');
    
    if (hasAuthTokens) {
      authLogger.log('OAuth callback detected in URL hash');
    }
    
    // IMPORTANT: Set up onAuthStateChange FIRST - this catches the SIGNED_IN event
    // that Supabase fires when it parses tokens from the URL hash
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      authLogger.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'INITIAL_SESSION') {
        // This fires immediately with the current session (or null)
        authLogger.log('Initial session event:', session?.user?.id);
        setUser(session?.user ?? null);
        if (session?.user) {
          try {
            await fetchProfile(session.user.id);
          } catch (profileError) {
            console.error('Profile fetch error:', profileError);
          }
        }
        authProcessed = true;
        setAuthLoading(false);
        
        // Clean up URL hash after processing
        if (hasAuthTokens) {
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }
      } else if (event === 'SIGNED_IN') {
        authLogger.log('User signed in:', session?.user?.id);
        setUser(session?.user ?? null);
        if (session?.user) {
          try {
            await fetchProfile(session.user.id);
            await syncGuestFavorites(session.user.id);
          } catch (profileError) {
            console.error('Profile fetch error:', profileError);
          }
        }
        if (!authProcessed) {
          setAuthLoading(false);
        }
        
        // Clean up URL hash after sign in
        if (hasAuthTokens) {
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }
      } else if (event === 'SIGNED_OUT') {
        clearAuth();
        setAuthLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        authLogger.log('Token refreshed');
        // Only update user if session is valid — never set to null on refresh
        if (session?.user) {
          setUser(session.user);
        }
      }
    });

    // Fetch site settings
    fetchSiteSettings();
    
    // Fallback: If no auth event fires within 2 seconds, set loading to false
    // This handles the case where there's no session and no hash tokens
    const fallbackTimeout = setTimeout(() => {
      if (!authProcessed && mounted) {
        authLogger.log('Auth fallback timeout - no session detected');
        setAuthLoading(false);
      }
    }, 2000);
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, [clearAuth, setUser, fetchProfile]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash.includes('error=')) {
      clearOAuthNextPath();
      authLogger.log('OAuth error in URL hash; cleared pending redirect');
    }
  }, []);

  // After Google/OAuth, Supabase redirects to site root (see AuthModal) so redirect URLs match dashboard allowlist.
  // Apply the intended path (e.g. /dashboard) once session exists.
  useEffect(() => {
    if (!user) return;
    const next = consumeOAuthNextPath();
    if (!next) return;
    if (next === location.pathname + (location.search || '')) return;
    navigate(next, { replace: true });
  }, [user, navigate, location.pathname, location.search]);

  // Safety net: if user exists but profile is still null after 3s, retry profile fetch
  useEffect(() => {
    if (!user || profile) return;
    const retryTimer = setTimeout(async () => {
      if (useAuthStore.getState().profile) return; // Already loaded
      authLogger.log('Profile still null after 3s — retrying fetch');
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (data) {
          setProfile(data);
          authLogger.log('Profile loaded on retry');
        } else {
          authLogger.log('Profile still not found on retry');
        }
      } catch (err) {
        authLogger.error('Profile retry failed:', err);
      }
    }, 3000);
    return () => clearTimeout(retryTimer);
  }, [user, profile, setProfile]);

  // Session recovery on tab resume (handles iOS suspension and network reconnection)
  // Just refresh silently — never clear auth from here. Let onAuthStateChange handle SIGNED_OUT.
  useEffect(() => {
    const handleResume = async () => {
      if (document.visibilityState !== 'visible') return;
      
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) return;
      
      try {
        authLogger.log('Tab resumed — refreshing session silently');
        await supabase.auth.refreshSession();
        // If refresh fails, onAuthStateChange will fire SIGNED_OUT and clearAuth there
      } catch (err) {
        authLogger.log('Resume refresh error (non-fatal):', err);
        // Don't clear auth — let the normal auth flow handle it
      }
    };

    document.addEventListener('visibilitychange', handleResume);
    
    return () => {
      document.removeEventListener('visibilitychange', handleResume);
    };
  }, []);

  // Sync guest favorites from localStorage to database when user logs in
  async function syncGuestFavorites(userId: string) {
    try {
      const guestFavorites = JSON.parse(localStorage.getItem('equitymd_guest_favorites') || '[]');
      if (guestFavorites.length === 0) return;

      // Insert each favorite (ignore duplicates)
      for (const dealId of guestFavorites) {
        await supabase
          .from('favorites')
          .upsert({ investor_id: userId, deal_id: dealId }, { onConflict: 'investor_id,deal_id' })
          .select();
      }

      // Clear localStorage after syncing
      localStorage.removeItem('equitymd_guest_favorites');
      authLogger.log('Synced', guestFavorites.length, 'guest favorites to database');
    } catch (error) {
      console.error('Error syncing guest favorites:', error);
    }
  }

  async function fetchSiteSettings() {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('require_auth')
        .single();

      if (error) throw error;
      setRequireAuth(data?.require_auth || false);
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/find', '/directory', '/how-it-works', '/contact', '/about', '/blog', '/legal/privacy', '/legal/terms', '/legal/disclaimer', '/resources/glossary', '/pricing', '/email-preview', '/email-test', '/loader-demo', '/test-messaging', '/test-auth', '/tooltip-demo', '/onboarding-demo', '/admin', '/dashboard-review', '/gtm', '/strategy', '/rankings', '/compare'];

  // Check if current route requires authentication
  const requiresAuth = !publicRoutes.includes(location.pathname);

  // Show auth modal if route requires auth and user is not logged in
  useEffect(() => {
    if (requireAuth && requiresAuth && !user) {
      setShowAuthModal(true);
    }
  }, [location.pathname, requireAuth, user, requiresAuth]);

  // Debug authentication state (only in development)
  useEffect(() => {
    authLogger.log('State:', {
      user: user?.id,
      profile: profile?.id,
      requireAuth,
      requiresAuth,
      authLoading,
      currentPath: location.pathname,
      showAuthModal
    });
  }, [user, profile, requireAuth, requiresAuth, authLoading, location.pathname, showAuthModal]);

  return (
    <div className="transition-opacity duration-300 ease-in-out">
      <ErrorBoundary>
        <Suspense fallback={<MinimalLoadingFallback />}>
          <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/how-it-works-improved" element={<HowItWorksImproved />} />
        <Route path="/branding" element={<BrandingGuide />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/new-pricing" element={<NewPricing />} />
        <Route path="/email-preview" element={<EmailPreview />} />
        <Route path="/email-test" element={<EmailTest />} />
        <Route path="/gtm" element={<Navigate to="/strategy" replace />} />
        <Route path="/strategy" element={<Strategy />} />
        <Route path="/loader-demo" element={<LoaderDemo />} />
        <Route path="/legal/privacy" element={<Privacy />} />
        <Route path="/legal/terms" element={<Terms />} />
        <Route path="/legal/disclaimer" element={<Disclaimer />} />
        <Route path="/resources/glossary" element={<Glossary />} />

        {/* Signup Routes - Redirect to home (auth handled via modal) */}
        <Route path="/signup/*" element={<Navigate to="/" replace />} />

        {/* Public Browse Routes - No Authentication Required */}
        <Route path="/find" element={<Browse />} />
        {/* Redirect old /browse URL to /find */}
        <Route path="/browse" element={<Navigate to="/find" replace />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/compare/:slug1/:slug2" element={<Compare />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/rankings/:category" element={<Rankings />} />
        
        {/* Protected Routes */}
        <Route 
          path="/success-stories" 
          element={authLoading ? <MinimalLoadingFallback /> : (requireAuth && !user ? <Navigate to="/" /> : <SuccessStories />)} 
        />
        <Route 
          path="/resources/due-diligence" 
          element={authLoading ? <MinimalLoadingFallback /> : (requireAuth && !user ? <Navigate to="/" /> : <DueDiligence />)} 
        />
        <Route 
          path="/resources/calculator" 
          element={authLoading ? <MinimalLoadingFallback /> : (requireAuth && !user ? <Navigate to="/" /> : <InvestmentCalculator />)} 
        />
        <Route 
          path="/resources/market-reports" 
          element={authLoading ? <MinimalLoadingFallback /> : (requireAuth && !user ? <Navigate to="/" /> : <MarketReportsHub />)} 
        />
        <Route 
          path="/resources/market-reports/:state" 
          element={authLoading ? <MinimalLoadingFallback /> : (requireAuth && !user ? <Navigate to="/" /> : <StateMarketReport />)} 
        />
        <Route 
          path="/resources/education" 
          element={authLoading ? <MinimalLoadingFallback /> : (requireAuth && !user ? <Navigate to="/" /> : <Education />)} 
        />
        <Route 
          path="/market-map" 
          element={authLoading ? <MinimalLoadingFallback /> : (requireAuth && !user ? <Navigate to="/" /> : <MarketMap />)} 
        />
        <Route 
          path="/legal/accreditation" 
          element={authLoading ? <MinimalLoadingFallback /> : (requireAuth && !user ? <Navigate to="/" /> : <Accreditation />)} 
        />
        <Route 
          path="/legal/compliance" 
          element={authLoading ? <MinimalLoadingFallback /> : (requireAuth && !user ? <Navigate to="/" /> : <Compliance />)} 
        />
        <Route path="/cities/:city" element={<CityMarketReport />} />
        
        {/* Public content pages - NO auth required for SEO indexing */}
        <Route path="/deals/:slug" element={<DealDetails />} />
        <Route path="/syndicators/:slug" element={<SyndicatorProfile />} />
        <Route 
          path="/profile" 
          element={authLoading ? <MinimalLoadingFallback /> : (requireAuth && !user ? <Navigate to="/" /> : <Profile />)} 
        />
        <Route 
          path="/welcome" 
          element={authLoading ? <MinimalLoadingFallback /> : (!user ? <Navigate to="/" /> : <Welcome />)} 
        />
        <Route
          path="/dashboard"
          element={authLoading ? <MinimalLoadingFallback /> : (!user ? <Navigate to="/" /> : <Dashboard />)}
        />
        <Route
          path="/dashboard/investor"
          element={authLoading ? <MinimalLoadingFallback /> : (!user ? <Navigate to="/" /> : <Dashboard initialView="investor" />)}
        />
        <Route
          path="/dashboard/syndicator"
          element={authLoading ? <MinimalLoadingFallback /> : (!user ? <Navigate to="/" /> : <Dashboard initialView="syndicator" />)}
        />
        <Route
          path="/dashboard/investor-feed"
          element={authLoading ? <MinimalLoadingFallback /> : (!user ? <Navigate to="/" /> : <InvestorFeed />)}
        />
        <Route 
          path="/deals/new" 
          element={authLoading ? <MinimalLoadingFallback /> : (requireAuth && !user ? <Navigate to="/" /> : <NewDeal />)} 
        />
        <Route 
          path="/syndicator-setup" 
          element={authLoading ? <MinimalLoadingFallback /> : (!user ? <Navigate to="/" /> : <SyndicatorSetup />)} 
        />
        <Route 
          path="/deals/:slug/edit" 
          element={authLoading ? <MinimalLoadingFallback /> : (requireAuth && !user ? <Navigate to="/" /> : <EditDeal />)} 
        />
        <Route 
          path="/inbox" 
          element={authLoading ? <MinimalLoadingFallback /> : (requireAuth && !user ? <Navigate to="/" /> : <Inbox />)} 
        />
        <Route 
          path="/favorites" 
          element={authLoading ? <MinimalLoadingFallback /> : (requireAuth && !user ? <Navigate to="/" /> : <Favorites />)} 
        />
        <Route 
          path="/portfolio" 
          element={authLoading ? <MinimalLoadingFallback /> : (!user ? <Navigate to="/" /> : <Portfolio />)} 
        />
        <Route 
          path="/discover" 
          element={authLoading ? <MinimalLoadingFallback /> : (!user ? <Navigate to="/" /> : <Discover />)} 
        />
        <Route 
          path="/calendar" 
          element={authLoading ? <MinimalLoadingFallback /> : (!user ? <Navigate to="/" /> : <Calendar />)} 
        />
        <Route 
          path="/goals" 
          element={authLoading ? <MinimalLoadingFallback /> : (!user ? <Navigate to="/" /> : <Goals />)} 
        />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminErrorBoundary>
            <AdminDashboard />
          </AdminErrorBoundary>
        } />

        {/* Dashboard Review Route - No Authentication Required */}
        <Route path="/dashboard-review" element={<DashboardReview />} />

        {/* Test Messaging Route */}
        <Route path="/test-messaging" element={<TestMessaging />} />

        {/* Test Auth Route */}
        <Route path="/test-auth" element={<TestAuth />} />

        {/* Tooltip Demo Route */}
        <Route path="/tooltip-demo" element={<TooltipDemo />} />

        {/* Onboarding Demo Route */}
        <Route path="/onboarding-demo" element={<OnboardingDemo />} />

        {/* Emergency logout route */}
        <Route path="/logout" element={<LogoutRoute />} />
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          defaultView="sign_in"
        />
      )}

      <PerformanceMonitor />
      <ScrollToTop />
      {/* <CookieConsent /> */}
      <ExitIntentPopup />
      <FeedbackWedge />
    </div>
  );
}