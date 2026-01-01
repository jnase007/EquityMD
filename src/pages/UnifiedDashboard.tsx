import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { InvestorDashboard, SyndicatorDashboard } from '../components/Dashboard';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';

export function UnifiedDashboard() {
  const { user, profile } = useAuthStore();
  const [hasSyndicators, setHasSyndicators] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkUserSyndicators();
    } else {
      setLoading(false);
    }
  }, [user]);

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

  // Determine which dashboard to show based on user type
  // Syndicator users OR investors who have claimed syndicator profiles see syndicator dashboard
  const showSyndicatorDashboard = profile?.user_type === 'syndicator' || hasSyndicators;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {showSyndicatorDashboard ? (
          <SyndicatorDashboard />
        ) : (
          <InvestorDashboard />
        )}
      </div>
      
      <Footer />
    </div>
  );
}

