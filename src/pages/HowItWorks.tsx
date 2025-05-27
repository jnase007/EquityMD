import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Search, CheckCircle, DollarSign, TrendingUp, Building2, Shield, Users, ChevronRight } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: <Search className="h-8 w-8 text-blue-600" />,
      title: "Browse Investment Opportunities",
      description: "Explore our curated selection of institutional-quality real estate investments across various property types and markets."
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
      title: "Invest Online",
      description: "Complete your investment electronically through our secure platform with as little as $25,000."
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-12 w-12 text-blue-600" />,
      title: "Institutional Quality",
      description: "Access real estate investments previously reserved for institutional investors."
    },
    {
      icon: <Shield className="h-12 w-12 text-blue-600" />,
      title: "Rigorous Due Diligence",
      description: "Every investment opportunity undergoes thorough vetting by our experienced team."
    },
    {
      icon: <Users className="h-12 w-12 text-blue-600" />,
      title: "Expert Partners",
      description: "Work with experienced real estate operators with proven track records."
    }
  ];

  const competitors = [
    { name: 'CrowdStreet', x: 6, y: 10, color: '#4338ca' },
    { name: 'EquityMultiple', x: 7, y: 9, color: '#4338ca' },
    { name: 'RealtyMogul', x: 5, y: 8, color: '#4338ca' },
    { name: 'Fundrise', x: 4, y: 7, color: '#4338ca' },
    { name: 'Yieldstreet', x: 3, y: 7, color: '#4338ca' },
    { name: 'EquityMD', x: 8, y: 6, color: '#ef4444' }
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
            Your gateway to institutional-quality real estate investments. 
            Start building your real estate portfolio today.
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
                    <span>Professional due diligence and management</span>
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

      {/* Competitive Analysis Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Market Leadership Analysis
          </h2>
          
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="relative" style={{ height: '600px' }}>
              {/* Y-axis label */}
              <div 
                className="absolute -left-12 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm text-gray-600"
                style={{ width: '400px' }}
              >
                Ability to Deliver (Higher = Stronger Market Presence & Execution)
              </div>

              {/* X-axis label */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-sm text-gray-600 mt-8">
                Focus (Higher = More Specialized in Syndicator Matchmaking)
              </div>

              {/* Grid */}
              <div className="relative h-full">
                {/* Plot points */}
                {competitors.map((competitor, index) => (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      left: `${(competitor.x / 10) * 100}%`,
                      bottom: `${(competitor.y / 10) * 100}%`,
                      transform: 'translate(-50%, 50%)'
                    }}
                  >
                    {/* Competitor marker */}
                    <div className="relative">
                      <div 
                        className="w-6 h-6 transform rotate-45"
                        style={{ backgroundColor: competitor.color }}
                      />
                      <div className="absolute whitespace-nowrap mt-2 text-sm font-medium" style={{ 
                        left: '50%',
                        transform: 'translateX(-50%)'
                      }}>
                        {competitor.name}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Grid lines */}
                <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
                  {[...Array(11)].map((_, i) => (
                    <React.Fragment key={i}>
                      <div 
                        className="absolute left-0 right-0 border-t border-gray-200"
                        style={{ bottom: `${(i / 10) * 100}%` }}
                      />
                      <div 
                        className="absolute top-0 bottom-0 border-l border-gray-200"
                        style={{ left: `${(i / 10) * 100}%` }}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Analysis */}
            <div className="mt-12 grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Key Differentiators</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-1 mr-2" />
                    <span>Highest focus on syndicator matchmaking and relationship building</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-1 mr-2" />
                    <span>Curated network of verified, high-quality syndicators</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-1 mr-2" />
                    <span>Rigorous due diligence and verification process</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-1 mr-2" />
                    <span>Focus on long-term relationship building over transaction volume</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Our Approach</h3>
                <p className="text-gray-600 mb-4">
                  While established platforms like CrowdStreet and EquityMultiple excel in transaction execution, EquityMD takes a different approach. We focus on creating meaningful connections between accredited investors and experienced real estate syndicators, prioritizing relationship quality over transaction quantity.
                </p>
                <p className="text-gray-600">
                  Our specialized focus allows us to better understand the unique needs and preferences of our investors, leading to more targeted and relevant investment opportunities. As we grow, we're building the infrastructure and partnerships to increase our execution capabilities while maintaining our core focus on quality matchmaking.
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
            Ready to Start Investing?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of investors building their real estate portfolios with EQUITYMD.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/browse"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Browse Opportunities
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