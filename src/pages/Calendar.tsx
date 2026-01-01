import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { DealCalendar } from '../components/DealCalendar';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Calendar() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
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
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Deal Calendar
            </h1>
            <p className="text-gray-500">
              Track closing dates, webinars, and important investment events
            </p>
          </div>

          {/* Calendar */}
          <DealCalendar />
        </div>
      </main>

      <Footer />
    </div>
  );
}

