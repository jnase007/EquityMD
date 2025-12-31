import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { CheckCircle, AlertTriangle, FileText, Building2, Users, DollarSign, TrendingUp, Scale, Search, ArrowRight, Sparkles, Shield } from 'lucide-react';

export function DueDiligence() {
  const sections = [
    {
      title: "Property Analysis",
      icon: <Building2 className="h-8 w-8 text-blue-600" />,
      color: "from-blue-100 to-indigo-100",
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
      icon: <DollarSign className="h-8 w-8 text-emerald-600" />,
      color: "from-emerald-100 to-teal-100",
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
      icon: <Users className="h-8 w-8 text-purple-600" />,
      color: "from-purple-100 to-pink-100",
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
      icon: <Scale className="h-8 w-8 text-amber-600" />,
      color: "from-amber-100 to-orange-100",
      items: [
        "Operating agreement review",
        "SEC compliance",
        "Tax structure",
        "Insurance coverage",
        "Risk disclosures"
      ]
    }
  ];

  const redFlags = [
    "Unrealistic return projections",
    "Limited sponsor track record",
    "Inadequate risk disclosures",
    "Poor property condition",
    "Unclear exit strategy",
    "Excessive fees or promotes"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="max-w-6xl mx-auto px-4 py-20 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-6">
              <Search className="h-4 w-4" />
              Investment Research
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Due Diligence Guide
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              A comprehensive framework for evaluating real estate syndication opportunities
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition group">
              <div className="flex items-center mb-6">
                <div className={`w-14 h-14 bg-gradient-to-br ${section.color} rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Red Flags Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-12">
          <div className="flex items-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mr-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Red Flags to Watch For</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {redFlags.map((flag, index) => (
              <div key={index} className="flex items-start p-4 bg-red-50 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">{flag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Download CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center flex-shrink-0">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">Download Our Complete Guide</h3>
              <p className="text-blue-100">
                Get our comprehensive due diligence checklist and guide in PDF format.
              </p>
            </div>
            <a 
              href="https://docs.google.com/document/d/1qJKIcjieUUuU--2m0janFH7o1BGhVpXl9kvw3U4XXxw/edit?tab=t.0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Download PDF
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
