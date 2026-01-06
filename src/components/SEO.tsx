import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  keywords?: string;
  canonical?: string;
}

export function SEO({ 
  title = 'Equitymd.com | Top CRE Syndication for 7,400+ Investors',
  description = 'Skyrocket your CRE deals with 7,400+ elite investors! List for $149/month, start free. Join Equitymd.com\'s top platform now—no fees to browse deals!',
  image = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos//logo-black.png`,
  url = typeof window !== 'undefined' ? window.location.href : 'https://equitymd.com',
  type = 'website',
  noindex = false,
  keywords = 'CRE syndication platform, accredited investor deals, commercial real estate, real estate syndicators, multifamily investments, industrial real estate, medical office buildings, healthcare facilities',
  canonical
}: SEOProps) {
  const siteName = 'EquityMD';
  const twitterHandle = '@equitymd';
  const canonicalUrl = canonical || url;

  return (
    <HelmetProvider>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={canonicalUrl} />
        {noindex && <meta name="robots" content="noindex,nofollow" />}

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content={type} />
        <meta property="og:site_name" content={siteName} />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={twitterHandle} />
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

        {/* Structured Data for CRE Platform */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FinancialService",
            "name": "EquityMD",
            "alternateName": "EquityMD CRE Syndication Platform",
            "url": "https://equitymd.com",
            "logo": `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos//logo-black.png`,
            "sameAs": [
              "https://twitter.com/equitymd",
              "https://linkedin.com/company/equitymd"
            ],
            "description": "Premier CRE syndication platform connecting 7,400+ elite investors with verified syndicators. List deals from $149/month, browse free. Multifamily, industrial, and medical office investments.",
            "serviceType": "Commercial Real Estate Investment Platform",
            "areaServed": "US",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "CRE Investment Opportunities",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "CRE Syndication Listings",
                    "description": "List commercial real estate deals to reach 7,400+ accredited investors"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service", 
                    "name": "Investment Opportunities",
                    "description": "Access to vetted multifamily, industrial, and medical office investments"
                  }
                }
              ]
            },
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "3525 Hyland Ave Suite 235",
              "addressLocality": "Costa Mesa",
              "addressRegion": "CA",
              "postalCode": "92626",
              "addressCountry": "US"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "250",
              "bestRating": "5"
            }
          })}
        </script>

        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-4DYEHD25TP"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4DYEHD25TP', {
              page_title: '${title}',
              page_location: '${canonicalUrl}'
            });
          `}
        </script>
      </Helmet>
    </HelmetProvider>
  );
}