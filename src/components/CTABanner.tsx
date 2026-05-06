import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface CTABannerProps {
  variant?: 'investor' | 'syndicator' | 'general';
}

export function CTABanner({ variant = 'general' }: CTABannerProps) {
  if (variant === 'investor') {
    return (
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start Investing in Real Estate Syndications</h2>
          <p className="text-blue-100 mb-8 text-lg">Browse verified syndicators and curated deals. Free for accredited investors.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/find" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition">
              Browse Deals <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/directory" className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition">
              View Syndicators
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'syndicator') {
    return (
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">List Your Deals on EquityMD</h2>
          <p className="text-green-100 mb-8 text-lg">Reach thousands of accredited investors actively looking for syndication opportunities.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pricing" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition">
              View Pricing <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/how-it-works" className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition">
              Learn How It Works
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // General
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Invest in Real Estate?</h2>
        <p className="text-blue-100 mb-8 text-lg">Join thousands of accredited investors building passive income through commercial real estate.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/find" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition">
            Browse Deals <ArrowRight className="h-5 w-5" />
          </Link>
          <Link to="/how-it-works" className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition">
            How It Works
          </Link>
        </div>
      </div>
    </section>
  );
}
