import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Search, CheckCircle, DollarSign, TrendingUp, Building2, Shield, Users, ArrowRight, Star, Clock, Award } from 'lucide-react';

export function HowItWorksImproved() {
  const steps = [
    {
      icon: <Search className="h-10 w-10 text-white" />,
      title: "Discover Opportunities",
      description: "Browse our carefully curated selection of institutional-quality real estate investments with detailed analytics and projections.",
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      icon: <Shield className="h-10 w-10 text-white" />,
      title: "Quick Verification",
      description: "Complete our streamlined accreditation process in minutes to unlock exclusive investment opportunities.",
      color: "bg-gradient-to-br from-green-500 to-green-600"
    },
    {
      icon: <Building2 className="h-10 w-10 text-white" />,
      title: "Deep Due Diligence",
      description: "Access comprehensive property analysis, market research, and financial projections from our expert team.",
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      icon: <DollarSign className="h-10 w-10 text-white" />,
      title: "Invest Online",
      description: "Complete your investment electronically through our secure platform with as little as $25,000.",
      color: "bg-gradient-to-br from-orange-500 to-orange-600"
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-16 w-16 text-blue-600" />,
      title: "Institutional-Grade Assets",
      description: "Access premium real estate investments typically reserved for large institutions and ultra-high-net-worth individuals.",
      stats: "15-25% Target IRR"
    },
    {
      icon: <Shield className="h-16 w-16 text-green-600" />,
      title: "Rigorous Vetting Process",
      description: "Every opportunity undergoes comprehensive due diligence by our experienced real estate professionals.",
      stats: "< 5% Approval Rate"
    },
    {
      icon: <Users className="h-16 w-16 text-purple-600" />,
      title: "Proven Track Record",
      description: "Partner with seasoned operators who have successfully managed billions in real estate assets.",
      stats: "$2B+ Assets Managed"
    }
  ];

  const features = [
    {
      icon: <Clock className="h-8 w-8 text-blue-600" />,
      title: "Passive Income",
      description: "Earn quarterly distributions without the hassles of property management"
    },
    {
      icon: <Award className="h-8 w-8 text-blue-600" />,
      title: "Tax Advantages",
      description: "Benefit from depreciation and other real estate tax benefits"
    },
    {
      icon: <Star className="h-8 w-8 text-blue-600" />,
      title: "Portfolio Diversification",
      description: "Reduce risk by diversifying beyond traditional stocks and bonds"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section with Gradient */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              How <span className="text-blue-300">EquityMD</span> Works
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Your gateway to institutional-quality real estate investments. 
              Build wealth through passive real estate ownership.
            </p>
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold text-blue-200">$500M+</div>
                <div className="text-blue-100">Total Investments</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold text-blue-200">7,400+</div>
                <div className="text-blue-100">Active Investors</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold text-blue-200">18.5%</div>
                <div className="text-blue-100">Average IRR</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Steps */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start building your real estate portfolio in minutes, not months
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-6`}>
                    {step.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                
                {/* Arrow connector */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose EquityMD?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide access to premium real estate investments with institutional-level due diligence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-gray-100 transition-colors">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{benefit.description}</p>
                <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                  {benefit.stats}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Investment Advantages
            </h2>
            <p className="text-xl text-gray-600">
              Maximize your returns while minimizing your effort
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  {feature.icon}
                  <h3 className="text-xl font-bold ml-3 text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real Estate Education */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Understanding Real Estate Syndication
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Real estate syndication allows multiple investors to pool their capital and invest in larger 
                commercial properties that would be difficult to acquire individually.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Pooled Capital Power</h4>
                    <p className="text-gray-600">Access institutional-quality properties with better economies of scale</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Professional Management</h4>
                    <p className="text-gray-600">Experienced operators handle acquisition, management, and disposition</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Passive Investment</h4>
                    <p className="text-gray-600">Enjoy real estate ownership benefits without active management responsibilities</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Investment Structure</h3>
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Minimum Investment</span>
                    <span className="text-blue-600 font-bold">$25,000</span>
                  </div>
                  <p className="text-gray-600 text-sm">Lower minimums than traditional real estate</p>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Investment Term</span>
                    <span className="text-blue-600 font-bold">3-7 Years</span>
                  </div>
                  <p className="text-gray-600 text-sm">Medium-term investment horizon</p>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Expected Returns</span>
                    <span className="text-blue-600 font-bold">15-25% IRR</span>
                  </div>
                  <p className="text-gray-600 text-sm">Cash flow + appreciation at sale</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Building Wealth?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Join thousands of investors who are building their real estate portfolios with EquityMD. 
            Start with as little as $25,000.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/find"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
            >
              Browse Opportunities
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-400 transition-colors border-2 border-blue-400"
            >
              Schedule a Call
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 