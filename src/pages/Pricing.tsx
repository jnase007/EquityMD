import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Building2, Users, CheckCircle, Star, ArrowRight, Sparkles, Crown, Zap, Gift, PartyPopper } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { AuthModal } from '../components/AuthModal';
import { useTheme } from '../contexts/ThemeContext';

const tiers = [
  {
    name: 'Starter',
    tagline: 'Get Started',
    monthlyPrice: 149,
    annualPrice: 1490,
    icon: Zap,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    features: [
      'List up to 2 deals per month',
      'Basic deal listing page',
      'Single photo per listing',
      'Text description',
      'Standard search placement',
      'Basic analytics dashboard',
      'Email support'
    ],
    priceId: {
      monthly: 'price_starter_monthly',
      annual: 'price_starter_annual'
    }
  },
  {
    name: 'Pro',
    tagline: 'Most Popular',
    monthlyPrice: 349,
    annualPrice: 3490,
    popular: true,
    icon: Star,
    iconColor: 'text-indigo-500',
    iconBg: 'bg-indigo-100',
    features: [
      'List up to 5 deals per month',
      'Enhanced deal pages with video',
      'Up to 10 photos per listing',
      'Priority search placement',
      'Advanced analytics & insights',
      'Investor interest notifications',
      'Document room for investors',
      'Priority email support'
    ],
    priceId: {
      monthly: 'price_pro_monthly',
      annual: 'price_pro_annual'
    }
  },
  {
    name: 'Premium',
    tagline: 'Direct Investor Access',
    customPricing: true,
    icon: Crown,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-100',
    features: [
      'Unlimited deal listings',
      'Direct access to all 7,400+ investors',
      'Investor database with contact info',
      'Priority messaging to investors',
      'Dedicated investor outreach campaigns',
      'Featured "Spotlight" placement',
      'Custom branded deal pages',
      'Dedicated account manager',
      'Quarterly investor webinar hosting',
      'White-glove onboarding'
    ],
    priceId: {
      annual: 'price_premium_annual'
    }
  }
];

