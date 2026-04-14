/**
 * Sitemap Generator for EquityMD
 * Generates sitemap.xml for Google Search Console
 * 
 * Usage:
 *   npx tsx scripts/generate-sitemap.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const SITE_URL = 'https://equitymd.com';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

async function generateSitemap() {
  console.log('🗺️  Generating sitemap for EquityMD...\n');
  
  const urls: SitemapUrl[] = [];
  const today = formatDate(new Date());

  // Static pages
  const staticPages = [
    { path: '/', priority: 1.0, changefreq: 'daily' as const },
    { path: '/find', priority: 0.9, changefreq: 'daily' as const },
    { path: '/directory', priority: 0.9, changefreq: 'daily' as const },
    { path: '/blog', priority: 0.8, changefreq: 'daily' as const },
    { path: '/how-it-works', priority: 0.7, changefreq: 'monthly' as const },
    { path: '/about', priority: 0.6, changefreq: 'monthly' as const },
    { path: '/contact', priority: 0.6, changefreq: 'monthly' as const },
    { path: '/pricing', priority: 0.7, changefreq: 'monthly' as const },
    { path: '/rankings', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/rankings/best-multifamily-syndicators', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/rankings/best-syndicators-for-beginners', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/rankings/highest-rated-syndicators', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/rankings/most-experienced-syndicators', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/rankings/top-syndicators-texas', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/rankings/top-syndicators-california', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/rankings/top-syndicators-florida', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/resources/glossary', priority: 0.7, changefreq: 'monthly' as const },
    { path: '/resources/due-diligence', priority: 0.7, changefreq: 'monthly' as const },
    { path: '/success-stories', priority: 0.7, changefreq: 'weekly' as const },
    { path: '/new-pricing', priority: 0.7, changefreq: 'monthly' as const },
    { path: '/success-stories', priority: 0.7, changefreq: 'weekly' as const },
  ];

  staticPages.forEach(page => {
    urls.push({
      loc: `${SITE_URL}${page.path}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
    });
  });

  console.log(`✅ Added ${staticPages.length} static pages`);

  // Blog posts
  const { data: blogPosts, error: blogError } = await supabase
    .from('blog_posts')
    .select('slug, updated_at, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (blogError) {
    console.error('Error fetching blog posts:', blogError);
  } else if (blogPosts) {
    blogPosts.forEach(post => {
      urls.push({
        loc: `${SITE_URL}/blog/${post.slug}`,
        lastmod: formatDate(post.updated_at || post.published_at),
        changefreq: 'weekly',
        priority: 0.7,
      });
    });
    console.log(`✅ Added ${blogPosts.length} blog posts`);
  }

  // ALL syndicators with a slug (directory is public, every page should be indexed)
  const { data: syndicators, error: syncError } = await supabase
    .from('syndicators')
    .select('slug, updated_at, created_at, verification_status')
    .not('slug', 'is', null)
    .order('created_at', { ascending: false });

  if (syncError) {
    console.error('Error fetching syndicators:', syncError);
  } else if (syndicators) {
    syndicators.forEach(syndicator => {
      if (syndicator.slug) {
        // Verified/premier get higher priority
        const isVerified = ['verified', 'premier'].includes(syndicator.verification_status);
        urls.push({
          loc: `${SITE_URL}/syndicators/${syndicator.slug}`,
          lastmod: formatDate(syndicator.updated_at || syndicator.created_at),
          changefreq: 'weekly',
          priority: isVerified ? 0.7 : 0.5,
        });
      }
    });
    console.log(`✅ Added ${syndicators.length} syndicator profiles`);
  }

  // Active deals
  const { data: deals, error: dealsError } = await supabase
    .from('deals')
    .select('slug, updated_at, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (dealsError) {
    console.error('Error fetching deals:', dealsError);
  } else if (deals) {
    deals.forEach(deal => {
      if (deal.slug) {
        urls.push({
          loc: `${SITE_URL}/deals/${deal.slug}`,
          lastmod: formatDate(deal.updated_at || deal.created_at),
          changefreq: 'daily',
          priority: 0.8,
        });
      }
    });
    console.log(`✅ Added ${deals.length} active deals`);
  }

  // Market report pages (state-level)
  const states = [
    'alabama','alaska','arizona','arkansas','california','colorado','connecticut','delaware','florida','georgia',
    'hawaii','idaho','illinois','indiana','iowa','kansas','kentucky','louisiana','maine','maryland',
    'massachusetts','michigan','minnesota','mississippi','missouri','montana','nebraska','nevada','new-hampshire','new-jersey',
    'new-mexico','new-york','north-carolina','north-dakota','ohio','oklahoma','oregon','pennsylvania','rhode-island','south-carolina',
    'south-dakota','tennessee','texas','utah','vermont','virginia','washington','west-virginia','wisconsin','wyoming'
  ];
  states.forEach(state => {
    urls.push({
      loc: `${SITE_URL}/resources/market-reports/${state}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.6,
    });
  });
  console.log(`✅ Added ${states.length} state market report pages`);

  // City pages — pull unique cities from syndicators and deals
  const citySet = new Set<string>();
  if (syndicators) {
    // Fetch city data separately
    const { data: syncCities } = await supabase
      .from('syndicators')
      .select('city, state')
      .not('city', 'is', null);
    syncCities?.forEach(s => {
      if (s.city && s.state) {
        const slug = `${s.city}-${s.state}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        citySet.add(slug);
      }
    });
  }
  citySet.forEach(citySlug => {
    urls.push({
      loc: `${SITE_URL}/cities/${citySlug}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.5,
    });
  });
  console.log(`✅ Added ${citySet.size} city pages`);

  // Resource pages
  const resourcePages = [
    { path: '/resources/market-reports', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/resources/education', priority: 0.7, changefreq: 'monthly' as const },
    { path: '/resources/calculator', priority: 0.7, changefreq: 'monthly' as const },
    { path: '/market-map', priority: 0.7, changefreq: 'weekly' as const },
    { path: '/compare', priority: 0.6, changefreq: 'weekly' as const },
  ];
  resourcePages.forEach(page => {
    urls.push({
      loc: `${SITE_URL}${page.path}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
    });
  });
  console.log(`✅ Added ${resourcePages.length} resource pages`);

  // Legal pages (with proper paths)
  const legalPages = [
    '/legal/privacy', '/legal/terms', '/legal/disclaimer',
    '/legal/accreditation', '/legal/compliance'
  ];
  legalPages.forEach(p => {
    urls.push({
      loc: `${SITE_URL}${p}`,
      lastmod: today,
      changefreq: 'yearly',
      priority: 0.3,
    });
  });
  console.log(`✅ Added ${legalPages.length} legal pages`);

  // Generate XML
  const sitemapXml = generateSitemapXml(urls);
  
  // Write to public folder
  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemapXml, 'utf-8');
  
  console.log(`\n✅ Sitemap generated with ${urls.length} URLs`);
  console.log(`📁 Saved to: ${outputPath}`);
  console.log(`\n🔗 Submit to Google Search Console: ${SITE_URL}/sitemap.xml`);
}

generateSitemap();

