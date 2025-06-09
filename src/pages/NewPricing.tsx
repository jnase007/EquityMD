import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Building2, Users, Mail, CheckCircle, DollarSign, Star, ArrowRight, Zap, Shield, Target, TrendingUp, Eye, BarChart, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { AuthModal } from '../components/AuthModal';
import { Collapse } from 'react-collapse';

const pricingTiers = [
  {
    name: 'Starter',
    tagline: 'Perfect for New Syndicators',
    monthlyPrice: 49,
    annualPrice: 500,
    trialDays: 14,
    dealPosts: 1,
    popular: false,
    profileType: 'Basic text-only profile',
    features: [
      '14-day free trial',
      '1 deal post per year',
      'Basic text-only profile',
      'Access to 10K+ investors',
      'Basic analytics dashboard',
      'Standard support',
      '30-day extension if no views',
      '$25 refund guarantee'
    ],
    refundPolicy: '30-day extension or $25 refund if no views',
    ctaText: 'Start 14-Day Free Trial',
    highlight: false
  },
  {
    name: 'Growth',
    tagline: 'Most Popular for Active Syndicators',
    monthlyPrice: 99,
    annualPrice: 1000,
    trialDays: 7,
    dealPosts: 3,
    popular: true,
    profileType: 'Enhanced profile (text + 2 images)',
    features: [
      '7-day free trial',
      '3 deal posts per year',
      'Enhanced profile (text + 2 images)',
      'Email to 10% of investors for 1 deal',
      'Advanced analytics & reporting',
      'Priority email support',
      'Deal performance tracking',
      '$50 refund if <50 views in 30 days'
    ],
    refundPolicy: '$50 refund if less than 50 views in 30 days',
    ctaText: 'Start 7-Day Free Trial',
    highlight: true
  },
  {
    name: 'Elite',
    tagline: 'For Serious Syndicators',
    monthlyPrice: 299,
    annualPrice: 3000,
    trialDays: 7,
    dealPosts: 'Unlimited',
    popular: false,
    profileType: 'Premium profile (text, 5 images, 1 video)',
    features: [
      '7-day free trial',
      'Unlimited deal posts',
      'Premium profile (text, 5 images, 1 video)',
      '1 sponsored deal per month (email + text)',
      'Priority support & dedicated manager',
      'Advanced lead tracking & CRM',
      'Custom branding options',
      'Partial refund if <100 leads per sponsored deal'
    ],
    refundPolicy: 'Partial refund if less than 100 leads per sponsored deal',
    ctaText: 'Start 7-Day Free Trial',
    highlight: false
  }
];

const addOns = [
  {
    name: 'Extra Deal Post',
    price: 499,
    description: 'One additional deal posting beyond your plan limit',
    type: 'one-time'
  },
  {
    name: 'Deal Sponsorship',
    price: 899,
    description: 'Featured placement with email + text to all investors',
    guarantee: '50-lead guarantee or $200 refund',
    type: 'one-time'
  },
  {
    name: 'Media Upgrade',
    price: 99,
    description: '3 extra images or 1 additional video for your profile',
    type: 'monthly'
  }
];

const trustSignals = [
  { icon: Users, value: '10,000+', label: 'Accredited Investors' },
  { icon: DollarSign, value: '$500M+', label: 'in Deals Posted' },
  { icon: Building2, value: '1,200+', label: 'Successful Deals' },
  { icon: Star, value: '4.9/5', label: 'Average Rating' }
];

