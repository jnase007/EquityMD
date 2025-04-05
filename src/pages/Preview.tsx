import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageBanner } from '../components/PageBanner';
import { Building2, Star, Users, DollarSign } from 'lucide-react';

export function Preview() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <PageBanner 
        title="Preview Your Investment"
        subtitle="Review your investment details before proceeding"
      >
        <div className="grid grid-cols-4 gap-6 mt-12 text-white">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <Building2 className="h-8 w-8 mb-3" />
            <div className="text-2xl font-bold">$2.5M</div>
            <div className="text-blue-100">Total Investment</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <Star className="h-8 w-8 mb-3" />
            <div className="text-2xl font-bold">18.5%</div>
            <div className="text-blue-100">Target IRR</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <Users className="h-8 w-8 mb-3" />
            <div className="text-2xl font-bold">24</div>
            <div className="text-blue-100">Co-Investors</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <DollarSign className="h-8 w-8 mb-3" />
            <div className="text-2xl font-bold">$50K</div>
            <div className="text-blue-100">Minimum Investment</div>
          </div>
        </div>
      </PageBanner>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">Investment Summary</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500">Property Type</div>
                <div className="font-medium">Multi-Family</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Location</div>
                <div className="font-medium">Austin, TX</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Investment Term</div>
                <div className="font-medium">5 Years</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Expected Close Date</div>
                <div className="font-medium">March 30, 2025</div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-bold mb-4">Investment Structure</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Preferred Return</span>
                  <span className="font-medium">8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Equity Multiple</span>
                  <span className="font-medium">1.8x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit Split</span>
                  <span className="font-medium">80/20</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-bold mb-4">Your Investment</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Investment Amount</span>
                  <span className="font-medium">$100,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected Annual Return</span>
                  <span className="font-medium text-green-600">$18,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Expected Return</span>
                  <span className="font-medium text-green-600">$92,500</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
              Confirm Investment
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition">
              Edit Details
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}