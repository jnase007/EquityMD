import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageBanner } from '../../components/PageBanner';
import { CheckCircle, AlertTriangle, FileText, DollarSign } from 'lucide-react';

export function Accreditation() {
  const requirements = [
    {
      title: "Income Requirement",
      description: "Individual income exceeding $200,000 (or $300,000 with spouse) in each of the past two years, with reasonable expectation of the same in current year.",
      icon: <DollarSign className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Net Worth Requirement",
      description: "Individual or joint net worth exceeding $1 million, excluding primary residence.",
      icon: <DollarSign className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Professional Certification",
      description: "Hold certain professional certifications, designations, or credentials in good standing.",
      icon: <FileText className="h-6 w-6 text-blue-600" />
    }
  ];

  const verificationSteps = [
    "Complete accreditation questionnaire",
    "Provide supporting documentation",
    "Third-party verification (if required)",
    "Annual re-certification"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <PageBanner 
        title="Accreditation Requirements"
        subtitle="Understanding investor accreditation and verification process"
      />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Requirements */}
          <h2 className="text-2xl font-bold mb-6">Accredited Investor Requirements</h2>
          <div className="space-y-6 mb-12">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  {req.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{req.title}</h3>
                  <p className="text-gray-600">{req.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Verification Process */}
          <h2 className="text-2xl font-bold mb-6">Verification Process</h2>
          <div className="space-y-4 mb-12">
            {verificationSteps.map((step, index) => (
              <div key={index} className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>{step}</span>
              </div>
            ))}
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-12">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1 mr-3" />
              <div>
                <h3 className="font-bold text-yellow-800 mb-2">Important Notice</h3>
                <p className="text-yellow-800">
                  Making false statements or providing incorrect information during the accreditation process may result in legal consequences and immediate termination of platform access.
                </p>
              </div>
            </div>
          </div>

          {/* Documentation */}
          <h2 className="text-2xl font-bold mb-6">Acceptable Documentation</h2>
          <div className="space-y-4 mb-12">
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-blue-600 mt-1 mr-3" />
              <div>
                <h3 className="font-bold mb-2">Income Verification</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Tax returns (past two years)</li>
                  <li>W-2 statements</li>
                  <li>Pay stubs</li>
                  <li>Employment verification letter</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start">
              <FileText className="h-5 w-5 text-blue-600 mt-1 mr-3" />
              <div>
                <h3 className="font-bold mb-2">Net Worth Verification</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Bank statements</li>
                  <li>Investment account statements</li>
                  <li>Real estate appraisals</li>
                  <li>Asset verification letter from licensed professional</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Need Assistance?</h2>
            <p className="text-gray-600 mb-4">
              Our team is available to help you with the accreditation process. Contact us for support:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>Email: hello@equitymd.com</li>
              <li>Phone: (888) 555-0123</li>
              <li>Hours: Monday - Friday, 9:00 AM - 5:00 PM EST</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}