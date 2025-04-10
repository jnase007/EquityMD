import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DollarSign, Building2, Briefcase, GraduationCap, ArrowLeft, HelpCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function SignupAccreditation() {
  const navigate = useNavigate();
  const { type } = useParams();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showInfo, setShowInfo] = useState(false);
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
      
      // Update investor profile with accreditation
      if (type === 'investor') {
        const { error: updateError } = await supabase
          .from('investor_profiles')
          .update({
            accredited_status: true,
            accreditation_proof: selectedMethod
          })
          .eq('id', userId);

        if (updateError) throw updateError;
      }

      // Navigate to final step
      navigate(`/signup/${type}/continue`);
    } catch (error) {
      console.error('Error updating accreditation:', error);
      setError('Error updating accreditation status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const accreditationMethods = [
    {
      id: 'income',
      icon: <DollarSign className="h-6 w-6" />,
      title: 'Income',
      description: 'Individual income over $200K (or joint over $300K) in each of the past two years'
    },
    {
      id: 'networth',
      icon: <Building2 className="h-6 w-6" />,
      title: 'Net Worth',
      description: 'Individual or joint net worth over $1 million (excluding primary residence)'
    },
    {
      id: 'professional',
      icon: <Briefcase className="h-6 w-6" />,
      title: 'Professional Certification',
      description: 'Hold certain professional certifications or credentials'
    },
    {
      id: 'entity',
      icon: <GraduationCap className="h-6 w-6" />,
      title: 'Entity',
      description: 'All equity owners are accredited investors'
    }
  ];

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
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos//logo-black.png`}
                alt="EquityMD"
                className="h-12 mx-auto mb-6"
              />
            </Link>
            <h1 className="text-2xl font-bold mb-2">Verify Accreditation Status</h1>
            <p className="text-gray-600">Select how you qualify as an accredited investor</p>
          </div>

          <div className="relative mb-8">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="absolute -top-2 -right-2 text-gray-400 hover:text-gray-600"
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            {showInfo && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg p-4 z-10 text-sm">
                <h4 className="font-medium mb-2">Accredited Investor Requirements</h4>
                <p className="text-gray-600 mb-2">
                  Under SEC rules, you must meet at least ONE of these criteria:
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li>• Income exceeding $200K (individual) or $300K (joint) in each of the past two years</li>
                  <li>• Net worth over $1M (excluding primary residence)</li>
                  <li>• Hold certain professional certifications</li>
                  <li>• Entity with all accredited owners</li>
                </ul>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {accreditationMethods.map((method) => (
                <label
                  key={method.id}
                  className={`block p-4 border rounded-lg cursor-pointer transition ${
                    selectedMethod === method.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="accreditation"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="mt-1.5"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${
                          selectedMethod === method.id ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {method.icon}
                        </div>
                        <div className="ml-3 font-medium">{method.title}</div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selectedMethod}
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