// New Property Listing Page - Now using the enhanced wizard experience
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertCircle } from 'lucide-react';
import { PropertyListingWizard } from '../components/PropertyListingWizard';
import { VerificationUpload } from '../components/VerificationUpload';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
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

  // If verified, show the wizard as normal
  if (isVerified) {
    return <PropertyListingWizard />;
  }

  // Show verification gate
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Blocking message */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 mb-8 text-center">
          <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-3">
            Verify Your Account to List Deals
          </h1>
          <p className="text-gray-400 mb-6">
            To protect investors and maintain quality, EquityMD requires syndicator verification before listing deals.
            Submit your verification documents below to get started.
          </p>
          {!hasSyndicator && (
            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-300">You need to create a syndicator profile first.</span>
              </div>
              <Link 
                to="/profile" 
                className="text-blue-400 hover:text-blue-300 underline mt-2 inline-block"
              >
                Go to Profile Settings →
              </Link>
            </div>
          )}
        </div>

        {/* Show verification upload if they have a syndicator profile */}
        {hasSyndicator && syndicatorId && (
          <VerificationUpload
            syndicatorId={syndicatorId}
            verificationStatus={verificationStatus}
            onStatusChange={(newStatus) => setVerificationStatus(newStatus)}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
