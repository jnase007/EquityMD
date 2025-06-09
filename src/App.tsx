import React, { useEffect, useState, Suspense, lazy, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore } from './lib/store';
import { preloadCriticalResources, preloadRoute } from './utils/performance';

// Force deployment refresh - production loading fix
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
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Favorites = lazy(() => import('./pages/Favorites').then(module => ({ default: module.Favorites })));

// Keep lightweight components as regular imports
import { NotFound } from './pages/NotFound';
import { HowItWorks } from './pages/HowItWorks';
import { HowItWorksImproved } from './pages/HowItWorksImproved';

import { SuccessStories } from './pages/SuccessStories';
import { DueDiligence } from './pages/resources/DueDiligence';
import { InvestmentCalculator } from './pages/resources/InvestmentCalculator';
import { MarketReports } from './pages/resources/MarketReports';
import { MarketReportsHub } from './pages/resources/market-reports/index';
import { StateMarketReport } from './pages/resources/market-reports/[state]';
import { CityMarketReport } from './pages/cities/[city]';
import { CityDeals } from './pages/CityDeals';
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
import { AdminLogin } from './pages/admin/Login';
import { Pricing } from './pages/Pricing';
import { NewPricing } from './pages/new-pricing';
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
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { DashboardReview } from './pages/DashboardReview';
import { TooltipDemo } from './pages/TooltipDemo';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminErrorBoundary } from './components/AdminErrorBoundary';

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

