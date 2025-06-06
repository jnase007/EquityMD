import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { trackUserSignup } from '../../lib/analytics';

export function SignupContinue() {
  const navigate = useNavigate();
  const { type } = useParams();

  useEffect(() => {
    const userId = sessionStorage.getItem('signup_user_id');
    const userEmail = sessionStorage.getItem('signup_email');
    
    if (!userId) {
      navigate('/signup/start');
      return;
    }

    // Track the signup conversion in Google Analytics
    if (userId && userEmail && type) {
      trackUserSignup(type as 'investor' | 'syndicator', userId, userEmail);
    }
  }, [navigate, type]);

  const handleContinue = () => {
    // Clear signup session data
    sessionStorage.removeItem('signup_email');
    sessionStorage.removeItem('signup_user_id');
    sessionStorage.removeItem('signup_type');

    // Navigate to profile page to complete setup
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <Link to="/">
              <img
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos//logo-black.png`}
                alt="EquityMD"
                className="h-12 mx-auto mb-6"
              />
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-4">
              Welcome to EquityMD!
            </h1>

            <p className="text-gray-600 mb-8">
              Your account has been created successfully. You can now access the platform and {type === 'investor' ? 'explore investment opportunities' : 'list your properties'}.
            </p>

            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
            >
              Continue to Profile
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} EquityMD. All rights reserved.
      </div>
    </div>
  );
}