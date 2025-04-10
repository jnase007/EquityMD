import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { User, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function SignupName() {
  const navigate = useNavigate();
  const { type } = useParams();
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = sessionStorage.getItem('signup_user_id');
    if (!userId) {
      navigate('/signup/start');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userId = sessionStorage.getItem('signup_user_id');
      const email = sessionStorage.getItem('signup_email');
      
      // Create profile with service role client to bypass RLS
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          full_name: fullName,
          user_type: type || 'investor',
          is_verified: true
        });

      if (profileError) throw profileError;

      // Create type-specific profile
      if (type === 'investor') {
        const { error: investorError } = await supabase
          .from('investor_profiles')
          .insert({
            id: userId,
            accredited_status: false
          });
        
        if (investorError) throw investorError;
      } else {
        const { error: syndicatorError } = await supabase
          .from('syndicator_profiles')
          .insert({
            id: userId,
            company_name: fullName
          });
        
        if (syndicatorError) throw syndicatorError;
      }

      // Navigate to next step
      navigate(`/signup/${type}/accreditation`);
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('Error creating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
          </div>

          <div className="text-center mb-8">
            <Link to="/">
              <img
                src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/logos//logo-black.png"
                alt="EquityMD"
                className="h-12 mx-auto mb-6"
              />
            </Link>
            <h1 className="text-2xl font-bold mb-2">What's your name?</h1>
            <p className="text-gray-600">Tell us your name as you'd like it to appear</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !fullName.trim()}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>

      <div className="text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} EquityMD. All rights reserved.
      </div>
    </div>
  );
}