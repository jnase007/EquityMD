import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function SignupEmail() {
  const navigate = useNavigate();
  const { type } = useParams();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if email already exists
      const { data: existingProfiles, error: queryError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .limit(1);

      if (queryError) throw queryError;

      if (existingProfiles && existingProfiles.length > 0) {
        setError('An account with this email already exists');
        setLoading(false);
        return;
      }

      // Store email in session storage for the signup flow
      sessionStorage.setItem('signup_email', email);
      sessionStorage.setItem('signup_type', type || 'investor');

      // Navigate to password step
      navigate(`/signup/${type}/password`);
    } catch (error) {
      console.error('Error checking email:', error);
      setError('An error occurred. Please try again.');
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
              onClick={() => navigate('/signup/start')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
          </div>

          <div className="text-center mb-8">
            <Link to="/">
              <img
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos//logo-black.png`}
                alt="EquityMD"
                className="h-12 mx-auto mb-6"
              />
            </Link>
            <h1 className="text-2xl font-bold mb-2">Create your account</h1>
            <p className="text-gray-600">Enter your email to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
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
              disabled={loading || !email}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Continue'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} EquityMD. All rights reserved.
      </div>
    </div>
  );
}