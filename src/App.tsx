import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SEO } from './components/SEO';
import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { Profile } from './pages/Profile';
import { Dashboard } from './pages/Dashboard';
import { DealDetails } from './pages/DealDetails';
import { NewDeal } from './pages/NewDeal';
import { NotFound } from './pages/NotFound';
import { SyndicatorProfile } from './pages/SyndicatorProfile';
import { Directory } from './pages/Directory';
import { HowItWorks } from './pages/HowItWorks';
import { ForSyndicators } from './pages/ForSyndicators';
import { SuccessStories } from './pages/SuccessStories';
import { DueDiligence } from './pages/resources/DueDiligence';
import { InvestmentCalculator } from './pages/resources/InvestmentCalculator';
import { MarketReports } from './pages/resources/MarketReports';
import { MarketMap } from './pages/MarketMap';
import { Education } from './pages/resources/Education';
import { Glossary } from './pages/resources/Glossary';
import { Privacy } from './pages/legal/Privacy';
import { Terms } from './pages/legal/Terms';
import { Disclaimer } from './pages/legal/Disclaimer';
import { Accreditation } from './pages/legal/Accreditation';
import { Compliance } from './pages/legal/Compliance';
import { Contact } from './pages/Contact';
import { Inbox } from './pages/Inbox';
import { AdminLogin } from './pages/admin/Login';
import { AdminDashboard } from './pages/admin/Dashboard';
import { Pricing } from './pages/Pricing';
import { AuthModal } from './components/AuthModal';
import { SignupStart } from './pages/auth/SignupStart';
import { SignupEmail } from './pages/auth/SignupEmail';
import { SignupPassword } from './pages/auth/SignupPassword';
import { SignupName } from './pages/auth/SignupName';
import { SignupAccreditation } from './pages/auth/SignupAccreditation';
import { SignupContinue } from './pages/auth/SignupContinue';
import { SocialSignup } from './pages/auth/SocialSignup';
import { supabase } from './lib/supabase';
import { useAuthStore } from './lib/store';

export default function App() {
  const { user, profile, setUser, setProfile, clearAuth } = useAuthStore();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [requireAuth, setRequireAuth] = useState(false);

  useEffect(() => {
    const initAuth = async () => {  
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.warn('Refresh session error:', refreshError);
      }
  
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Initial session check:', session?.user?.id);
  
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
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
  
      fetchSiteSettings();
  
      return () => subscription.unsubscribe();
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
  const publicRoutes = ['/', '/how-it-works', '/for-syndicators', '/contact', '/legal/privacy', '/legal/terms', '/legal/disclaimer', '/resources/glossary', '/pricing'];

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
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/for-syndicators" element={<ForSyndicators />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/legal/privacy" element={<Privacy />} />
        <Route path="/legal/terms" element={<Terms />} />
        <Route path="/legal/disclaimer" element={<Disclaimer />} />
        <Route path="/resources/glossary" element={<Glossary />} />

        {/* Signup Routes */}
        <Route path="/signup/start" element={<SignupStart />} />
        <Route path="/signup/:type/email" element={<SignupEmail />} />
        <Route path="/signup/:type/password" element={<SignupPassword />} />
        <Route path="/signup/:type/name" element={<SignupName />} />
        <Route path="/signup/:type/accreditation" element={<SignupAccreditation />} />
        <Route path="/signup/:type/continue" element={<SignupContinue />} />
        <Route path="/social-signup" element={<SocialSignup />} />

        {/* Protected Routes */}
        <Route 
          path="/browse" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Browse />} 
        />
        <Route 
          path="/directory" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Directory />} 
        />
        <Route 
          path="/success-stories" 
          element={requireAuth && !user ? <Navigate to="/" /> : <SuccessStories />} 
        />
        <Route 
          path="/resources/due-diligence" 
          element={requireAuth && !user ? <Navigate to="/" /> : <DueDiligence />} 
        />
        <Route 
          path="/resources/calculator" 
          element={requireAuth && !user ? <Navigate to="/" /> : <InvestmentCalculator />} 
        />
        <Route 
          path="/resources/market-reports" 
          element={requireAuth && !user ? <Navigate to="/" /> : <MarketReports />} 
        />
        <Route 
          path="/resources/education" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Education />} 
        />
        <Route 
          path="/market-map" 
          element={requireAuth && !user ? <Navigate to="/" /> : <MarketMap />} 
        />
        <Route 
          path="/legal/accreditation" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Accreditation />} 
        />
        <Route 
          path="/legal/compliance" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Compliance />} 
        />
        <Route 
          path="/deals/:slug" 
          element={requireAuth && !user ? <Navigate to="/" /> : <DealDetails />} 
        />
        <Route 
          path="/syndicators/:slug" 
          element={requireAuth && !user ? <Navigate to="/" /> : <SyndicatorProfile />} 
        />
        <Route 
          path="/profile" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Profile />} 
        />
        <Route 
          path="/dashboard" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Dashboard />} 
        />
        <Route 
          path="/deals/new" 
          element={requireAuth && !user ? <Navigate to="/" /> : <NewDeal />} 
        />
        <Route 
          path="/inbox" 
          element={requireAuth && !user ? <Navigate to="/" /> : <Inbox />} 
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
        <Route path="/dev-admin/*" element={<AdminDashboard />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          defaultView="sign_in"
        />
      )}
    </>
  );
}