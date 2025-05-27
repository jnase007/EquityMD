import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Search, CheckCircle, DollarSign, TrendingUp, Building2, Shield, Users, ChevronRight } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: <Search className="h-8 w-8 text-blue-600" />,
      title: "Browse Syndicator Listings",
      description: "Explore syndicator profiles and deal listings across various property types and markets—vet deals independently."
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Verify Accreditation",
      description: "Complete our simple accreditation verification process to gain access to exclusive investment opportunities."
    },
    {
      icon: <Building2 className="h-8 w-8 text-blue-600" />,
      title: "Review Deal Details",
      description: "Access comprehensive deal information, including financials, market analysis, and investment strategy."
    },
    {
      icon: <DollarSign className="h-8 w-8 text-blue-600" />,
      title: "Connect with Syndicators",
      description: "Contact syndicators directly for deals starting at $25,000—EquityMD doesn't process investments or handle transactions."
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-12 w-12 text-blue-600" />,
      title: "Quality Connections",
      description: "Connect with experienced real estate syndicators and explore institutional-quality opportunities."
    },
    {
      icon: <Shield className="h-12 w-12 text-blue-600" />,
      title: "Verified Syndicators",
      description: "Browse profiles of verified syndicators with established track records in commercial real estate."
    },
    {
      icon: <Users className="h-12 w-12 text-blue-600" />,
      title: "Direct Communication",
      description: "Communicate directly with syndicators to explore opportunities and build relationships."
    }
  ];



  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl font-bold mb-6">
            How EquityMD Works
          </h1>
          <p className="text-xl text-blue-100">
            Connect with real estate syndicators and explore opportunities. 
            EquityMD doesn't process investments—users vet syndicators and deals independently.
          </p>
        </div>
      </div>

      {/* Understanding Real Estate Syndication */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold mb-8">Understanding Real Estate Syndication</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-4">What is Real Estate Syndication?</h3>
              <p className="text-gray-600 mb-6">
                Real estate syndication is a powerful investment strategy that allows multiple investors to pool their capital and resources to invest in larger, more profitable real estate projects that would be difficult to acquire individually.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <ChevronRight className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-gray-600 ml-2">
                    <strong className="text-gray-900">Pooled Resources:</strong> By combining capital from multiple investors, syndications can target larger, institutional-quality properties with better economies of scale.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <ChevronRight className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-gray-600 ml-2">
                    <strong className="text-gray-900">Professional Management:</strong> Experienced syndicators handle all aspects of property acquisition, management, and eventual sale.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <ChevronRight className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-gray-600 ml-2">
                    <strong className="text-gray-900">Passive Investment:</strong> Investors can benefit from real estate ownership without the responsibilities of active property management.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Key Benefits</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                    <span>Access to larger, higher-quality properties</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                    <span>Diversification across multiple investments</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                    <span>Professional property management and oversight</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                    <span>Regular cash flow distributions</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                    <span>Potential tax advantages</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Typical Investment Structure</h3>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-gray-900">Minimum Investment</div>
                    <div className="text-gray-600">Usually $25,000 - $100,000</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Investment Term</div>
                    <div className="text-gray-600">3-7 years on average</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Returns</div>
                    <div className="text-gray-600">Both ongoing cash flow and appreciation at sale</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-lg p-6 shadow-sm h-full">
                <div className="mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose EquityMD Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">
            Why Choose EquityMD?
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 mb-8 text-center">
              Your trusted marketplace for CRE syndication connections—designed for accredited investors and experienced syndicators.
            </p>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialized Connections</h3>
                <p className="text-gray-700">
                  We prioritize quality over quantity, connecting you with syndicators who align with your CRE goals—building relationships that last.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Direct Engagement</h3>
                <p className="text-gray-700">
                  Engage directly with syndicators to explore listings and vet deals on your terms—EquityMD empowers your decisions, staying hands-off.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Future-Forward Vision</h3>
                <p className="text-gray-700 mb-6">
                  Join a platform built for the future—AI-driven matchmaking and expanded market insights are coming soon to enhance your CRE syndication experience.
                </p>
              </div>
              
              <div className="text-center">
                <Link
                  to="/directory"
                  className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-700 transition mb-6"
                >
                  Start Connecting Today
                </Link>
                
                <p className="text-sm text-gray-500 max-w-3xl mx-auto">
                  EquityMD is a listing platform, not a broker-dealer or investment adviser—users connect with syndicators directly and assume all responsibility for vetting deals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose EQUITYMD?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
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

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Connect with Syndicators?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands connecting with real estate syndicators through EquityMD—vet deals independently.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/directory"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Browse Syndicators
            </Link>
            <Link
              to="/contact"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}