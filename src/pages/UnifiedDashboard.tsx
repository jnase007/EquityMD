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

  useEffect(() => {
    if (user) {
      checkUserSyndicators();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function checkUserSyndicators() {
    try {
      const { count } = await supabase
        .from('syndicators')
        .select('*', { count: 'exact', head: true })
        .eq('claimed_by', user!.id);
      
      setHasSyndicators((count || 0) > 0);
    } catch (error) {
      console.error('Error checking syndicators:', error);
      setHasSyndicators(false);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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

