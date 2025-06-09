import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { SEO } from '../../components/SEO';
import { Building2, Users, Mail, CheckCircle, DollarSign, Star, ArrowRight, Zap, Shield, Target, TrendingUp, Eye, BarChart, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { AuthModal } from '../../components/AuthModal';
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
      'Exposure to 10K+ investors',
      'Basic analytics dashboard',
      'Standard support',
      '$25 refund if no views in 30 days'
    ],
    refundPolicy: '$25 refund if no views in 30 days',
    ctaText: 'Start Free Trial',
    ctaLink: '/auth/signup?plan=starter',
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
    ctaText: 'Start Free Trial',
    ctaLink: '/auth/signup?plan=growth',
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
      '1 sponsored deal/month (email + text)',
      'Priority support & dedicated manager',
      'Advanced lead tracking & CRM',
      'Custom branding options',
      'Partial refund if <100 leads per sponsored deal'
    ],
    refundPolicy: 'Partial refund if <100 leads per sponsored deal',
    ctaText: 'Start Free Trial',
    ctaLink: '/auth/signup?plan=elite',
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
  { icon: Users, value: '10K+', label: 'Accredited Investors' },
  { icon: TrendingUp, value: '500+', label: 'Proven Results for Syndicators' }
];

export function NewPricing() {
  const { user } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [openCards, setOpenCards] = useState<number[]>([0, 1, 2]); // Default to all open on mobile

  const handleSubscribe = async (tier: typeof pricingTiers[0]) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setIsSubscribing(true);
      // Redirect to signup with the selected plan
      window.location.href = tier.ctaLink;
    } catch (error) {
      console.error('Subscription error:', error);
      alert('There was an error processing your subscription. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const toggleCard = (index: number) => {
    setOpenCards(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Syndicator Pricing with Free Trials | EquityMD"
        description="Explore EquityMD's syndicator pricing plans with free trials and guaranteed results for 10K+ accredited investors."
        keywords="syndicator pricing, CRE deals, free trial, commercial real estate pricing, syndication platform, guaranteed results"
        canonical="https://equitymd.com/new-pricing"
      />
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 lg:py-32">
        <div className="max-w-6xl mx-auto text-center px-4">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Start Free, Grow with Results
          </h1>
          <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Free Trials for All Plans, Results Guaranteed
          </p>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto mb-12">
            Join thousands of syndicators who've raised capital faster with our proven platform. 
            Start your free trial today and see results within 30 days or get your money back.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-blue-800/50 backdrop-blur rounded-lg p-1 border border-blue-400/30">
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

      {/* Pricing Cards Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Three-Tier Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 pt-4">
          {pricingTiers.map((tier, index) => (
            <div 
              key={tier.name}
              className={`bg-white rounded-lg shadow-lg overflow-visible transition-transform hover:scale-105 ${
                tier.popular ? 'ring-2 ring-blue-600 relative mt-6' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}
              
              {/* Card Header - Always Visible */}
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{tier.tagline}</p>
                
                <div className="mb-4">
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

                {/* Key Info - Always Visible */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Free Trial:</span>
                    <span className="font-medium text-blue-600">{tier.trialDays} days</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Deal Posts:</span>
                    <span className="font-medium">{tier.dealPosts}/year</span>
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-2">
                    {tier.refundPolicy}
                  </div>
                </div>
              </div>

              {/* Mobile Accordion */}
              <div className="md:hidden">
                <button
                  onClick={() => toggleCard(index)}
                  className="w-full px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-gray-700 hover:bg-gray-100"
                >
                  <span className="text-sm font-medium">View Features</span>
                  {openCards.includes(index) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                
                <Collapse isOpened={openCards.includes(index)}>
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="space-y-3">
                      {tier.features.map((feature) => (
                        <div key={feature} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Collapse>
              </div>

              {/* Desktop Features - Always Visible */}
              <div className="hidden md:block px-6 pb-4">
                <div className="space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <a
                  href={tier.ctaLink}
                  className={`block w-full py-3 px-6 rounded-lg font-medium text-center transition-all transform hover:scale-105 ${
                    tier.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {tier.ctaText}
                </a>
                <p className="text-xs text-gray-500 text-center mt-2">
                  No credit card required, cancel anytime
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Preview Link & Trust Signals */}
        <div className="text-center mb-16">
          <a 
            href="/dashboard-demo"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mr-4 mb-4"
          >
            <Eye className="h-5 w-5 mr-2" />
            See Live Demo
          </a>
          
          {/* Trust Signals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-md mx-auto mt-8">
            {trustSignals.map((signal, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <signal.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{signal.value}</div>
                <div className="text-gray-600 text-sm">{signal.label}</div>
              </div>
            ))}
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