export default function App() {
  const { user, setUser, setProfile, clearAuth } = useAuthStore();
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
    } else if (currentPath === '/find') {
      preloadRoute(() => import('./pages/DealDetails'));
    } else if (currentPath === '/directory') {
      preloadRoute(() => import('./pages/SyndicatorProfile'));
    }
  }, [location.pathname]);

  const fetchProfile = useCallback(async (userId: string, retryCount = 0) => {
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
        console.log('No profile found, creating profile automatically...');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');

        console.log('User metadata:', user.user_metadata);
        console.log('App metadata:', user.app_metadata);

        // For social users, create profile automatically as investor (default)
        // For email users, also create profile automatically
        const userType = user.user_metadata?.user_type || 'investor';
        
        console.log('Creating profile with user type:', userType);
        
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
          console.error('Error creating profile:', createError);
          throw createError;
        }

        console.log('Profile created successfully:', newProfile);

        // Create type-specific profile
        if (newProfile.user_type === 'investor') {
          console.log('Creating investor profile...');
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
            console.error('Error creating investor profile:', investorError);
          } else {
            console.log('Investor profile created successfully');
          }
        } else {
          console.log('Creating syndicator profile...');
          const { error: syndicatorError } = await supabase
            .from('syndicator_profiles')
            .insert([{ 
              id: userId,
              company_name: user.user_metadata?.full_name || 'My Company',
              verification_documents: {}
            }]);
          
          if (syndicatorError) {
            console.error('Error creating syndicator profile:', syndicatorError);
          } else {
            console.log('Syndicator profile created successfully');
          }
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
  }, [clearAuth, setProfile]);

  useEffect(() => {
    const initAuth = async () => {  
      try {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.warn('Refresh session error:', refreshError);
        }
    
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Session retrieval error:', error);
        }
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
  }, [clearAuth, setUser, fetchProfile]);
  

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
  const publicRoutes = ['/', '/find', '/directory', '/how-it-works', '/contact', '/about', '/blog', '/legal/privacy', '/legal/terms', '/legal/disclaimer', '/resources/glossary', '/pricing', '/email-preview', '/email-test', '/loader-demo', '/test-messaging', '/test-auth', '/tooltip-demo', '/onboarding-demo', '/admin', '/dashboard-review'];

  // Check if current route requires authentication
  const requiresAuth = !publicRoutes.includes(location.pathname);

  // Show auth modal if route requires auth and user is not logged in
  useEffect(() => {
    if (requireAuth && requiresAuth && !user) {
      setShowAuthModal(true);
    }
  }, [location.pathname, requireAuth, user, requiresAuth]);

  return (
    <div className="transition-opacity duration-300 ease-in-out">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <ErrorBoundary>
            <Suspense fallback={<MinimalLoadingFallback />}>
              <Home />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/how-it-works" element={
          <ErrorBoundary>
            <Suspense fallback={<MinimalLoadingFallback />}>
              <HowItWorks />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/how-it-works-improved" element={
          <ErrorBoundary>
            <Suspense fallback={<MinimalLoadingFallback />}>
              <HowItWorksImproved />
            </Suspense>
          </ErrorBoundary>
        } />

        <Route path="/contact" element={
          <ErrorBoundary>
            <Suspense fallback={<MinimalLoadingFallback />}>
              <Contact />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/about" element={
          <ErrorBoundary>
            <Suspense fallback={<MinimalLoadingFallback />}>
              <About />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/blog" element={
          <ErrorBoundary>
            <Suspense fallback={<MinimalLoadingFallback />}>
              <Blog />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/pricing" element={
          <ErrorBoundary>
            <Suspense fallback={<MinimalLoadingFallback />}>
              <Pricing />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/new-pricing" element={
          <ErrorBoundary>
            <Suspense fallback={<MinimalLoadingFallback />}>
              <NewPricing />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/email-preview" element={
          <ErrorBoundary>
            <Suspense fallback={<MinimalLoadingFallback />}>
              <EmailPreview />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/email-test" element={
          <ErrorBoundary>
            <Suspense fallback={<MinimalLoadingFallback />}>
              <EmailTest />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/loader-demo" element={
          <ErrorBoundary>
            <Suspense fallback={<MinimalLoadingFallback />}>
              <LoaderDemo />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/legal/privacy" element={
          <ErrorBoundary>
            <Suspense fallback={<MinimalLoadingFallback />}>
              <Privacy />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/legal/terms" element={
          <ErrorBoundary>
            <Suspense fallback={<MinimalLoadingFallback />}>
              <Terms />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/legal/disclaimer" element={
          <ErrorBoundary>
            <Suspense fallback={<MinimalLoadingFallback />}>
              <Disclaimer />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/resources/glossary" element={<Suspense fallback={<MinimalLoadingFallback />}><Glossary /></Suspense>} />

        {/* Signup Routes */}
        <Route path="/signup/start" element={<Suspense fallback={<MinimalLoadingFallback />}><SignupStart /></Suspense>} />
        <Route path="/signup/:type/email" element={<Suspense fallback={<MinimalLoadingFallback />}><SignupEmail /></Suspense>} />
        <Route path="/signup/:type/password" element={<Suspense fallback={<MinimalLoadingFallback />}><SignupPassword /></Suspense>} />
        <Route path="/signup/:type/name" element={<Suspense fallback={<MinimalLoadingFallback />}><SignupName /></Suspense>} />
        <Route path="/signup/:type/accreditation" element={<Suspense fallback={<MinimalLoadingFallback />}><SignupAccreditation /></Suspense>} />
        <Route path="/signup/:type/continue" element={<Suspense fallback={<MinimalLoadingFallback />}><SignupContinue /></Suspense>} />

        {/* Public Browse Routes - No Authentication Required */}
        <Route 
          path="/find" 
          element={<Suspense fallback={<MinimalLoadingFallback />}><Browse /></Suspense>} 
        />
        {/* Redirect old /browse URL to /find */}
        <Route 
          path="/browse" 
          element={<Navigate to="/find" replace />} 
        />
        <Route 
          path="/directory" 
          element={<Suspense fallback={<MinimalLoadingFallback />}><Directory /></Suspense>} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/success-stories" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<MinimalLoadingFallback />}><SuccessStories /></Suspense>} 
        />
        <Route 
          path="/resources/due-diligence" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<MinimalLoadingFallback />}><DueDiligence /></Suspense>} 
        />
        <Route 
          path="/resources/calculator" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<MinimalLoadingFallback />}><InvestmentCalculator /></Suspense>} 
        />
        <Route 
          path="/resources/market-reports" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<MinimalLoadingFallback />}><MarketReportsHub /></Suspense>} 
        />
        <Route 
          path="/resources/market-reports/:state" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<MinimalLoadingFallback />}><StateMarketReport /></Suspense>} 
        />
        <Route 
          path="/resources/education" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<MinimalLoadingFallback />}><Education /></Suspense>} 
        />
        <Route 
          path="/market-map" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<MinimalLoadingFallback />}><MarketMap /></Suspense>} 
        />
        <Route 
          path="/legal/accreditation" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<MinimalLoadingFallback />}><Accreditation /></Suspense>} 
        />
        <Route 
          path="/legal/compliance" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<MinimalLoadingFallback />}><Compliance /></Suspense>} 
        />
        <Route 
          path="/cities/:city" 
          element={<Suspense fallback={<MinimalLoadingFallback />}><CityMarketReport /></Suspense>} 
        />
        <Route 
          path="/deals/:slug" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<MinimalLoadingFallback />}><DealDetails /></Suspense>} 
        />
        <Route 
          path="/syndicators/:slug" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<MinimalLoadingFallback />}><SyndicatorProfile /></Suspense>} 
        />
        <Route 
          path="/profile" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<MinimalLoadingFallback />}><Profile /></Suspense>} 
        />
        <Route 
          path="/dashboard" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<MinimalLoadingFallback />}><Dashboard /></Suspense>} 
        />
        <Route 
          path="/deals/new" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<MinimalLoadingFallback />}><NewDeal /></Suspense>} 
        />
        <Route 
          path="/inbox" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<MinimalLoadingFallback />}><Inbox /></Suspense>} 
        />
        <Route 
          path="/favorites" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Suspense fallback={<MinimalLoadingFallback />}><Favorites /></Suspense>} 
        />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminErrorBoundary>
            <Suspense fallback={<MinimalLoadingFallback />}>
              <AdminLogin />
            </Suspense>
          </AdminErrorBoundary>
        } />
        <Route path="/admin/dashboard" element={
          <AdminErrorBoundary>
            <Suspense fallback={<MinimalLoadingFallback />}>
              <AdminDashboard />
            </Suspense>
          </AdminErrorBoundary>
        } />
        <Route path="/dev-admin/*" element={
          <AdminErrorBoundary>
            <Suspense fallback={<MinimalLoadingFallback />}>
              <AdminDashboard />
            </Suspense>
          </AdminErrorBoundary>
        } />

        {/* Dashboard Review Route - No Authentication Required */}
        <Route path="/dashboard-review" element={<Suspense fallback={<MinimalLoadingFallback />}><DashboardReview /></Suspense>} />

        {/* Test Messaging Route */}
        <Route path="/test-messaging" element={<Suspense fallback={<MinimalLoadingFallback />}><TestMessaging /></Suspense>} />

        {/* Test Auth Route */}
        <Route path="/test-auth" element={<Suspense fallback={<MinimalLoadingFallback />}><TestAuth /></Suspense>} />

        {/* Tooltip Demo Route */}
        <Route path="/tooltip-demo" element={<Suspense fallback={<MinimalLoadingFallback />}><TooltipDemo /></Suspense>} />

        {/* Onboarding Demo Route */}
        <Route path="/onboarding-demo" element={<Suspense fallback={<MinimalLoadingFallback />}><OnboardingDemo /></Suspense>} />

        {/* 404 Route */}
        <Route path="*" element={<Suspense fallback={<MinimalLoadingFallback />}><NotFound /></Suspense>} />
      </Routes>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          defaultView="sign_in"
        />
      )}

      <PerformanceMonitor />
    </div>
  );
}