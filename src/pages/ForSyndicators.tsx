import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Users, Globe, BarChart, Shield, Building2, CheckCircle, ArrowRight } from 'lucide-react';

export function ForSyndicators() {
  const benefits = [
    {
      icon: <Users className="h-12 w-12 text-blue-600" />,
      title: "Access to Investors",
      description: "Connect with thousands of accredited investors actively seeking real estate opportunities."
    },
    {
      icon: <Globe className="h-12 w-12 text-blue-600" />,
      title: "Digital Presence",
      description: "Showcase your track record and deals through a professional digital platform."
    },
    {
      icon: <BarChart className="h-12 w-12 text-blue-600" />,
      title: "Efficient Fundraising",
      description: "Streamline your fundraising process with our comprehensive deal management tools."
    }
  ];

  const features = [
    {
      title: "Deal Showcase",
      description: "Present your investment opportunities professionally with detailed property information, financials, and media."
    },
    {
      title: "Investor Communications",
      description: "Built-in tools for updates, document sharing, and investor relations management."
    },
    {
      title: "Digital Subscriptions",
      description: "Enable investors to complete subscription agreements and accreditation verification online."
    },
    {
      title: "Performance Tracking",
      description: "Provide investors with real-time updates on their investments and distributions."
    }
  ];

  const integrations = [
    {
      name: "AppFolio",
      logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos//appfolio_logo.png`,
      description: "Import your property listings directly from AppFolio. Automatically sync property details, financials, and media.",
      features: [
        "One-click property import",
        "Automatic data synchronization",
        "Media and document transfer",
        "Financial data integration"
      ]
    },
    {
      name: "CashflowPortal",
      logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos//cashflow_logo.jpg`,
      description: "Seamlessly integrate your CashflowPortal deals with EquityMD. Keep your investment opportunities in sync across platforms.",
      features: [
        "Direct deal import",
        "Investment terms sync",
        "Document synchronization",
        "Investor data integration"
      ]
    },
    {
      name: "Juniper Square",
      logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos//Juniper_Square.png`,
      description: "Leverage Juniper Square's powerful investment management platform for enhanced investor relations and reporting.",
      features: [
        "Automated investor reporting",
        "Distribution management",
        "Document sharing",
        "Investor communications"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80"
            alt="Modern office building"
            className="w-full h-[500px] object-cover brightness-50"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center text-white">
          <h1 className="text-4xl font-bold mb-6">
            Showcase Your CRE Deals
          </h1>
          <p className="text-xl mb-8">
            Connect directly with accredited investors—no intermediaries. 
            EquityMD is a listing platform—syndicators handle all investor communications and compliance.
          </p>
          <Link
            to="/signup/syndicator/email"
            className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Get Started as a Syndicator
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Partner with EquityMD?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integrations Section */}
      <div className="bg-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Seamless Integrations
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Import your deals directly from your existing platforms
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8">
                <div className="h-12 mb-6">
                  <img
                    src={integration.logo}
                    alt={integration.name}
                    className="h-full object-contain"
                  />
                </div>
                <p className="text-gray-600 mb-6">
                  {integration.description}
                </p>
                <div className="space-y-3">
                  {integration.features.map((feature, i) => (
                    <div key={i} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Platform Features
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">$500M+</div>
              <div className="text-blue-100">Capital Raised</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Active Investors</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-blue-100">Successful Deals</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Accelerate Your Growth?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join EquityMD today to access exclusive real estate syndication opportunities.
          </p>
          <Link
            to="/signup/syndicator/email"
            className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Get Started as a Syndicator
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}