// New Property Listing Page - Now using the enhanced wizard experience
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertCircle } from 'lucide-react';
import { PropertyListingWizard } from '../components/PropertyListingWizard';
import { VerificationUpload } from '../components/VerificationUpload';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

export function NewDeal() {
  const { user } = useAuthStore();
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [syndicatorId, setSyndicatorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSyndicator, setHasSyndicator] = useState(false);

  useEffect(() => {
    async function checkVerification() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('syndicators')
          .select('id, verification_status')
          .eq('claimed_by', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setHasSyndicator(true);
          setSyndicatorId(data[0].id);
          setVerificationStatus(data[0].verification_status || 'unverified');
        }
      } catch (err) {
        console.error('Error checking verification:', err);
      } finally {
        setLoading(false);
      }
    }

    checkVerification();
  }, [user]);

  const isVerified = verificationStatus && ['verified', 'featured', 'premium', 'premier'].includes(verificationStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // No syndicator profile — need to create one first
  if (!hasSyndicator) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 text-center">
            <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-3">
              Create a Syndicator Profile
            </h1>
            <p className="text-gray-400 mb-6">
              You need a syndicator profile before listing deals on EquityMD.
            </p>
            <Link 
              to="/profile" 
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Go to Profile Settings →
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Has syndicator profile — always show the wizard, with a pending notice if not verified
  return (
    <>
      <SEO title="List a New Deal | EquityMD" noindex={true} />
      {!isVerified && (
        <div className="bg-amber-50 dark:bg-amber-900/60 border-b-2 border-amber-400 dark:border-amber-500">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-300 flex-shrink-0" />
            <p className="text-amber-800 dark:text-amber-100 text-sm font-medium">
              Your deal will be saved as <strong className="font-bold">Pending Approval</strong>. An admin will review and approve it before it goes live to investors.
              {verificationStatus !== 'pending' && (
                <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 ml-2 underline">
                  Submit verification docs →
                </Link>
              )}
            </p>
          </div>
        </div>
      )}
      <PropertyListingWizard />
    </>
  );
}
