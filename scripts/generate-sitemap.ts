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
    { path: '/faq', priority: 0.6, changefreq: 'monthly' as const },
    { path: '/terms', priority: 0.3, changefreq: 'yearly' as const },
    { path: '/privacy', priority: 0.3, changefreq: 'yearly' as const },
    { path: '/login', priority: 0.5, changefreq: 'monthly' as const },
    { path: '/signup', priority: 0.6, changefreq: 'monthly' as const },
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

  // Syndicators (verified and premier only)
  const { data: syndicators, error: syncError } = await supabase
    .from('syndicators')
    .select('slug, updated_at, created_at')
    .in('verification_status', ['verified', 'premier'])
    .order('created_at', { ascending: false });

  if (syncError) {
    console.error('Error fetching syndicators:', syncError);
  } else if (syndicators) {
    syndicators.forEach(syndicator => {
      if (syndicator.slug) {
        urls.push({
          loc: `${SITE_URL}/syndicators/${syndicator.slug}`,
          lastmod: formatDate(syndicator.updated_at || syndicator.created_at),
          changefreq: 'weekly',
          priority: 0.6,
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

