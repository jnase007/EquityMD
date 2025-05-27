import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SEO } from './components/SEO';
import { SimpleLoader } from './components/SimpleLoader';
import { supabase } from './lib/supabase';
import { useAuthStore } from './lib/store';
import { preloadCriticalResources, preloadRoute } from './utils/performance';

// Lazy load heavy components
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Browse = lazy(() => import('./pages/Browse').then(module => ({ default: module.Browse })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const DealDetails = lazy(() => import('./pages/DealDetails').then(module => ({ default: module.DealDetails })));
const NewDeal = lazy(() => import('./pages/NewDeal').then(module => ({ default: module.NewDeal })));
const SyndicatorProfile = lazy(() => import('./pages/SyndicatorProfile').then(module => ({ default: module.SyndicatorProfile })));
const Directory = lazy(() => import('./pages/Directory').then(module => ({ default: module.Directory })));
const MarketMap = lazy(() => import('./pages/MarketMap').then(module => ({ default: module.MarketMap })));
const Inbox = lazy(() => import('./pages/Inbox').then(module => ({ default: module.Inbox })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const Favorites = lazy(() => import('./pages/Favorites').then(module => ({ default: module.Favorites })));

// Keep lightweight components as regular imports
import { NotFound } from './pages/NotFound';
import { HowItWorks } from './pages/HowItWorks';
import { ForSyndicators } from './pages/ForSyndicators';
import { SuccessStories } from './pages/SuccessStories';
import { DueDiligence } from './pages/resources/DueDiligence';
import { InvestmentCalculator } from './pages/resources/InvestmentCalculator';
import { MarketReports } from './pages/resources/MarketReports';
import { Education } from './pages/resources/Education';
import { Glossary } from './pages/resources/Glossary';
import { Privacy } from './pages/legal/Privacy';
import { Terms } from './pages/legal/Terms';
import { Disclaimer } from './pages/legal/Disclaimer';
import { Accreditation } from './pages/legal/Accreditation';
import { Compliance } from './pages/legal/Compliance';
import { Contact } from './pages/Contact';
import { AdminLogin } from './pages/admin/Login';
import { DashboardOverview } from './pages/DashboardOverview';
import { Pricing } from './pages/Pricing';
import { EmailPreview } from './pages/EmailPreview';
import { EmailTest } from './pages/EmailTest';
import { LoaderDemo } from './pages/LoaderDemo';
import { TestMessaging } from './pages/TestMessaging';
import { TestAuth } from './pages/TestAuth';
import { OnboardingDemo } from './pages/OnboardingDemo';
import { AuthModal } from './components/AuthModal';
import { SignupStart } from './pages/auth/SignupStart';
import { SignupEmail } from './pages/auth/SignupEmail';
import { SignupPassword } from './pages/auth/SignupPassword';
import { SignupName } from './pages/auth/SignupName';
import { SignupAccreditation } from './pages/auth/SignupAccreditation';
import { SignupContinue } from './pages/auth/SignupContinue';
import { SocialSignup } from './pages/auth/SocialSignup';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { DashboardReview } from './pages/DashboardReview';
import { TooltipDemo } from './pages/TooltipDemo';
import { ErrorBoundary } from './components/ErrorBoundary';

// Simple loading fallback
const PageLoadingFallback = () => (
  <SimpleLoader 
    text="Loading your investment opportunities..." 
    timeout={15000}
  />
);

export default function App() {
  const { user, profile, setUser, setProfile, clearAuth } = useAuthStore();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [requireAuth, setRequireAuth] = useState(false);

  // Preload critical resources on app start
  useEffect(() => {
    preloadCriticalResources();
  }, []);

  // Preload likely next routes based on current page
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Preload common next routes
    if (currentPath === '/') {
      preloadRoute(() => import('./pages/Browse'));
      preloadRoute(() => import('./pages/Directory'));
    } else if (currentPath === '/browse') {
      preloadRoute(() => import('./pages/DealDetails'));
    } else if (currentPath === '/directory') {
      preloadRoute(() => import('./pages/SyndicatorProfile'));
    }
  }, [location.pathname]);

  useEffect(() => {
    const initAuth = async () => {  
      try {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.warn('Refresh session error:', refreshError);
        }
    
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.id);
    
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
        
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id);
          if (event === 'SIGNED_OUT') {
            clearAuth();
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setUser(session?.user ?? null);
            if (session?.user) {
              await fetchProfile(session.user.id);
            }
          }
        });
    
        await fetchSiteSettings();
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };
  
    initAuth();
  }, []);
  

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

  async function fetchProfile(userId: string, retryCount = 0) {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        if (error.message.includes('fetch') && retryCount < 3) {
          console.log(`Retrying profile fetch... Attempt ${retryCount + 1}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return fetchProfile(userId, retryCount + 1);
        }
        throw error;
      }

      if (!data) {
        console.log('No profile found, redirecting to social signup...');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');

        // If user signed in with social provider but has no profile, redirect to social signup
        if (user.app_metadata?.provider && user.app_metadata.provider !== 'email') {
          setProfile(null);
          window.location.href = '/social-signup';
          return;
        }

        // Create profile for email users
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url,
            user_type: user.user_metadata?.user_type || 'investor',
            is_verified: true
          }])
          .select()
          .single();

        if (createError) throw createError;

        // Create type-specific profile
        if (newProfile.user_type === 'investor') {
          await supabase
            .from('investor_profiles')
            .insert([{ 
              id: userId,
              accredited_status: false,
              investment_preferences: {},
              preferred_property_types: [],
              preferred_locations: []
            }]);
        } else {
          await supabase
            .from('syndicator_profiles')
            .insert([{ 
              id: userId,
              company_name: user.user_metadata?.full_name || 'My Company',
              verification_documents: {}
            }]);
        }

        setProfile(newProfile);
        return;
      }

      console.log('Profile found:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      clearAuth();
    }
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/how-it-works', '/for-syndicators', '/contact', '/legal/privacy', '/legal/terms', '/legal/disclaimer', '/resources/glossary', '/pricing', '/email-preview', '/email-test', '/loader-demo', '/test-messaging', '/test-auth', '/tooltip-demo', '/onboarding-demo', '/admin', '/dashboard-review'];

  // Check if current route requires authentication
  const requiresAuth = !publicRoutes.includes(location.pathname);

  // Show auth modal if route requires auth and user is not logged in
  useEffect(() => {
    if (requireAuth && requiresAuth && !user) {
      setShowAuthModal(true);
    }
  }, [location.pathname, requireAuth, user]);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <ErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <Home />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/how-it-works" element={
          <ErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <HowItWorks />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/for-syndicators" element={
          <ErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <ForSyndicators />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/contact" element={
          <ErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <Contact />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/pricing" element={
          <ErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <Pricing />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/email-preview" element={
          <ErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <EmailPreview />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/email-test" element={
          <ErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <EmailTest />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/loader-demo" element={
          <ErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <LoaderDemo />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/legal/privacy" element={
          <ErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <Privacy />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/legal/terms" element={
          <ErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <Terms />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/legal/disclaimer" element={
          <ErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <Disclaimer />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/resources/glossary" element={<Suspense fallback={<PageLoadingFallback />}><Glossary /></Suspense>} />

        {/* Signup Routes */}
        <Route path="/signup/start" element={<Suspense fallback={<PageLoadingFallback />}><SignupStart /></Suspense>} />
        <Route path="/signup/:type/email" element={<Suspense fallback={<PageLoadingFallback />}><SignupEmail /></Suspense>} />
        <Route path="/signup/:type/password" element={<Suspense fallback={<PageLoadingFallback />}><SignupPassword /></Suspense>} />
        <Route path="/signup/:type/name" element={<Suspense fallback={<PageLoadingFallback />}><SignupName /></Suspense>} />
        <Route path="/signup/:type/accreditation" element={<Suspense fallback={<PageLoadingFallback />}><SignupAccreditation /></Suspense>} />
        <Route path="/signup/:type/continue" element={<Suspense fallback={<PageLoadingFallback />}><SignupContinue /></Suspense>} />
        <Route path="/social-signup" element={<Suspense fallback={<PageLoadingFallback />}><SocialSignup /></Suspense>} />

        {/* Protected Routes */}
        <Route 
          path="/browse" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<PageLoadingFallback />}><Browse /></Suspense>} 
        />
        <Route 
          path="/directory" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<PageLoadingFallback />}><Directory /></Suspense>} 
        />
        <Route 
          path="/success-stories" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<PageLoadingFallback />}><SuccessStories /></Suspense>} 
        />
        <Route 
          path="/resources/due-diligence" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<PageLoadingFallback />}><DueDiligence /></Suspense>} 
        />
        <Route 
          path="/resources/calculator" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<PageLoadingFallback />}><InvestmentCalculator /></Suspense>} 
        />
        <Route 
          path="/resources/market-reports" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<PageLoadingFallback />}><MarketReports /></Suspense>} 
        />
        <Route 
          path="/resources/education" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<PageLoadingFallback />}><Education /></Suspense>} 
        />
        <Route 
          path="/market-map" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<PageLoadingFallback />}><MarketMap /></Suspense>} 
        />
        <Route 
          path="/legal/accreditation" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<PageLoadingFallback />}><Accreditation /></Suspense>} 
        />
        <Route 
          path="/legal/compliance" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<PageLoadingFallback />}><Compliance /></Suspense>} 
        />
        <Route 
          path="/deals/:slug" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<PageLoadingFallback />}><DealDetails /></Suspense>} 
        />
        <Route 
          path="/syndicators/:slug" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<PageLoadingFallback />}><SyndicatorProfile /></Suspense>} 
        />
        <Route 
          path="/profile" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<PageLoadingFallback />}><Profile /></Suspense>} 
        />
        <Route 
          path="/dashboard" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<PageLoadingFallback />}><Dashboard /></Suspense>} 
        />
        <Route 
          path="/deals/new" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<PageLoadingFallback />}><NewDeal /></Suspense>} 
        />
        <Route 
          path="/inbox" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<PageLoadingFallback />}><Inbox /></Suspense>} 
        />
        <Route 
          path="/favorites" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<PageLoadingFallback />}><Favorites /></Suspense>} 
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<Suspense fallback={<PageLoadingFallback />}><AdminLogin /></Suspense>} />
        <Route path="/admin/dashboard" element={<Suspense fallback={<PageLoadingFallback />}><AdminDashboard /></Suspense>} />
        <Route path="/dev-admin/*" element={<Suspense fallback={<PageLoadingFallback />}><AdminDashboard /></Suspense>} />

        {/* Dashboard Review Route - No Authentication Required */}
        <Route path="/dashboard-review" element={<Suspense fallback={<PageLoadingFallback />}><DashboardReview /></Suspense>} />

        {/* Test Messaging Route */}
        <Route path="/test-messaging" element={<Suspense fallback={<PageLoadingFallback />}><TestMessaging /></Suspense>} />

        {/* Test Auth Route */}
        <Route path="/test-auth" element={<Suspense fallback={<PageLoadingFallback />}><TestAuth /></Suspense>} />

        {/* Tooltip Demo Route */}
        <Route path="/tooltip-demo" element={<Suspense fallback={<PageLoadingFallback />}><TooltipDemo /></Suspense>} />

        {/* Onboarding Demo Route */}
        <Route path="/onboarding-demo" element={<Suspense fallback={<PageLoadingFallback />}><OnboardingDemo /></Suspense>} />

        {/* 404 Route */}
        <Route path="*" element={<Suspense fallback={<PageLoadingFallback />}><NotFound /></Suspense>} />
      </Routes>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          defaultView="sign_in"
        />
      )}

      <PerformanceMonitor />
    </>
  );
}