import React, { useEffect, useState, Suspense, lazy, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore } from './lib/store';
import { preloadCriticalResources, preloadRoute } from './utils/performance';

// Force deployment refresh - production loading fix
// Lazy load heavy components
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Browse = lazy(() => import('./pages/Browse').then(module => ({ default: module.Browse })));
const Profile = lazy(() => import('./pages/ProfileNew').then(module => ({ default: module.ProfileNew })));
const Dashboard = lazy(() => import('./pages/UnifiedDashboard').then(module => ({ default: module.UnifiedDashboard })));
const Welcome = lazy(() => import('./pages/Welcome').then(module => ({ default: module.Welcome })));
const DealDetails = lazy(() => import('./pages/DealDetails').then(module => ({ default: module.DealDetails })));
const NewDeal = lazy(() => import('./pages/NewDeal').then(module => ({ default: module.NewDeal })));
const EditDeal = lazy(() => import('./pages/EditDeal').then(module => ({ default: module.EditDeal })));
const SyndicatorProfile = lazy(() => import('./pages/SyndicatorProfile').then(module => ({ default: module.SyndicatorProfile })));
const Directory = lazy(() => import('./pages/Directory').then(module => ({ default: module.Directory })));
const MarketMap = lazy(() => import('./pages/MarketMap').then(module => ({ default: module.MarketMap })));
const Inbox = lazy(() => import('./pages/Inbox').then(module => ({ default: module.Inbox })));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Favorites = lazy(() => import('./pages/Favorites').then(module => ({ default: module.Favorites })));
const Portfolio = lazy(() => import('./pages/Portfolio').then(module => ({ default: module.Portfolio })));
const BrandingGuide = lazy(() => import('./pages/BrandingGuide').then(module => ({ default: module.BrandingGuide })));
const Leaderboard = lazy(() => import('./pages/Leaderboard').then(module => ({ default: module.Leaderboard })));
const Discover = lazy(() => import('./pages/Discover').then(module => ({ default: module.Discover })));
const Calendar = lazy(() => import('./pages/Calendar').then(module => ({ default: module.Calendar })));
const Goals = lazy(() => import('./pages/Goals').then(module => ({ default: module.Goals })));

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
  const { user, profile, setUser, setProfile, clearAuth } = useAuthStore();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [requireAuth, setRequireAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

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
        
        // Set loading to false after initial auth check
        setAuthLoading(false);
        
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
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
        // Set loading to false even on error to prevent infinite loading
        setAuthLoading(false);
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

  // Debug authentication state
  useEffect(() => {
    console.log('🔍 Auth Debug:', {
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
        <Route path="/pricing" element={<Navigate to="/" replace />} />
        <Route path="/new-pricing" element={<Navigate to="/" replace />} />
        <Route path="/email-preview" element={<EmailPreview />} />
        <Route path="/email-test" element={<EmailTest />} />
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
        <Route 
          path="/deals/:slug" 
          element={authLoading ? <MinimalLoadingFallback /> : (requireAuth && !user ? <Navigate to="/" /> : <DealDetails />)} 
        />
        <Route 
          path="/syndicators/:slug" 
          element={authLoading ? <MinimalLoadingFallback /> : (requireAuth && !user ? <Navigate to="/" /> : <SyndicatorProfile />)} 
        />
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
          path="/deals/new" 
          element={authLoading ? <MinimalLoadingFallback /> : (requireAuth && !user ? <Navigate to="/" /> : <NewDeal />)} 
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
    </div>
  );
}