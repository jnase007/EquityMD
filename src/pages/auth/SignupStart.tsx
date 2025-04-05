import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, ArrowRight } from 'lucide-react';
import { AuthModal } from '../../components/AuthModal';

export function SignupStart() {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link to="/">
              <img
                src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/logos//logo-black.png"
                alt="EquityMD"
                className="h-12 mx-auto mb-6"
              />
            </Link>
            <h1 className="text-2xl font-bold mb-2">Join EquityMD</h1>
            <p className="text-gray-600">Select your account type to get started</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/signup/investor/email')}
              className="w-full bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition flex items-center gap-4 group"
            >
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-600 transition">
                <User className="h-6 w-6 text-blue-600 group-hover:text-white transition" />
              </div>
              <div className="flex-grow text-left">
                <div className="font-semibold mb-1">Investor</div>
                <div className="text-sm text-gray-600">Browse and invest in opportunities</div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition" />
            </button>

            <button
              onClick={() => navigate('/signup/syndicator/email')}
              className="w-full bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition flex items-center gap-4 group"
            >
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-600 transition">
                <Building2 className="h-6 w-6 text-blue-600 group-hover:text-white transition" />
              </div>
              <div className="flex-grow text-left">
                <div className="font-semibold mb-1">Syndicator</div>
                <div className="text-sm text-gray-600">List investment opportunities</div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition" />
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} EquityMD. All rights reserved.
      </div>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}