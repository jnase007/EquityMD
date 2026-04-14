/**
 * Inject internal links into blog posts that have zero internal links.
 * This dramatically improves SEO by passing link equity from blog content
 * to money pages (deals, directory, how-it-works).
 * 
 * Usage: npx tsx scripts/inject-blog-links.ts
 * 
 * Safe: only modifies posts with 0 internal links. Adds a contextual
 * "Related Resources" section at the end of each post.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials required (need service key for writes)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SITE_URL = 'https://equitymd.com';

// Category → relevant internal links mapping
const categoryLinks: Record<string, { text: string; url: string; desc: string }[]> = {
  'Investment Strategy': [
    { text: 'Browse Active Syndication Deals', url: `${SITE_URL}/find`, desc: 'Explore current investment opportunities from verified syndicators' },
    { text: 'Compare Top Syndicators', url: `${SITE_URL}/directory`, desc: 'Browse 400+ verified real estate sponsors with track records' },
    { text: 'How Real Estate Syndication Works', url: `${SITE_URL}/how-it-works`, desc: 'Step-by-step guide for passive real estate investing' },
    { text: 'Returns Calculator', url: `${SITE_URL}/resources/calculator`, desc: 'Model your potential syndication returns' },
  ],
  'Tax Strategy': [
    { text: 'Browse Syndication Deals', url: `${SITE_URL}/find`, desc: 'Find deals with depreciation benefits and tax advantages' },
    { text: 'Investor Education Center', url: `${SITE_URL}/resources/education`, desc: 'Learn more about tax-efficient real estate investing' },
    { text: 'Syndication Glossary', url: `${SITE_URL}/resources/glossary`, desc: 'Understand K-1s, depreciation, cost segregation, and more' },
    { text: 'How Syndication Works', url: `${SITE_URL}/how-it-works`, desc: 'Understand the syndication structure and tax pass-through' },
  ],
  'Financing': [
    { text: 'Browse Current Deals', url: `${SITE_URL}/find`, desc: 'See financing structures across active syndication offerings' },
    { text: 'Due Diligence Guide', url: `${SITE_URL}/resources/due-diligence`, desc: 'Learn what to look for in deal financing terms' },
    { text: 'Syndicator Directory', url: `${SITE_URL}/directory`, desc: 'Find syndicators with strong lending relationships' },
    { text: 'Investment Calculator', url: `${SITE_URL}/resources/calculator`, desc: 'Model returns under different financing scenarios' },
  ],
  'Market Insights': [
    { text: 'Market Reports by State', url: `${SITE_URL}/resources/market-reports`, desc: 'Detailed market data for all 50 states' },
    { text: 'Interactive Market Map', url: `${SITE_URL}/market-map`, desc: 'Visualize syndication opportunities across the US' },
    { text: 'Browse Deals by Location', url: `${SITE_URL}/find`, desc: 'Filter deals by market and property type' },
    { text: 'Top Syndicators by State', url: `${SITE_URL}/rankings`, desc: 'Find the highest-rated sponsors in each market' },
  ],
  'Due Diligence': [
    { text: 'Due Diligence Checklist', url: `${SITE_URL}/resources/due-diligence`, desc: 'Comprehensive guide to evaluating syndication deals' },
    { text: 'Verified Syndicator Directory', url: `${SITE_URL}/directory`, desc: 'Browse background-checked sponsors with reviews' },
    { text: 'Browse Active Deals', url: `${SITE_URL}/find`, desc: 'Practice your due diligence on real opportunities' },
    { text: 'Syndication Glossary', url: `${SITE_URL}/resources/glossary`, desc: 'Understand PPMs, waterfalls, and key terms' },
  ],
  'Investor Education': [
    { text: 'How Syndication Works', url: `${SITE_URL}/how-it-works`, desc: 'Complete beginner guide to real estate syndication' },
    { text: 'Browse Deals', url: `${SITE_URL}/find`, desc: 'See real syndication opportunities with full details' },
    { text: 'Syndicator Directory', url: `${SITE_URL}/directory`, desc: 'Find and compare verified real estate sponsors' },
    { text: 'Education Center', url: `${SITE_URL}/resources/education`, desc: 'More courses and guides for new investors' },
  ],
};

// Default links for any uncategorized post
const defaultLinks = [
  { text: 'Browse Syndication Deals', url: `${SITE_URL}/find`, desc: 'Explore current investment opportunities' },
  { text: 'Syndicator Directory', url: `${SITE_URL}/directory`, desc: 'Compare 400+ verified real estate sponsors' },
  { text: 'How Syndication Works', url: `${SITE_URL}/how-it-works`, desc: 'Step-by-step guide for investors' },
  { text: 'Investing Blog', url: `${SITE_URL}/blog`, desc: 'More articles on real estate investing' },
];

function buildLinksSection(category: string): string {
  const links = categoryLinks[category] || defaultLinks;
  
  let html = `\n\n<div class="related-resources" style="margin-top: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: 12px; border-left: 4px solid #3b82f6;">`;
  html += `\n<h3 style="margin-top: 0; color: #1e293b;">📚 Related Resources on EquityMD</h3>`;
  html += `\n<ul style="list-style: none; padding: 0;">`;
  
  for (const link of links) {
    html += `\n<li style="margin-bottom: 0.75rem;"><a href="${link.url}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${link.text}</a> — ${link.desc}</li>`;
  }
  
  html += `\n</ul>`;
  html += `\n<p style="margin-bottom: 0; font-size: 0.9rem; color: #64748b;"><a href="${SITE_URL}" style="color: #2563eb;">EquityMD</a> connects accredited investors with verified real estate syndicators. <a href="${SITE_URL}/find" style="color: #2563eb;">Start browsing deals →</a></p>`;
  html += `\n</div>`;
  
  return html;
}

async function injectLinks() {
  console.log('🔗 Injecting internal links into blog posts...\n');
  
  // Fetch all published posts
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, category, content')
    .eq('is_published', true);
  
  if (error) {
    console.error('❌ Error fetching posts:', error);
    process.exit(1);
  }
  
  if (!posts) {
    console.log('No posts found.');
    return;
  }
  
  let updated = 0;
  let skipped = 0;
  
  for (const post of posts) {
    const content = post.content || '';
    
    // Skip if already has internal links or our injected section
    if (content.includes('equitymd.com/') || content.includes('related-resources')) {
      skipped++;
      continue;
    }
    
    const linksSection = buildLinksSection(post.category || 'default');
    const newContent = content + linksSection;
    
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ content: newContent })
      .eq('id', post.id);
    
    if (updateError) {
      console.error(`❌ Failed to update "${post.title}":`, updateError.message);
    } else {
      updated++;
      console.log(`✅ ${post.title} (${post.category})`);
    }
  }
  
  console.log(`\n📊 Results: ${updated} posts updated, ${skipped} already had links`);
  console.log(`📈 ${updated * 4} new internal links added to your blog content`);
}

injectLinks();
