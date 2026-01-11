import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  icon?: React.ReactNode;
  highlighted?: boolean;
}

interface FAQSectionProps {
  title?: string;
  faqs: FAQItem[];
  className?: string;
}

/**
 * FAQ Section Component with built-in Schema.org markup for SEO
 * 
 * This component automatically generates FAQPage structured data
 * that Google can use for rich results and "People Also Ask" boxes.
 */
export function FAQSection({ title = "Frequently Asked Questions", faqs, className = "" }: FAQSectionProps) {
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === 'dim' || resolvedTheme === 'dark';

  // Generate FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      {/* FAQ Schema Markup for Google */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <div className={`${className}`}>
        <h2 className={`text-2xl font-bold text-center mb-10 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className={`group p-6 rounded-xl transition-all ${
                faq.highlighted
                  ? isDarkTheme 
                    ? 'bg-emerald-900/20 border border-emerald-700/50' 
                    : 'bg-emerald-50 border border-emerald-200'
                  : isDarkTheme 
                    ? 'bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-blue-500/50' 
                    : 'bg-white shadow-sm border border-gray-100 hover:border-blue-300'
              }`}
            >
              <summary className={`font-bold cursor-pointer list-none flex items-center justify-between gap-2 ${
                faq.highlighted
                  ? isDarkTheme ? 'text-emerald-300' : 'text-emerald-800'
                  : isDarkTheme ? 'text-white' : 'text-gray-900'
              }`}>
                <span className="flex items-center gap-2">
                  {faq.icon}
                  {faq.question}
                </span>
                <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
              </summary>
              <p className={`mt-4 ${
                faq.highlighted
                  ? isDarkTheme ? 'text-emerald-200/80' : 'text-emerald-700'
                  : isDarkTheme ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * Simple FAQ list without accordions - for inline display
 */
export function FAQList({ faqs, className = "" }: Omit<FAQSectionProps, 'title'>) {
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === 'dim' || resolvedTheme === 'dark';

  // Generate FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <div className={`space-y-6 ${className}`}>
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl ${
              faq.highlighted
                ? isDarkTheme 
                  ? 'bg-emerald-900/20 border border-emerald-700/50' 
                  : 'bg-emerald-50 border border-emerald-200'
                : isDarkTheme 
                  ? 'bg-[var(--card-bg)] border border-[var(--border-color)]' 
                  : 'bg-white shadow-sm border border-gray-100'
            }`}
          >
            <h3 className={`font-bold mb-2 flex items-center gap-2 ${
              faq.highlighted
                ? isDarkTheme ? 'text-emerald-300' : 'text-emerald-800'
                : isDarkTheme ? 'text-white' : 'text-gray-900'
            }`}>
              {faq.icon}
              {faq.question}
            </h3>
            <p className={`${
              faq.highlighted
                ? isDarkTheme ? 'text-emerald-200/80' : 'text-emerald-700'
                : isDarkTheme ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
