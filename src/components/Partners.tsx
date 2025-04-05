import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface Partner {
  name: string;
  logo: string;
  description: string;
  features: string[];
  url: string;
}

interface PartnersProps {
  variant?: 'light' | 'dark';
  showFeatures?: boolean;
  showCTA?: boolean;
}

const partners: Partner[] = [
  {
    name: "AppFolio",
    logo: "https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/logos//appfolio_logo.png",
    description: "Seamlessly import and sync your property data from AppFolio. Streamline your workflow with automated data transfer.",
    url: "https://www.appfolio.com",
    features: [
      "One-click property import",
      "Automatic data synchronization",
      "Media and document transfer",
      "Financial data integration"
    ]
  },
  {
    name: "CashflowPortal",
    logo: "https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/logos//cashflow_logo.jpg",
    description: "Direct integration with CashflowPortal for seamless deal management and investor communications.",
    url: "https://www.cashflowportal.com",
    features: [
      "Direct deal import",
      "Investment terms sync",
      "Document synchronization",
      "Investor data integration"
    ]
  },
  {
    name: "Juniper Square",
    logo: "https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/logos//Juniper_Square.png",
    description: "Leverage Juniper Square's powerful investment management platform for enhanced investor relations and reporting.",
    url: "https://www.junipersquare.com",
    features: [
      "Automated investor reporting",
      "Distribution management",
      "Document sharing",
      "Investor communications"
    ]
  }
];

export function Partners({ variant = 'light', showFeatures = false, showCTA = false }: PartnersProps) {
  return (
    <div className={`py-16 ${variant === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold ${variant === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Integrated with Industry-Leading Platforms
          </h2>
          <p className={`mt-4 text-xl ${variant === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Import and manage your deals seamlessly with our trusted partners
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {partners.map((partner) => (
            <div 
              key={partner.name}
              className={`p-8 rounded-xl ${
                variant === 'dark' 
                  ? 'bg-gray-800 hover:bg-gray-700' 
                  : 'bg-white shadow-sm hover:shadow-md border border-gray-100'
              } transition duration-200`}
            >
              <div className="flex items-center justify-between mb-6">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-12 object-contain"
                />
                {showCTA && (
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm flex items-center ${
                      variant === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </a>
                )}
              </div>

              <p className={`mb-6 ${variant === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {partner.description}
              </p>
              
              {showFeatures && (
                <div className="space-y-3">
                  {partner.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className={`h-5 w-5 mr-2 ${
                        variant === 'dark' ? 'text-green-400' : 'text-green-500'
                      }`} />
                      <span className={variant === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {showCTA && (
          <div className="text-center mt-12">
            <p className={`text-lg mb-6 ${variant === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Ready to streamline your deal management?
            </p>
            <button className={`px-6 py-3 rounded-lg flex items-center mx-auto ${
              variant === 'dark'
                ? 'bg-white text-gray-900 hover:bg-gray-100'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } transition`}>
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}