export function Pricing() {
  const { user } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === 'dim' || resolvedTheme === 'dark';

  const handleSubscribe = async (tier: typeof tiers[0]) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // For Premium tier, redirect to contact
    if (tier.name === 'Premium') {
      window.location.href = '/contact?plan=premium';
      return;
    }

    // For other tiers, show auth modal for now
    setShowAuthModal(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title="Syndicator Pricing | EquityMD"
        description="List your real estate deals and reach 7,400+ accredited investors. Choose from Starter, Pro, or Premium plans."
        keywords="syndicator pricing, real estate listing, investor access, deal listing platform"
        canonical="https://equitymd.com/pricing"
      />
      <Navbar />

      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-yellow-200" />
            <span className="font-bold text-lg">🎉 Launch Promotion!</span>
          </div>
          <span className="text-emerald-50">
            All listing fees waived until <strong>June 2026</strong> — Start listing for FREE!
          </span>
          <Gift className="h-5 w-5 text-yellow-200 hidden sm:block" />
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/90 backdrop-blur rounded-full mb-6 animate-pulse">
            <Gift className="h-4 w-4 text-white" />
            <span className="text-sm font-bold">FREE Until June 2026</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            List Your Deals for Free
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            We're waiving all listing fees until June 2026 to help syndicators get started. Join now and reach 7,400+ accredited investors!
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center bg-white/10 backdrop-blur rounded-xl p-1.5">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${
                billingInterval === 'monthly' 
                  ? 'bg-white text-blue-600 shadow-lg' 
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                billingInterval === 'annual' 
                  ? 'bg-white text-blue-600 shadow-lg' 
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Annual
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Save 16%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 py-16 -mt-8">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isCustomPricing = tier.customPricing;
            const showMonthly = billingInterval === 'monthly' && !isCustomPricing;
            const perMonth = showMonthly ? tier.monthlyPrice : (tier.annualPrice ? Math.round(tier.annualPrice / 12) : 0);
            
            return (
              <div 
                key={tier.name}
                className={`rounded-2xl p-8 relative transition-all duration-300 hover:scale-[1.02] ${
                  tier.popular 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white ring-4 ring-blue-300 shadow-2xl' 
                    : isDarkTheme
                      ? 'bg-[var(--card-bg)] border border-[var(--border-color)]'
                      : 'bg-white border border-gray-200 shadow-lg'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 ${
                    tier.popular ? 'bg-white/20' : tier.iconBg
                  }`}>
                    <Icon className={`h-7 w-7 ${tier.popular ? 'text-white' : tier.iconColor}`} />
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-1 ${tier.popular ? 'text-white' : ''}`}>
                    {tier.name}
                  </h3>
                  <p className={`text-sm ${tier.popular ? 'text-blue-100' : 'text-gray-500'}`}>
                    {tier.tagline}
                  </p>
                  
                  <div className="mt-6">
                    {isCustomPricing ? (
                      <>
                        <div className={`text-4xl font-bold ${isDarkTheme ? 'text-amber-400' : 'text-amber-600'}`}>
                          Custom
                        </div>
                        <div className={`text-sm mt-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                          Tailored to your needs
                        </div>
                        <div className={`text-xs mt-1 ${isDarkTheme ? 'text-amber-400/70' : 'text-amber-600/70'}`}>
                          Let's discuss on a call
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Show FREE promotion for Starter and Pro */}
                        <div className="relative inline-block">
                          <div className={`text-4xl font-bold line-through opacity-50 ${tier.popular ? 'text-white' : 'text-gray-400'}`}>
                            {formatPrice(perMonth)}
                          </div>
                          <div className={`text-5xl font-bold ${tier.popular ? 'text-emerald-300' : 'text-emerald-500'}`}>
                            FREE
                          </div>
                        </div>
                        <div className={`text-sm mt-2 ${tier.popular ? 'text-emerald-200' : 'text-emerald-600'} font-medium`}>
                          Until June 2026
                        </div>
                        <div className={`text-xs mt-1 ${tier.popular ? 'text-blue-200' : 'text-gray-500'}`}>
                          Then {formatPrice(perMonth)}/month
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                        tier.popular ? 'text-green-300' : 'text-green-500'
                      }`} />
                      <span className={`text-sm ${tier.popular ? 'text-white/90' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(tier)}
                  disabled={isSubscribing}
                  className={`w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    tier.popular
                      ? 'bg-white text-blue-600 hover:bg-gray-100 shadow-lg'
                      : tier.name === 'Premium'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-lg'
                        : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 shadow-lg'
                  } disabled:opacity-50`}
                >
                  {tier.name === 'Premium' ? 'Contact Sales' : 'Start Free Now'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Trust Section */}
        <div className="mt-16 text-center">
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${isDarkTheme ? 'bg-emerald-900/30 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'}`}>
            <Gift className={`h-5 w-5 ${isDarkTheme ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <p className={`text-sm font-medium ${isDarkTheme ? 'text-emerald-300' : 'text-emerald-700'}`}>
              No credit card required. Start listing deals for free today!
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className={`text-2xl font-bold text-center mb-10 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className={`p-6 rounded-xl ${isDarkTheme ? 'bg-emerald-900/20 border border-emerald-700/50' : 'bg-emerald-50 border border-emerald-200'}`}>
              <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDarkTheme ? 'text-emerald-300' : 'text-emerald-800'}`}>
                <Gift className="h-5 w-5" />
                Is it really free until June 2026?
              </h3>
              <p className={isDarkTheme ? 'text-emerald-200/80' : 'text-emerald-700'}>
                Yes! We're waiving all listing fees for Starter and Pro plans until June 2026 as a launch promotion to help syndicators get started on our platform. No credit card required, no hidden fees. Just sign up and start listing your deals to reach 7,400+ accredited investors.
              </p>
            </div>
            <div className={`p-6 rounded-xl ${isDarkTheme ? 'bg-[var(--card-bg)] border border-[var(--border-color)]' : 'bg-white shadow-sm border border-gray-100'}`}>
              <h3 className={`font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                Can I upgrade or downgrade my plan?
              </h3>
              <p className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                Yes! You can change your plan at any time. When upgrading, you'll be prorated for the remainder of your billing cycle. When downgrading, the change takes effect at your next billing date.
              </p>
            </div>
            <div className={`p-6 rounded-xl ${isDarkTheme ? 'bg-[var(--card-bg)] border border-[var(--border-color)]' : 'bg-white shadow-sm border border-gray-100'}`}>
              <h3 className={`font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                What's included in the Premium plan?
              </h3>
              <p className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                Premium gives you direct access to our entire investor database of 7,400+ accredited investors. You get their contact information, can message them directly, and receive a dedicated account manager. Pricing is custom based on your needs — schedule a call with our team to discuss.
              </p>
            </div>
            <div className={`p-6 rounded-xl ${isDarkTheme ? 'bg-[var(--card-bg)] border border-[var(--border-color)]' : 'bg-white shadow-sm border border-gray-100'}`}>
              <h3 className={`font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                How do I list a deal?
              </h3>
              <p className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                After signing up, you can create a deal listing from your dashboard. Add property details, photos, investment terms, and documents. Once published, your deal is visible to all investors on the platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          defaultType="syndicator"
        />
      )}

      <Footer />
    </div>
  );
}
