import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setSubscribing(true);
    try {
      // Save to newsletter_subscribers table
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email, source: 'footer' }]);
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Newsletter error:', error);
      }
      
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      console.error('Newsletter subscription error:', err);
    } finally {
      setSubscribing(false);
    }
  };

  const handleNavigation = (path: string) => {
    window.scrollTo(0, 0);
    navigate(path);
  };

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    navigate('/admin');
  };

  return (
    <footer className="bg-gray-900 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2">
          <Link 
            to="/" 
            onClick={() => window.scrollTo(0, 0)}
            className="flex items-center mb-4"
          >
            <img 
              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos//logo-white.png`}
              alt="EquityMD"
              className="h-10"
            />
          </Link>
          <p className="text-gray-400 mb-4">
            Unlocking Real Estate Profits for Investors
          </p>
          
          {/* Newsletter Signup */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4 text-emerald-400" />
              Get Deal Alerts
            </h4>
            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle className="h-4 w-4" />
                You're subscribed! Check your inbox.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-1"
                >
                  {subscribing ? '...' : <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Weekly deals. No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold mb-4">Platform</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <button
                onClick={() => handleNavigation('/how-it-works')}
                className="hover:text-white transition"
              >
                How It Works
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/find')}
                className="hover:text-white transition"
              >
                Find Deals
              </button>
            </li>


            <li>
              <button
                onClick={() => handleNavigation('/success-stories')}
                className="hover:text-white transition"
              >
                Success Stories
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Resources</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <button
                onClick={() => handleNavigation('/resources/due-diligence')}
                className="hover:text-white transition"
              >
                Due Diligence Guide
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/resources/calculator')}
                className="hover:text-white transition"
              >
                Investment Calculator
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/resources/market-reports')}
                className="hover:text-white transition"
              >
                Market Reports
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/resources/glossary')}
                className="hover:text-white transition"
              >
                Glossary
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/branding')}
                className="hover:text-white transition"
              >
                Brand Guidelines
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Legal</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <button
                onClick={() => handleNavigation('/legal/privacy')}
                className="hover:text-white transition"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/legal/terms')}
                className="hover:text-white transition"
              >
                Terms of Service
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/legal/disclaimer')}
                className="hover:text-white transition"
              >
                Disclaimer
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/legal/accreditation')}
                className="hover:text-white transition"
              >
                Accreditation Requirements
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/legal/compliance')}
                className="hover:text-white transition"
              >
                SEC Compliance
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* SEC Disclaimer */}
      <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800">
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong className="text-gray-300">Important Disclaimer:</strong> EquityMD is an online listing platform where 
            real estate syndicators may post investment opportunities. EquityMD is not a registered broker-dealer, investment 
            advisor, funding portal, or crowdfunding portal. EquityMD does not facilitate transactions, make introductions, 
            provide investment advice, or make any recommendations with respect to any securities or investment opportunities 
            listed on our platform.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed mt-2">
            All investment opportunities listed on EquityMD are posted by the issuing syndicator, who is solely responsible 
            for the accuracy of all information and compliance with applicable securities laws including SEC Regulation D. 
            EquityMD does not verify, endorse, or guarantee any listing. Investments in private placements are speculative, 
            illiquid, and involve a high degree of risk, including the possible loss of your entire investment.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed mt-2">
            Any communication or transaction between investors and syndicators occurs independently and outside of EquityMD. 
            Always conduct your own due diligence before making any investment decision.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="text-gray-500 text-sm">
          © {new Date().getFullYear()} EquityMD. All rights reserved.
        </div>
        <button 
          onClick={handleAdminClick}
          className="text-gray-500 hover:text-gray-400 transition flex items-center text-sm"
        >
          <Shield className="h-4 w-4 mr-1" />
          Admin
        </button>
      </div>
    </footer>
  );
}