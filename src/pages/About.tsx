import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Building2, Users, Shield, TrendingUp, Award, CheckCircle } from 'lucide-react';

export function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="About Equitymd.com | Premier CRE Syndication Hub"
        description="Equitymd.com empowers CRE syndicators to reach 10K elite investors for $149/month. Discover our mission to simplify syndication—join free as an investor today!"
        keywords="about EquityMD, CRE syndication platform, commercial real estate marketplace, real estate investment platform"
        canonical="https://equitymd.com/about"
      />
      <Navbar />

      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl font-bold mb-6">
            About EquityMD
          </h1>
          <p className="text-xl text-blue-100">
            Connecting elite investors with premier CRE syndication opportunities
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              EquityMD simplifies commercial real estate syndication by connecting verified syndicators 
              with a curated network of 10,000+ accredited investors, creating opportunities for 
              sustainable wealth building through institutional-quality real estate investments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Quality Deals</h3>
              <p className="text-gray-600">
                Every syndication opportunity undergoes thorough due diligence and verification 
                before being listed on our platform.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Elite Network</h3>
              <p className="text-gray-600">
                Access to 10,000+ accredited investors actively seeking commercial real estate 
                investment opportunities.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">SEC Compliant</h3>
              <p className="text-gray-600">
                Platform built with SEC regulations in mind, ensuring compliant transactions 
                for all parties involved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Platform Impact
            </h2>
            <p className="text-xl text-gray-600">
              Driving growth in commercial real estate syndication
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">$450M+</div>
              <div className="text-gray-600">Total Deal Volume</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Accredited Investors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-gray-600">Active Syndications</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Our Values
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Transparency</h3>
                <p className="text-gray-600">
                  We believe in complete transparency in all transactions, providing investors 
                  with comprehensive deal information and performance metrics.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Excellence</h3>
                <p className="text-gray-600">
                  We maintain the highest standards for both syndicators and investment 
                  opportunities featured on our platform.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Integrity</h3>
                <p className="text-gray-600">
                  Every interaction on our platform is guided by integrity, ensuring fair 
                  and ethical business practices for all participants.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Community</h3>
                <p className="text-gray-600">
                  Building a strong community of investors and syndicators who support 
                  each other's success in commercial real estate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Whether you're an investor or syndicator, EquityMD provides the tools and network 
            you need to succeed in commercial real estate.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
              Join as Investor
            </button>
            <button className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition border border-white">
              List Your Deals
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 