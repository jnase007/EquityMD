import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Star, TrendingUp, Quote, ArrowRight, Sparkles, Users, Building2, Award } from 'lucide-react';

const testimonials = [
  {
    quote: "Connected with SolarTech NYC through EquityMD—closed $1.4M deal. Great platform for finding quality syndicators.",
    name: "John D.",
    location: "NYC Investor",
    rating: 5,
    highlight: "$1.4M Deal"
  },
  {
    quote: "Found Back Bay Capital on EquityMD—excellent communication and transparency. Invested in their latest multifamily project.",
    name: "Sarah M.",
    location: "Boston Investor",
    rating: 5,
    highlight: "Multifamily"
  },
  {
    quote: "EquityMD made it easy to connect with Starboard Realty. Professional platform with verified syndicators.",
    name: "Michael R.",
    location: "California Investor",
    rating: 5,
    highlight: "Verified"
  },
  {
    quote: "Great marketplace for CRE connections. Connected with Sutera Properties—impressed with their track record and professionalism.",
    name: "Lisa K.",
    location: "Texas Investor",
    rating: 5,
    highlight: "Track Record"
  },
  {
    quote: "EquityMD saved me months of research. Found multiple quality syndicators and made my first CRE investment.",
    name: "David L.",
    location: "Florida Investor",
    rating: 5,
    highlight: "Time Saved"
  },
  {
    quote: "Excellent platform for connecting with experienced syndicators. The verification process gives me confidence in the listings.",
    name: "Jennifer W.",
    location: "Arizona Investor",
    rating: 5,
    highlight: "Confidence"
  }
];

export function SuccessStories() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        {/* Floating stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <Star 
              key={i}
              className="absolute text-white/10"
              fill="currentColor"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                width: `${30 + i * 8}px`,
                height: `${30 + i * 8}px`,
                transform: `rotate(${-15 + i * 10}deg)`,
              }}
            />
          ))}
        </div>
        
        <div className="max-w-6xl mx-auto px-4 py-20 relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Real Investor Experiences
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Success Stories
          </h1>
          <p className="text-xl text-amber-100 max-w-2xl mx-auto">
            Discover how real estate syndicators and investors are achieving their goals with EquityMD.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative -mt-10 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">20+</div>
              <div className="text-gray-500">Syndicators</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">10,000+</div>
              <div className="text-gray-500">Investors</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">18.5%</div>
              <div className="text-gray-500">Average IRR</div>
            </div>
          </div>
        </div>
      </div>

      {/* Investor Testimonials Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Quote className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Investor Success Stories</h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real feedback from investors who've connected with syndicators on our platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition group"
              >
                {/* Highlight badge */}
                <div className="inline-block bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
                  {testimonial.highlight}
                </div>
                
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400" fill="currentColor" />
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <p className="text-sm text-gray-400 max-w-2xl mx-auto">
              Testimonials are representative of user experiences—EquityMD doesn't guarantee investment outcomes. All investments involve risk.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Connect with Syndicators?
              </h2>
              <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
                Join the growing community connecting through EquityMD—stories illustrative, EquityMD doesn't guarantee outcomes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/directory"
                  className="inline-flex items-center justify-center gap-2 bg-white text-amber-600 px-8 py-4 rounded-2xl font-bold hover:bg-amber-50 transition shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Browse Syndicators
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition border border-white/30"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
