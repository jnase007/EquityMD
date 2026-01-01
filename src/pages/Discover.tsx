import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SwipeDeals } from '../components/SwipeDeals';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Discover() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <Link 
              to="/find"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Browse</span>
            </Link>
            
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full mb-4">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Daily Discovery Mode</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Find Your Next Investment
              </h1>
              <p className="text-gray-500">
                Swipe through curated deals matched to your preferences
              </p>
            </div>
          </div>

          {/* Swipe Cards */}
          <SwipeDeals />
        </div>
      </main>

      <Footer />
    </div>
  );
}