export function NewPricing() {
  const { user } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [activeMobileCard, setActiveMobileCard] = useState<number | null>(null);

  const handleSubscribe = async (tier: typeof pricingTiers[0]) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setIsSubscribing(true);
      // Redirect to signup with the selected plan
      window.location.href = '/auth/signup';
    } catch (error) {
      console.error('Subscription error:', error);
      alert('There was an error processing your subscription. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const toggleMobileCard = (index: number) => {
    setActiveMobileCard(activeMobileCard === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Syndicator Pricing with Free Trials | EquityMD"
        description="Join EquityMD's syndicator pricing plans with free trials and guaranteed results for 10K+ accredited investors. Risk-free trials starting at $49/month."
        keywords="syndicator pricing, CRE deals, free trial, commercial real estate pricing, syndication platform"
        canonical="https://equitymd.com/new-pricing"
      />
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 lg:py-32">
        <div className="max-w-6xl mx-auto text-center px-4">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Grow Your Syndication with Confidence
          </h1>
          <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Risk-Free Trials, Results Guaranteed
          </p>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            Join thousands of syndicators who've raised capital faster with our proven platform. 
            Start your free trial today and see results within 30 days or get your money back.
          </p>

          {/* Billing Toggle */}
          <div className="mt-12 inline-flex items-center bg-blue-800/50 backdrop-blur rounded-lg p-1 border border-blue-400/30">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${ 
                billingInterval === 'monthly' 
                  ? 'bg-white text-blue-600 shadow-lg' 
                  : 'text-blue-100 hover:text-white hover:bg-blue-700/50'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                billingInterval === 'annual' 
                  ? 'bg-white text-blue-600 shadow-lg' 
                  : 'text-blue-100 hover:text-white hover:bg-blue-700/50'
              }`}
            >
              Annual (Save 17%)
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Comparison Table - Desktop */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="hidden md:block">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="grid grid-cols-4 border-b border-gray-200">
              <div className="p-6 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Compare Plans</h3>
                <p className="text-gray-600 mt-1">Choose the right plan for your syndication goals</p>
              </div>
              {pricingTiers.map((tier, index) => (
                <div 
                  key={tier.name}
                  className={`p-6 text-center relative ${
                    tier.popular ? 'bg-blue-50 border-b-4 border-blue-600' : 'bg-white'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{tier.tagline}</p>
                  <div className="mt-4">
                    <div className="text-4xl font-bold text-gray-900">
                      ${billingInterval === 'monthly' ? tier.monthlyPrice : Math.round(tier.annualPrice / 12)}
                    </div>
                    <div className="text-gray-500">per month</div>
                    {billingInterval === 'annual' && (
                      <div className="text-green-600 text-sm mt-2 font-medium">
                        Save ${(tier.monthlyPrice * 12) - tier.annualPrice} annually
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Rows */}
            <div className="divide-y divide-gray-200">
              <div className="grid grid-cols-4 border-b border-gray-200 hover:bg-gray-50">
                <div className="p-4 font-medium text-gray-900">Free Trial Period</div>
                {pricingTiers.map((tier) => (
                  <div key={tier.name} className="p-4 text-center text-gray-700">
                    {tier.trialDays} days
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-4 border-b border-gray-200 hover:bg-gray-50">
                <div className="p-4 font-medium text-gray-900">Deal Posts per Year</div>
                {pricingTiers.map((tier) => (
                  <div key={tier.name} className="p-4 text-center text-gray-700">
                    {tier.dealPosts}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-4 border-b border-gray-200 hover:bg-gray-50">
                <div className="p-4 font-medium text-gray-900">Profile Type</div>
                {pricingTiers.map((tier) => (
                  <div key={tier.name} className="p-4 text-center text-gray-700 text-sm">
                    {tier.profileType}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-4 border-b border-gray-200 hover:bg-gray-50">
                <div className="p-4 font-medium text-gray-900">Results Guarantee</div>
                {pricingTiers.map((tier) => (
                  <div key={tier.name} className="p-4 text-center text-gray-700 text-sm">
                    {tier.refundPolicy}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Row */}
            <div className="grid grid-cols-4 bg-gray-50 border-t-2 border-gray-200">
              <div className="p-6"></div>
              {pricingTiers.map((tier) => (
                <div key={tier.name} className="p-6 text-center">
                  <button
                    onClick={() => handleSubscribe(tier)}
                    disabled={isSubscribing}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all transform hover:scale-105 ${
                      tier.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } disabled:opacity-50 disabled:transform-none`}
                  >
                    {isSubscribing ? 'Processing...' : tier.ctaText}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Accordion Cards */}
        <div className="md:hidden space-y-4">
          {pricingTiers.map((tier, index) => (
            <div 
              key={tier.name}
              className={`bg-white shadow-md rounded-lg overflow-hidden ${
                tier.popular ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              {tier.popular && (
                <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium">
                  Most Popular Plan
                </div>
              )}
              
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleMobileCard(index)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                    <p className="text-gray-500 text-sm">{tier.tagline}</p>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-900">
                        ${billingInterval === 'monthly' ? tier.monthlyPrice : Math.round(tier.annualPrice / 12)}
                      </span>
                      <span className="text-gray-500">/month</span>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    <ArrowRight className={`h-5 w-5 transform transition-transform ${
                      activeMobileCard === index ? 'rotate-90' : ''
                    }`} />
                  </div>
                </div>
              </div>

              <Collapse isOpened={activeMobileCard === index}>
                <div className="px-6 pb-6 border-t border-gray-200">
                  <div className="space-y-3 mt-4">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handleSubscribe(tier)}
                    disabled={isSubscribing}
                    className={`w-full mt-6 py-3 px-6 rounded-lg font-medium transition-all ${
                      tier.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } disabled:opacity-50`}
                  >
                    {isSubscribing ? 'Processing...' : tier.ctaText}
                  </button>
                </div>
              </Collapse>
            </div>
          ))}
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            See Your Results in Real-Time
          </h2>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">2,847</div>
                <div className="text-gray-600">Total Views</div>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">156</div>
                <div className="text-gray-600">Investor Leads</div>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <BarChart className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">23%</div>
                <div className="text-gray-600">Conversion Rate</div>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">$2.4M</div>
                <div className="text-gray-600">Capital Raised</div>
              </div>
            </div>
            <p className="text-gray-600">
              Track every metric that matters. See who's viewing your deals, get detailed investor profiles, 
              and monitor your fundraising progress in real-time.
            </p>
          </div>
        </div>

        {/* Add-ons Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Optional Add-Ons
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {addOns.map((addon) => (
              <div key={addon.name} className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{addon.name}</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${addon.price}{addon.type === 'monthly' && '/mo'}
                </div>
                <p className="text-gray-600 mb-4">{addon.description}</p>
                {addon.guarantee && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 text-sm font-medium">{addon.guarantee}</span>
                    </div>
                  </div>
                )}
                <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                  {addon.type === 'one-time' ? 'One-time purchase' : 'Monthly add-on'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-20 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Trusted by Top Syndicators
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustSignals.map((signal, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <signal.icon className="h-10 w-10 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{signal.value}</div>
                <div className="text-gray-600">{signal.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-3">How do the free trials work?</h3>
              <p className="text-gray-600">
                Start with a risk-free trial (7-14 days depending on your plan). You'll have full access to all features during your trial. 
                If you're not satisfied with the results, you can cancel before the trial ends with no charges.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-3">What's your results guarantee?</h3>
              <p className="text-gray-600">
                We stand behind our platform. Each tier includes specific guarantees: Starter offers $25 refund if no views, 
                Growth offers $50 refund if less than 50 views in 30 days, and Elite offers partial refunds if sponsored deals don't generate 100+ leads.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-3">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600">
                Yes! You can change your plan anytime. Upgrades take effect immediately, and downgrades take effect at your next billing cycle. 
                We'll prorate any differences in pricing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile CTA */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <a 
          href="/auth/signup"
          className="block w-full bg-blue-600 text-white text-center py-4 rounded-lg shadow-lg font-medium text-lg hover:bg-blue-700 transition-colors"
        >
          Start Free Trial
        </a>
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