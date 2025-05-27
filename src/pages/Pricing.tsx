import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Building2, Users, Mail, CheckCircle, DollarSign, Star, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { AuthModal } from '../components/AuthModal';
import { Partners } from '../components/Partners';
import { createSubscription } from '../lib/stripe';

const tiers = [
  {
    name: 'Starter',
    tagline: 'Dip Your Toes',
    monthlyPrice: 149,
    annualPrice: 1490,
    creditsPerMonth: 60,
    extraCreditPrice: 2.50,
    features: [
      'Access to browse 10K investor database (view-only)',
      'Basic listing features',
      'Standard search filters',
      'Text description',
      'Single photo per listing',
      'Basic analytics',
      'Import from AppFolio & CashflowPortal'
    ],
    priceId: {
      monthly: 'price_starter_monthly',
      annual: 'price_starter_annual'
    }
  },
  {
    name: 'Pro',
    tagline: 'Tap the Network',
    monthlyPrice: 349,
    annualPrice: 3490,
    creditsPerMonth: 150,
    extraCreditPrice: 2.00,
    popular: true,
    features: [
      'Full access to 10K investor database',
      'Enhanced listings with video uploads',
      'Up to 5 photos per listing',
      'Priority placement in search',
      'Monthly email blast to all investors',
      'Advanced analytics dashboard',
      'Investor profile access',
      'Automated imports from AppFolio',
      'Automated imports from CashflowPortal',
      'Real-time data synchronization'
    ],
    priceId: {
      monthly: 'price_pro_monthly',
      annual: 'price_pro_annual'
    }
  },
  {
    name: 'Elite',
    tagline: 'Own the Room',
    monthlyPrice: 699,
    annualPrice: 6990,
    creditsPerMonth: 360,
    extraCreditPrice: 1.50,
    features: [
      'Full database access with advanced filters',
      'Premium listings with virtual tours',
      'Unlimited photos per listing',
      'Guaranteed "Deal Spotlight" monthly',
      'Dedicated email blast to investors',
      'Real-time analytics',
      'Direct investor messaging',
      'Priority support',
      'API access for AppFolio integration',
      'API access for CashflowPortal integration',
      'Custom data mapping and automation',
      'Dedicated integration specialist'
    ],
    priceId: {
      monthly: 'price_elite_monthly',
      annual: 'price_elite_annual'
    }
  }
];

export function Pricing() {
  const { user } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (tier: typeof tiers[0]) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setIsSubscribing(true);
      const priceId = tier.priceId[billingInterval];
      await createSubscription(priceId);
    } catch (error) {
      console.error('Subscription error:', error);
      alert('There was an error processing your subscription. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="CRE Syndicator Pricing | List Deals on Equitymd.com"
        description="List CRE deals for just $149–$699/month! Reach 10K elite investors instantly. Start with a free deal on Equitymd.com—sign up now, no success fees!"
        keywords="CRE syndication pricing, real estate listing fees, syndicator plans, commercial real estate platform pricing"
        canonical="https://equitymd.com/pricing"
      />
      <Navbar />

      <div className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl font-bold mb-6">
            Pricing for Syndicators
          </h1>
          <p className="text-xl text-blue-100">
            Choose your plan to list CRE deals and tap into our exclusive network of 10,000+ accredited investors
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center bg-blue-700 rounded-lg p-1">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                billingInterval === 'monthly' 
                  ? 'bg-white text-blue-600' 
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                billingInterval === 'annual' 
                  ? 'bg-white text-blue-600' 
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              Annual (Save 16%)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            All plans include our powerful integration features
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              className={`bg-white rounded-lg shadow-sm p-8 relative ${
                tier.popular ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-gray-500">{tier.tagline}</p>
                <div className="mt-4">
                  <div className="text-4xl font-bold">
                    ${billingInterval === 'monthly' ? tier.monthlyPrice : Math.round(tier.annualPrice / 12)}
                  </div>
                  <div className="text-gray-500">per month</div>
                  {billingInterval === 'annual' && (
                    <div className="text-green-600 text-sm mt-2">
                      Save 16% with annual billing
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center text-gray-600">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  <span>{tier.creditsPerMonth} credits/month ({tier.creditsPerMonth / 30} deals)</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                  <span>Extra credits: ${tier.extraCreditPrice.toFixed(2)}/credit</span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(tier)}
                disabled={isSubscribing}
                className={`w-full py-3 rounded-lg transition flex items-center justify-center ${
                  tier.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {isSubscribing ? 'Processing...' : 'Get Started'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Integration Partners Section */}
        <div className="border-t mt-16 pt-16">
          <Partners variant="light" showFeatures={true} showCTA={false} />
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold mb-2">How do credits work?</h3>
              <p className="text-gray-600">
                Each deal listing costs 30 credits. Credits reset monthly with your subscription, and unused credits expire at the end of each billing cycle. You can purchase additional credits at any time if you need to list more deals.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">What's included in each listing?</h3>
              <p className="text-gray-600">
                Each listing includes property details, investment terms, photos, documents, and direct access to interested investors. Pro and Elite tiers get additional features like video uploads, virtual tours, and priority placement.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">How do the platform integrations work?</h3>
              <p className="text-gray-600">
                We offer seamless integrations with AppFolio and CashflowPortal. You can import your deals directly from these platforms, and with Pro and Elite plans, your data stays synchronized automatically. Our integration specialists can help you set up custom data mapping for your specific needs.
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