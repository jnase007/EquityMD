import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { InvestmentGoals } from '../components/InvestmentGoals';
import { ArrowLeft, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Goals() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <Link 
              to="/dashboard"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl">
                <Target className="h-6 w-6 text-teal-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Investment Goals
              </h1>
            </div>
            <p className="text-gray-500">
              Set targets, track progress, and celebrate milestones on your investment journey
            </p>
          </div>

          {/* Goals Component */}
          <InvestmentGoals />
          
          {/* Tips Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-medium text-gray-900 mb-1">Set SMART Goals</h3>
              <p className="text-sm text-gray-500">
                Specific, Measurable, Achievable, Relevant, and Time-bound goals lead to better outcomes.
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-medium text-gray-900 mb-1">Diversify</h3>
              <p className="text-sm text-gray-500">
                Spread investments across different property types, markets, and syndicators.
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <div className="text-2xl mb-2">⏳</div>
              <h3 className="font-medium text-gray-900 mb-1">Stay Consistent</h3>
              <p className="text-sm text-gray-500">
                Regular investing over time can help smooth out market volatility.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

