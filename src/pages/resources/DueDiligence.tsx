import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { CheckCircle, AlertTriangle, FileText, Building2, Users, DollarSign, TrendingUp, Scale } from 'lucide-react';

export function DueDiligence() {
  const sections = [
    {
      title: "Property Analysis",
      icon: <Building2 className="h-8 w-8 text-blue-600" />,
      items: [
        "Location and market analysis",
        "Physical property condition",
        "Historical performance",
        "Environmental assessments",
        "Zoning and permits"
      ]
    },
    {
      title: "Financial Review",
      icon: <DollarSign className="h-8 w-8 text-blue-600" />,
      items: [
        "Historical financials",
        "Pro forma assumptions",
        "Debt terms and structure",
        "Tax considerations",
        "Exit strategy"
      ]
    },
    {
      title: "Sponsor Evaluation",
      icon: <Users className="h-8 w-8 text-blue-600" />,
      items: [
        "Track record analysis",
        "Background checks",
        "Team experience",
        "References",
        "Legal standing"
      ]
    },
    {
      title: "Legal & Compliance",
      icon: <Scale className="h-8 w-8 text-blue-600" />,
      items: [
        "Operating agreement review",
        "SEC compliance",
        "Tax structure",
        "Insurance coverage",
        "Risk disclosures"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl font-bold mb-6">
            Real Estate Investment Due Diligence Guide
          </h1>
          <p className="text-xl text-blue-100">
            A comprehensive framework for evaluating real estate syndication opportunities
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                {section.icon}
                <h2 className="text-2xl font-bold ml-3">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">Red Flags to Watch For</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Unrealistic return projections",
              "Limited sponsor track record",
              "Inadequate risk disclosures",
              "Poor property condition",
              "Unclear exit strategy",
              "Excessive fees or promotes"
            ].map((flag, index) => (
              <div key={index} className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                <span>{flag}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 bg-blue-50 rounded-lg p-8">
          <div className="flex items-start">
            <FileText className="h-8 w-8 text-blue-600 mt-1 mr-4" />
            <div>
              <h3 className="text-xl font-bold mb-2">Download Our Complete Guide</h3>
              <p className="text-gray-600 mb-4">
                Get our comprehensive due diligence checklist and guide in PDF format.
              </p>
              <a 
                href="https://docs.google.com/document/d/1qJKIcjieUUuU--2m0janFH7o1BGhVpXl9kvw3U4XXxw/edit?tab=t.0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}