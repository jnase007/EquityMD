import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

export function Footer() {
  const navigate = useNavigate();

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
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
        <div>
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
          <button 
            onClick={() => handleNavigation('/contact')}
            className="text-blue-400 hover:text-blue-300 transition"
          >
            Contact Us
          </button>
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
                onClick={() => handleNavigation('/for-syndicators')}
                className="hover:text-white transition"
              >
                For Syndicators
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/pricing')}
                className="hover:text-white transition"
              >
                Syndicator Pricing
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

      <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 flex justify-between items-center">
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