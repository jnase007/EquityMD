import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageBanner } from '../../components/PageBanner';
import { Shield, Scale, FileText, AlertTriangle, Users, Building2, CheckCircle } from 'lucide-react';

export function Compliance() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <PageBanner 
        title="Marketplace Guidelines"
        subtitle="Our commitment to maintaining a trusted real estate investment platform"
      />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Introduction */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Platform Overview</h2>
            <p className="text-gray-600">
              EquityMD operates as a marketplace platform connecting accredited investors with real estate investment opportunities. 
              While we are not a broker-dealer or investment advisor, we maintain strict standards to ensure the quality and 
              integrity of our platform.
            </p>
          </div>

          {/* Syndicator Requirements */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Building2 className="h-6 w-6 mr-2 text-blue-600" />
              Syndicator Requirements
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3" />
                <div>
                  <h3 className="font-bold mb-2">Business Verification</h3>
                  <p className="text-gray-600">
                    All syndicators must provide proof of business registration, operating history, and track record in real estate investments.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3" />
                <div>
                  <h3 className="font-bold mb-2">Deal Documentation</h3>
                  <p className="text-gray-600">
                    Each listed opportunity must include comprehensive documentation, including property details, financial projections, and risk factors.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3" />
                <div>
                  <h3 className="font-bold mb-2">Transparency</h3>
                  <p className="text-gray-600">
                    Clear disclosure of fees, terms, and potential conflicts of interest is required for all listings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Investor Guidelines */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Users className="h-6 w-6 mr-2 text-blue-600" />
              Investor Guidelines
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3" />
                <div>
                  <h3 className="font-bold mb-2">Accreditation</h3>
                  <p className="text-gray-600">
                    Investors must self-certify their accredited status and maintain accurate profile information.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3" />
                <div>
                  <h3 className="font-bold mb-2">Due Diligence</h3>
                  <p className="text-gray-600">
                    Investors are responsible for conducting their own due diligence and seeking professional advice before investing.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3" />
                <div>
                  <h3 className="font-bold mb-2">Communication</h3>
                  <p className="text-gray-600">
                    All investment-related communications should occur through the platform for transparency and record-keeping.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Standards */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              Platform Standards
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3" />
                <div>
                  <h3 className="font-bold mb-2">Quality Control</h3>
                  <p className="text-gray-600">
                    We review all listings for completeness and clarity before they are published on the platform.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3" />
                <div>
                  <h3 className="font-bold mb-2">Fair Practices</h3>
                  <p className="text-gray-600">
                    We maintain equal access and visibility for all compliant listings without preferential treatment.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3" />
                <div>
                  <h3 className="font-bold mb-2">Data Security</h3>
                  <p className="text-gray-600">
                    We employ industry-standard security measures to protect user data and communications.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-12">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1 mr-3" />
              <div>
                <h3 className="font-bold text-yellow-800 mb-2">Marketplace Disclaimer</h3>
                <p className="text-yellow-800">
                  EquityMD is a marketplace platform that connects investors with real estate opportunities. We do not provide investment advice, 
                  broker securities transactions, or hold investor funds. Please refer to our full legal disclaimer for important information about 
                  our services and limitations.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Questions?</h2>
            <p className="text-gray-600 mb-4">
              For questions about our marketplace guidelines or to report concerns, please contact our compliance team:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>Email: hello@equitymd.com</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}