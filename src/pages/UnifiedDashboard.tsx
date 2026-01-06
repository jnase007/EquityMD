import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { InvestorDashboard, SyndicatorDashboard } from '../components/Dashboard';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { TrendingUp, Building2, Plus } from 'lucide-react';

export function UnifiedDashboard() {
  const { user, profile, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const [hasSyndicators, setHasSyndicators] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'investor' | 'syndicator'>('investor');

  useEffect(() => {
    if (user) {
      checkUserSyndicators();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Set initial view based on profile preference
  useEffect(() => {
    if (profile) {
      // Use saved preference, or default based on user type
      const preference = profile.dashboard_preference || profile.user_type || 'investor';
      setCurrentView(preference);
    }
  }, [profile]);

  async function checkUserSyndicators() {
    try {
      setError(null);
      const { count, error: queryError } = await supabase
        .from('syndicators')
        .select('*', { count: 'exact', head: true })
        .eq('claimed_by', user!.id);
      
      if (queryError) {
        console.error('Syndicator query error:', queryError);
        // Don't fail completely, just default to investor view
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

  // Save preference when user switches views
  async function handleViewChange(view: 'investor' | 'syndicator') {
    setCurrentView(view);
    
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

  // Wait for both user and profile to be ready
  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
            <p className="text-gray-500 text-sm">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Check if user can access syndicator view
  const canAccessSyndicatorView = profile?.user_type === 'syndicator' || hasSyndicators;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Dashboard View Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => handleViewChange('investor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                currentView === 'investor'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Investor View</span>
              <span className="sm:hidden">Investor</span>
            </button>
            <button
              onClick={() => {
                if (!canAccessSyndicatorView) {
                  // Redirect to syndicator setup if no profile exists
                  navigate('/syndicator-setup');
                } else {
                  handleViewChange('syndicator');
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                currentView === 'syndicator'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Syndicator View</span>
              <span className="sm:hidden">Syndicator</span>
            </button>
          </div>
          
          {!canAccessSyndicatorView && (
            <button
              onClick={() => navigate('/syndicator-setup')}
              className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition font-medium"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Become a Syndicator</span>
              <span className="sm:hidden">List Deals</span>
            </button>
          )}
        </div>

        {currentView === 'syndicator' ? (
          <SyndicatorDashboard />
        ) : (
          <InvestorDashboard />
        )}
      </div>
      
      <Footer />
    </div>
  );
}

