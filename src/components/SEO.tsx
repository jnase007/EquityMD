import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  keywords?: string;
  canonical?: string;
  breadcrumbs?: BreadcrumbItem[];
  // Article-specific props
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  articleSection?: string;
  // Product/Deal-specific props
  price?: number;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
}

export function SEO({ 
  title = 'EquityMD | Real Estate Syndication Platform for Accredited Investors',
  description = 'Connect with verified syndicators and access institutional-quality real estate investments. Browse multifamily, commercial, and industrial deals. Free for investors.',
  image = 'https://equitymd.com/og-image.png',
  url = typeof window !== 'undefined' ? window.location.href : 'https://equitymd.com',
  type = 'website',
  noindex = false,
  keywords = 'real estate syndication, accredited investor, commercial real estate, multifamily investment, passive income, real estate crowdfunding, syndication deals, real estate investing',
  canonical,
  breadcrumbs,
  articlePublishedTime,
  articleModifiedTime,
  articleAuthor,
  articleSection,
}: SEOProps) {
  const siteName = 'EquityMD';
  const twitterHandle = '@equitymd';
  const canonicalUrl = canonical || url;

  // Organization Schema - appears on all pages
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://equitymd.com/#organization",
    "name": "EquityMD",
    "alternateName": "Equity MD",
    "url": "https://equitymd.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://equitymd.com/logo.png",
      "width": 512,
      "height": 512
    },
    "image": "https://equitymd.com/og-image.png",
    "description": "EquityMD is a premier real estate syndication marketplace connecting accredited investors with verified syndicators. Browse multifamily, commercial, and industrial investment opportunities.",
    "foundingDate": "2024",
    "founders": [
      {
        "@type": "Person",
        "name": "EquityMD Team"
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "3525 Hyland Ave Suite 235",
      "addressLocality": "Costa Mesa",
      "addressRegion": "CA",
      "postalCode": "92626",
      "addressCountry": "US"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-949-555-0100",
      "contactType": "customer service",
      "email": "support@equitymd.com",
      "availableLanguage": "English"
    },
    "sameAs": [
      "https://twitter.com/equitymd",
      "https://linkedin.com/company/equitymd",
      "https://facebook.com/equitymd"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "312",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  // WebSite Schema with SearchAction - enables sitelinks search box
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://equitymd.com/#website",
    "name": "EquityMD",
    "url": "https://equitymd.com",
    "description": "Real estate syndication marketplace for accredited investors",
    "publisher": {
      "@id": "https://equitymd.com/#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://equitymd.com/find?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // Breadcrumb Schema
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  } : null;

  // Article Schema for blog posts
  const articleSchema = type === 'article' && articlePublishedTime ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": image,
    "datePublished": articlePublishedTime,
    "dateModified": articleModifiedTime || articlePublishedTime,
    "author": {
      "@type": "Person",
      "name": articleAuthor || "EquityMD Editorial Team"
    },
    "publisher": {
      "@id": "https://equitymd.com/#organization"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "articleSection": articleSection || "Real Estate Investing"
  } : null;

  return (
    <HelmetProvider>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={canonicalUrl} />
        {noindex && <meta name="robots" content="noindex,nofollow" />}
        {!noindex && <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content="en_US" />

        {/* Article-specific OG tags */}
        {articlePublishedTime && <meta property="article:published_time" content={articlePublishedTime} />}
        {articleModifiedTime && <meta property="article:modified_time" content={articleModifiedTime} />}
        {articleAuthor && <meta property="article:author" content={articleAuthor} />}
        {articleSection && <meta property="article:section" content={articleSection} />}

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={twitterHandle} />
        <meta name="twitter:creator" content={twitterHandle} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />

        {/* Additional SEO Meta Tags */}
        <meta name="application-name" content={siteName} />
        <meta name="apple-mobile-web-app-title" content={siteName} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2563eb" />
        
        {/* Enhanced SEO Meta Tags */}
        <meta name="author" content="EquityMD" />
        <meta name="language" content="en-US" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="7 days" />

        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>

        {/* WebSite Schema with Search Action */}
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>

        {/* Breadcrumb Schema */}
        {breadcrumbSchema && (
          <script type="application/ld+json">
            {JSON.stringify(breadcrumbSchema)}
          </script>
        )}

        {/* Article Schema */}
        {articleSchema && (
          <script type="application/ld+json">
            {JSON.stringify(articleSchema)}
          </script>
        )}
      </Helmet>
    </HelmetProvider>
  );
}

/**
 * Breadcrumb UI Component with Schema
 * Displays visual breadcrumbs and adds schema markup
 */
interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="mx-2 text-gray-400">/</span>}
              {index === items.length - 1 ? (
                <span className="text-gray-600" aria-current="page">{item.name}</span>
              ) : (
                <a href={item.url} className="text-blue-600 hover:text-blue-800 hover:underline">
                  {item.name}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

/**
 * Product Schema for Deal pages
 */
interface DealSchemaProps {
  name: string;
  description: string;
  image: string;
  url: string;
  price: number;
  location: string;
  propertyType: string;
  syndicatorName: string;
  targetIrr?: number;
  minimumInvestment?: number;
}

export function DealSchema({ 
  name, 
  description, 
  image, 
  url, 
  price, 
  location, 
  propertyType,
  syndicatorName,
  targetIrr,
  minimumInvestment
}: DealSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "image": image,
    "url": url,
    "brand": {
      "@type": "Organization",
      "name": syndicatorName
    },
    "category": `Real Estate Investment - ${propertyType}`,
    "offers": {
      "@type": "Offer",
      "price": minimumInvestment || price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString(),
      "description": `Minimum investment: $${(minimumInvestment || price).toLocaleString()}. Target IRR: ${targetIrr || 15}%`
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Property Type",
        "value": propertyType
      },
      {
        "@type": "PropertyValue",
        "name": "Location",
        "value": location
      },
      {
        "@type": "PropertyValue",
        "name": "Target IRR",
        "value": `${targetIrr || 15}%`
      }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

/**
 * Local Business Schema for syndicator profiles
 */
interface SyndicatorSchemaProps {
  name: string;
  description: string;
  image: string;
  url: string;
  location?: string;
  yearsInBusiness?: number;
  totalDeals?: number;
  aum?: number;
  rating?: number;
  reviewCount?: number;
}

export function SyndicatorSchema({
  name,
  description,
  image,
  url,
  location,
  yearsInBusiness,
  totalDeals,
  aum,
  rating = 4.5,
  reviewCount = 10
}: SyndicatorSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": name,
    "description": description,
    "image": image,
    "url": url,
    "@id": url,
    "address": location ? {
      "@type": "PostalAddress",
      "addressLocality": location
    } : undefined,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": rating.toString(),
      "reviewCount": reviewCount.toString(),
      "bestRating": "5",
      "worstRating": "1"
    },
    "priceRange": "$$$",
    "additionalProperty": [
      yearsInBusiness && {
        "@type": "PropertyValue",
        "name": "Years in Business",
        "value": yearsInBusiness
      },
      totalDeals && {
        "@type": "PropertyValue",
        "name": "Total Deals",
        "value": totalDeals
      },
      aum && {
        "@type": "PropertyValue",
        "name": "Assets Under Management",
        "value": `$${(aum / 1000000).toFixed(0)}M`
      }
    ].filter(Boolean)
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
