import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Users, BookOpen, TrendingUp, HelpCircle, DollarSign } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Related Links Component
 * Displays internal links to related content for SEO and user engagement
 */

interface RelatedLink {
  title: string;
  description: string;
  url: string;
  icon?: React.ReactNode;
}

interface RelatedLinksProps {
  title?: string;
  links: RelatedLink[];
  className?: string;
}

export function RelatedLinks({ title = "Related Content", links, className = "" }: RelatedLinksProps) {
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === 'dim' || resolvedTheme === 'dark';

  return (
    <div className={`${className}`}>
      <h3 className={`text-lg font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <div className="grid gap-3">
        {links.map((link, index) => (
          <Link
            key={index}
            to={link.url}
            className={`group flex items-start gap-3 p-4 rounded-lg transition-all ${
              isDarkTheme 
                ? 'bg-[var(--card-bg)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)]' 
                : 'bg-white hover:bg-gray-50 border border-gray-100 shadow-sm'
            }`}
          >
            {link.icon && (
              <div className={`flex-shrink-0 p-2 rounded-lg ${isDarkTheme ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                {link.icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium group-hover:text-blue-600 transition-colors ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                {link.title}
              </h4>
              <p className={`text-sm mt-1 line-clamp-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                {link.description}
              </p>
            </div>
            <ArrowRight className={`flex-shrink-0 h-5 w-5 mt-1 transition-transform group-hover:translate-x-1 ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`} />
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Quick Links Footer - Shows key pages for internal linking
 */
interface QuickLinksProps {
  className?: string;
  exclude?: string[]; // URLs to exclude
}

export function QuickLinksFooter({ className = "", exclude = [] }: QuickLinksProps) {
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === 'dim' || resolvedTheme === 'dark';

  const quickLinks = [
    {
      title: "Browse Deals",
      description: "Explore real estate investment opportunities",
      url: "/find",
      icon: <Building2 className="h-5 w-5 text-blue-600" />
    },
    {
      title: "Syndicator Directory",
      description: "Find verified real estate syndicators",
      url: "/directory",
      icon: <Users className="h-5 w-5 text-purple-600" />
    },
    {
      title: "How It Works",
      description: "Learn about real estate syndication",
      url: "/how-it-works",
      icon: <HelpCircle className="h-5 w-5 text-green-600" />
    },
    {
      title: "Investment Blog",
      description: "Educational articles and market insights",
      url: "/blog",
      icon: <BookOpen className="h-5 w-5 text-orange-600" />
    },
    {
      title: "Pricing",
      description: "Plans for syndicators to list deals",
      url: "/pricing",
      icon: <DollarSign className="h-5 w-5 text-emerald-600" />
    }
  ].filter(link => !exclude.includes(link.url));

  return (
    <div className={`py-12 ${isDarkTheme ? 'bg-[var(--bg-secondary)]' : 'bg-gray-50'} ${className}`}>
      <div className="max-w-6xl mx-auto px-4">
        <h3 className={`text-xl font-bold text-center mb-8 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
          Explore More on EquityMD
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.url}
              className={`group text-center p-6 rounded-xl transition-all hover:scale-105 ${
                isDarkTheme 
                  ? 'bg-[var(--card-bg)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)]' 
                  : 'bg-white hover:shadow-lg border border-gray-100'
              }`}
            >
              <div className="flex justify-center mb-3">
                <div className={`p-3 rounded-full ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  {link.icon}
                </div>
              </div>
              <h4 className={`font-semibold mb-1 group-hover:text-blue-600 transition-colors ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                {link.title}
              </h4>
              <p className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Call to Action Banner - for internal linking with CTAs
 */
interface CTABannerProps {
  variant: 'investor' | 'syndicator';
  className?: string;
}

export function CTABanner({ variant, className = "" }: CTABannerProps) {
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === 'dim' || resolvedTheme === 'dark';

  if (variant === 'investor') {
    return (
      <div className={`rounded-2xl overflow-hidden ${className}`}>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            Ready to Start Investing?
          </h3>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            Browse curated real estate syndication opportunities from verified sponsors. 
            Free for investors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/find"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              Browse Deals
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Learn How It Works
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-3">
          Are You a Syndicator?
        </h3>
        <p className="text-emerald-100 mb-6 max-w-xl mx-auto">
          List your deals on EquityMD and reach 7,400+ accredited investors. 
          Free until June 2026!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <DollarSign className="h-5 w-5 mr-2" />
            View Pricing
          </Link>
          <Link
            to="/contact?plan=premium"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Popular Searches - Shows popular search terms as links
 */
interface PopularSearchesProps {
  className?: string;
}

export function PopularSearches({ className = "" }: PopularSearchesProps) {
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === 'dim' || resolvedTheme === 'dark';

  const searches = [
    { term: "Multifamily investments", url: "/find?type=multifamily" },
    { term: "Industrial real estate", url: "/find?type=industrial" },
    { term: "Medical office buildings", url: "/find?type=medical" },
    { term: "Texas syndicators", url: "/directory?state=TX" },
    { term: "Value-add opportunities", url: "/find?strategy=value-add" },
    { term: "1031 exchange deals", url: "/find?type=1031" },
  ];

  return (
    <div className={className}>
      <h4 className={`text-sm font-semibold mb-3 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
        Popular Searches
      </h4>
      <div className="flex flex-wrap gap-2">
        {searches.map((search, index) => (
          <Link
            key={index}
            to={search.url}
            className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
              isDarkTheme 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {search.term}
          </Link>
        ))}
      </div>
    </div>
  );
}
