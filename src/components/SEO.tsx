import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
}

export function SEO({ 
  title = 'EquityMD - Real Estate Investment Platform',
  description = 'Connect with accredited investors and real estate syndicators. Access institutional-quality real estate investments and grow your portfolio.',
  image = 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/logos//logo-black.png',
  url = typeof window !== 'undefined' ? window.location.href : 'https://equitymd.com',
  type = 'website',
  noindex = false
}: SEOProps) {
  const siteName = 'EquityMD';
  const twitterHandle = '@equitymd';

  return (
    <HelmetProvider>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        {noindex && <meta name="robots" content="noindex,nofollow" />}

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={url} />
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

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "EquityMD",
            "url": "https://equitymd.com",
            "logo": "https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/logos//logo-black.png",
            "sameAs": [
              "https://twitter.com/equitymd",
              "https://linkedin.com/company/equitymd"
            ],
            "description": "EquityMD connects medical professionals with institutional-quality real estate investment opportunities through a curated platform of verified syndicators.",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "US"
            }
          })}
        </script>
      </Helmet>
    </HelmetProvider>
  );
}