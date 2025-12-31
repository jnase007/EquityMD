import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Star, TrendingUp } from 'lucide-react';

export function SuccessStories() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl font-bold mb-6">
            Success Stories
          </h1>
          <p className="text-xl text-blue-100">
            Discover how real estate syndicators and investors are achieving their goals with EQUITYMD.
          </p>
        </div>
      </div>

      {/* Investor Testimonials Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Investor Success Stories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
              </div>
              <p className="text-gray-600 mb-4">
                "Connected with SolarTech NYC through EquityMD—closed $1.4M deal. Great platform for finding quality syndicators."
              </p>
              <div className="text-sm">
                <div className="font-semibold">John D.</div>
                <div className="text-gray-500">NYC Investor</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
              </div>
              <p className="text-gray-600 mb-4">
                "Found Back Bay Capital on EquityMD—excellent communication and transparency. Invested in their latest multifamily project."
              </p>
              <div className="text-sm">
                <div className="font-semibold">Sarah M.</div>
                <div className="text-gray-500">Boston Investor</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
              </div>
              <p className="text-gray-600 mb-4">
                "EquityMD made it easy to connect with Starboard Realty. Professional platform with verified syndicators."
              </p>
              <div className="text-sm">
                <div className="font-semibold">Michael R.</div>
                <div className="text-gray-500">California Investor</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
              </div>
              <p className="text-gray-600 mb-4">
                "Great marketplace for CRE connections. Connected with Sutera Properties—impressed with their track record and professionalism."
              </p>
              <div className="text-sm">
                <div className="font-semibold">Lisa K.</div>
                <div className="text-gray-500">Texas Investor</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
              </div>
              <p className="text-gray-600 mb-4">
                "EquityMD saved me months of research. Found multiple quality syndicators and made my first CRE investment."
              </p>
              <div className="text-sm">
                <div className="font-semibold">David L.</div>
                <div className="text-gray-500">Florida Investor</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
              </div>
              <p className="text-gray-600 mb-4">
                "Excellent platform for connecting with experienced syndicators. The verification process gives me confidence in the listings."
              </p>
              <div className="text-sm">
                <div className="font-semibold">Jennifer W.</div>
                <div className="text-gray-500">Arizona Investor</div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 max-w-2xl mx-auto">
              Testimonials are representative of user experiences—EquityMD doesn't guarantee investment outcomes. All investments involve risk.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">20+</div>
              <div className="text-gray-600">Syndicators</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Investors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">18.5%</div>
              <div className="text-gray-600">Average IRR</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Connect with Syndicators?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the growing community connecting through EquityMD—stories illustrative, EquityMD doesn't guarantee outcomes.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
              Browse Syndicators
            </button>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition">
              Contact Us
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}