/**
 * Automated Multifamily Blog Generator
 * Writes directly to Supabase - designed for cron/scheduled execution
 * 
 * SEO + GEO optimized | Evergreen content (no dates in titles)
 * 
 * Usage:
 *   npx tsx scripts/generate-blog.ts                      # Generate one blog (draft)
 *   npx tsx scripts/generate-blog.ts --publish            # Generate and publish
 *   npx tsx scripts/generate-blog.ts --count 5            # Generate 5 blogs
 *   npx tsx scripts/generate-blog.ts --ai-images          # Use AI-generated images (xAI Grok)
 *   npx tsx scripts/generate-blog.ts --openai-images      # Use OpenAI DALL-E 3 for images (better quality)
 *   npx tsx scripts/generate-blog.ts --count 5 --publish --openai-images  # All options with OpenAI
 * 
 * Environment variables:
 *   XAI_API_KEY          - Required for blog content generation (Grok)
 *   OPENAI_API_KEY       - Optional for DALL-E 3 image generation
 *   SUPABASE_URL         - Supabase project URL
 *   SUPABASE_SERVICE_KEY - Supabase service role key
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const XAI_API_KEY = process.env.XAI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const XAI_IMAGE_URL = 'https://api.x.ai/v1/images/generations';
const OPENAI_IMAGE_URL = 'https://api.openai.com/v1/images/generations';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!XAI_API_KEY) {
  console.error('❌ XAI_API_KEY is required');
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// EVERGREEN TOPIC LIBRARY - No years, timeless
// ============================================
const EVERGREEN_TOPICS = [
  // Getting Started (Investor Education)
  { category: 'Investor Education', topic: 'Complete guide to passive apartment investing for beginners', targetKeyword: 'passive real estate investing' },
  { category: 'Investor Education', topic: 'Accredited investor requirements and verification process explained', targetKeyword: 'accredited investor requirements' },
  { category: 'Investor Education', topic: 'Real estate syndication vs REITs: complete comparison guide', targetKeyword: 'syndication vs REIT' },
  { category: 'Investor Education', topic: 'How apartment syndication works step by step', targetKeyword: 'how syndication works' },
  { category: 'Investor Education', topic: 'Benefits of passive multifamily investing for busy professionals', targetKeyword: 'passive multifamily investing' },
  
  // Deal Analysis
  { category: 'Deal Analysis', topic: 'How to calculate cash-on-cash return for rental properties', targetKeyword: 'cash on cash return' },
  { category: 'Deal Analysis', topic: 'Understanding IRR in real estate syndications', targetKeyword: 'IRR real estate' },
  { category: 'Deal Analysis', topic: 'Complete guide to evaluating multifamily investment deals', targetKeyword: 'evaluate multifamily deals' },
  { category: 'Deal Analysis', topic: 'How to analyze apartment cap rates by market', targetKeyword: 'apartment cap rates' },
  { category: 'Deal Analysis', topic: 'Understanding equity multiples in syndication investments', targetKeyword: 'equity multiple real estate' },
  { category: 'Deal Analysis', topic: 'NOI calculation guide for apartment investors', targetKeyword: 'NOI calculation' },
  { category: 'Deal Analysis', topic: 'How to read and analyze a syndication proforma', targetKeyword: 'syndication proforma' },
  
  // Syndication Structure
  { category: 'Syndication', topic: 'What is preferred return and how does it protect investors', targetKeyword: 'preferred return' },
  { category: 'Syndication', topic: 'Syndication waterfall structure explained for passive investors', targetKeyword: 'waterfall structure' },
  { category: 'Syndication', topic: 'GP vs LP roles and responsibilities in real estate deals', targetKeyword: 'GP vs LP' },
  { category: 'Syndication', topic: 'Understanding syndication fee structures and what to expect', targetKeyword: 'syndication fees' },
  { category: 'Syndication', topic: 'Capital calls in real estate syndications explained', targetKeyword: 'capital call' },
  { category: 'Syndication', topic: 'How syndication distributions work and when to expect them', targetKeyword: 'syndication distributions' },
  
  // Due Diligence
  { category: 'Due Diligence', topic: 'Red flags to avoid when investing in real estate syndications', targetKeyword: 'syndication red flags' },
  { category: 'Due Diligence', topic: 'How to evaluate a syndicator track record before investing', targetKeyword: 'evaluate syndicator' },
  { category: 'Due Diligence', topic: 'Essential questions to ask before investing in any syndication', targetKeyword: 'syndication questions' },
  { category: 'Due Diligence', topic: 'Understanding the PPM: what investors need to know', targetKeyword: 'PPM real estate' },
  { category: 'Due Diligence', topic: 'Market due diligence checklist for apartment investments', targetKeyword: 'market due diligence' },
  { category: 'Due Diligence', topic: 'How to verify syndicator claims and deal projections', targetKeyword: 'verify syndicator' },
  
  // Tax Strategy
  { category: 'Tax Strategy', topic: 'Tax benefits of real estate syndication investments', targetKeyword: 'syndication tax benefits' },
  { category: 'Tax Strategy', topic: 'Understanding K-1 forms for syndication investors', targetKeyword: 'K-1 real estate' },
  { category: 'Tax Strategy', topic: 'How cost segregation benefits passive real estate investors', targetKeyword: 'cost segregation' },
  { category: 'Tax Strategy', topic: 'Depreciation benefits in multifamily investments explained', targetKeyword: 'depreciation real estate' },
  { category: 'Tax Strategy', topic: '1031 exchange strategies for syndication investors', targetKeyword: '1031 exchange' },
  { category: 'Tax Strategy', topic: 'Qualified opportunity zone investing in multifamily', targetKeyword: 'opportunity zone' },
  
  // Market Strategy
  { category: 'Market Insights', topic: 'How to identify the best multifamily markets for investing', targetKeyword: 'best multifamily markets' },
  { category: 'Market Insights', topic: 'Sunbelt vs coastal markets for apartment investing', targetKeyword: 'sunbelt investing' },
  { category: 'Market Insights', topic: 'How interest rates affect multifamily valuations', targetKeyword: 'interest rates multifamily' },
  { category: 'Market Insights', topic: 'Understanding apartment supply and demand dynamics', targetKeyword: 'apartment supply demand' },
  { category: 'Market Insights', topic: 'Key economic indicators for multifamily investors', targetKeyword: 'economic indicators real estate' },
  
  // Investment Strategy
  { category: 'Investment Strategy', topic: 'Value-add vs core multifamily investment strategies', targetKeyword: 'value-add multifamily' },
  { category: 'Investment Strategy', topic: 'How to build a diversified real estate portfolio', targetKeyword: 'diversified real estate' },
  { category: 'Investment Strategy', topic: 'Class A vs B vs C apartment investments compared', targetKeyword: 'class A B C apartments' },
  { category: 'Investment Strategy', topic: 'Ground-up development vs stabilized acquisitions', targetKeyword: 'real estate development' },
  { category: 'Investment Strategy', topic: 'Investment allocation strategies for real estate syndications', targetKeyword: 'real estate allocation' },
  { category: 'Investment Strategy', topic: 'How much to invest in your first syndication deal', targetKeyword: 'syndication minimum investment' },
  
  // Financing
  { category: 'Financing', topic: 'Agency debt vs bridge loans in multifamily acquisitions', targetKeyword: 'agency debt' },
  { category: 'Financing', topic: 'How DSCR affects multifamily loan eligibility', targetKeyword: 'DSCR multifamily' },
  { category: 'Financing', topic: 'Understanding interest rate caps in apartment loans', targetKeyword: 'interest rate cap' },
  { category: 'Financing', topic: 'Loan-to-value ratios in multifamily financing explained', targetKeyword: 'LTV multifamily' },
  { category: 'Financing', topic: 'How refinancing works in syndication deals', targetKeyword: 'refinancing syndication' },
  
  // Property Management
  { category: 'Property Management', topic: 'Third-party vs in-house property management comparison', targetKeyword: 'property management' },
  { category: 'Property Management', topic: 'Key metrics for evaluating apartment property managers', targetKeyword: 'property manager metrics' },
  { category: 'Property Management', topic: 'How value-add renovations increase apartment NOI', targetKeyword: 'value-add renovations' },
  { category: 'Property Management', topic: 'Tenant retention strategies for apartment owners', targetKeyword: 'tenant retention' },
  
  // Exit Strategies
  { category: 'Exit Strategy', topic: 'Common exit strategies in apartment syndications', targetKeyword: 'syndication exit' },
  { category: 'Exit Strategy', topic: 'What happens when a syndication deal is sold', targetKeyword: 'syndication sale' },
  { category: 'Exit Strategy', topic: 'Understanding hold period extensions in syndications', targetKeyword: 'hold period' },
  { category: 'Exit Strategy', topic: 'Refinance vs sale: comparing syndication exit options', targetKeyword: 'refinance vs sale' },
];

const STOCK_IMAGES: Record<string, string[]> = {
  'Deal Analysis': [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200&h=630',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200&h=630',
  ],
  'Market Insights': [
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1200&h=630',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200&h=630',
  ],
  'Syndication': [
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200&h=630',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=1200&h=630',
  ],
  'Due Diligence': [
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200&h=630',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200&h=630',
  ],
  'Investment Strategy': [
    'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&q=80&w=1200&h=630',
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=1200&h=630',
  ],
  'Tax Strategy': [
    'https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&q=80&w=1200&h=630',
    'https://images.unsplash.com/photo-1586486855514-8c633cc6b86c?auto=format&fit=crop&q=80&w=1200&h=630',
  ],
  'Financing': [
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1200&h=630',
    'https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&q=80&w=1200&h=630',
  ],
  'Property Management': [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200&h=630',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1200&h=630',
  ],
  'Investor Education': [
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200&h=630',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200&h=630',
  ],
  'Exit Strategy': [
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200&h=630',
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=1200&h=630',
  ],
};

function getRandomImage(category: string): string {
  const images = STOCK_IMAGES[category] || STOCK_IMAGES['Market Insights'];
  return images[Math.floor(Math.random() * images.length)];
}

// US cities to reference for realistic imagery
const US_CITIES = [
  'Austin, Texas', 'Phoenix, Arizona', 'Nashville, Tennessee', 'Charlotte, North Carolina',
  'Denver, Colorado', 'Atlanta, Georgia', 'Dallas, Texas', 'Tampa, Florida',
  'Raleigh, North Carolina', 'Salt Lake City, Utah', 'Seattle, Washington', 'Miami, Florida',
  'San Diego, California', 'Orlando, Florida', 'Las Vegas, Nevada', 'Houston, Texas',
];

function getRandomCity(): string {
  return US_CITIES[Math.floor(Math.random() * US_CITIES.length)];
}

// Category-specific image styles for variety - realistic, editorial photography style
const IMAGE_STYLES: Record<string, string[]> = {
  'Investor Education': [
    'Editorial photograph of a confident business professional in a tailored suit reviewing property documents in a high-rise office, downtown {city} visible through windows, natural daylight, Canon EOS R5 photography style',
    'Documentary-style photo of a diverse group of investors in business casual attire having a meeting in a modern conference room, genuine expressions, warm office lighting',
    'Real estate agent showing apartment floor plans to a young professional couple, authentic moment, natural lighting, lifestyle photography',
    'Business professional working on laptop at a coffee shop with real estate listings visible on screen, candid street photography style in {city}',
  ],
  'Deal Analysis': [
    'Authentic aerial photograph of a real apartment complex in {city} suburbs, swimming pool, parking lot with cars, genuine real estate listing style',
    'Business analyst pointing at financial charts on a whiteboard during a team meeting, documentary office photography, natural expressions',
    'Real photograph of an investor touring an apartment property with a property manager, clipboard in hand, authentic inspection moment',
    'Overhead flat lay of actual property documents, calculator, laptop showing spreadsheets, coffee cup, realistic desk scene',
  ],
  'Syndication': [
    'Genuine photograph of two business professionals shaking hands in front of an apartment building in {city}, deal closing moment, editorial style',
    'Documentary photo of a real estate investment meeting with diverse professionals around a table with laptops and documents',
    'Authentic photograph of a business presentation in a modern office, speaker at podium with audience of investors',
    'Real photograph of professionals signing documents at a closing table, fountain pens, genuine business moment',
  ],
  'Due Diligence': [
    'Authentic photograph of a building inspector with hard hat and clipboard examining an apartment exterior in {city}',
    'Documentary-style photo of a professional reviewing property documents with magnifying glass, genuine research moment',
    'Real photograph of an engineer inspecting HVAC systems on an apartment rooftop, professional equipment visible',
    'Candid photo of investors walking through an apartment complex courtyard during a property tour, genuine expressions',
  ],
  'Tax Strategy': [
    'Authentic photograph of a CPA meeting with clients in a professional accounting office, tax documents on desk',
    'Real photograph of a business professional working with tax forms and calculator at a home office desk',
    'Documentary-style photo of a tax planning meeting with accountant explaining documents to investors',
    'Genuine photograph of organized tax documents and financial statements on a professional desk with laptop',
  ],
  'Market Insights': [
    'Stunning real photograph of the {city} downtown skyline at golden hour, apartment towers prominent, editorial cityscape',
    'Authentic aerial photograph of a growing suburban neighborhood in {city} with new apartment construction',
    'Real street-level photograph of a thriving mixed-use development in {city}, people walking, urban vitality',
    'Documentary photograph of a busy downtown {city} street with apartment buildings and urban life',
  ],
  'Investment Strategy': [
    'Authentic photograph of a financial advisor meeting with clients, discussing investment charts on a screen',
    'Real photograph of a business professional analyzing multiple property listings on a computer with dual monitors',
    'Documentary-style photo of an investment committee meeting in a boardroom, genuine discussion moment',
    'Candid photograph of a real estate investor reviewing property portfolios on a tablet in a modern office',
  ],
  'Financing': [
    'Authentic photograph of a bank meeting room with loan officer and clients discussing mortgage documents',
    'Real photograph of a commercial lending office with professionals reviewing financing terms',
    'Documentary-style photo of business professionals reviewing loan documents at a conference table',
    'Genuine photograph of keys and closing documents on a table at a real estate closing, authentic moment',
  ],
  'Property Management': [
    'Authentic photograph of a property manager greeting residents in a modern apartment lobby in {city}',
    'Real photograph of maintenance professionals performing repairs in an apartment unit, genuine work moment',
    'Documentary-style photo of a leasing office with agent showing apartment features to prospective tenants',
    'Genuine photograph of residents enjoying a well-maintained apartment pool area, community atmosphere',
  ],
  'Exit Strategy': [
    'Authentic photograph of a "SOLD" sign in front of a real apartment complex, celebration moment',
    'Documentary-style photo of business professionals celebrating a successful deal with handshakes in an office',
    'Real photograph of keys being exchanged at a property closing, genuine transaction moment',
    'Authentic photograph of investors reviewing successful returns on laptops, satisfied expressions',
  ],
};

function getImagePromptForCategory(title: string, category: string): string {
  const styles = IMAGE_STYLES[category] || IMAGE_STYLES['Market Insights'];
  let randomStyle = styles[Math.floor(Math.random() * styles.length)];
  
  // Replace {city} placeholder with a random US city
  randomStyle = randomStyle.replace(/\{city\}/g, getRandomCity());
  
  // CRITICAL: Emphatic instructions for photorealism and NO TEXT
  return `${randomStyle}

ABSOLUTELY CRITICAL REQUIREMENTS:
1. DO NOT include ANY text, words, letters, numbers, titles, captions, watermarks, logos, or writing of ANY kind in this image. The image must be completely text-free.
2. This MUST look like a real photograph from a professional stock photo agency like Getty Images or Shutterstock.
3. Use a high-end DSLR camera look: Canon 5D Mark IV or Sony A7R IV quality.
4. Natural lighting only - soft window light, golden hour sunlight, or professional studio lighting.
5. Real textures: actual fabric, real skin with natural imperfections, genuine materials.
6. Authentic depth of field with realistic bokeh.
7. Real people with natural expressions, not posed or artificial looking.

Photography style: Editorial real estate photography for Forbes, Bloomberg, or Wall Street Journal.
Quality: Award-winning architectural and lifestyle photography.
Mood: Professional, trustworthy, aspirational.

REMINDER: NO TEXT OR WRITING ANYWHERE IN THE IMAGE.`;
}

// Generate AI image using OpenAI's DALL-E 3
async function generateOpenAIImage(title: string, category: string): Promise<string | null> {
  if (!OPENAI_API_KEY) {
    console.log('   ⚠️ OPENAI_API_KEY not set, falling back to Grok');
    return null;
  }

  try {
    // Create a varied visual prompt based on category
    const imagePrompt = getImagePromptForCategory(title, category);

    console.log('   🖼️ Generating image with OpenAI DALL-E 3...');
    
    const response = await fetch(OPENAI_IMAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: imagePrompt,
        n: 1,
        size: '1792x1024', // Wide format for blog headers
        quality: 'standard',
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   ⚠️ OpenAI Image API error: ${response.status} - ${errorText.substring(0, 200)}`);
      return null;
    }

    const data = await response.json();
    const imageUrl = data?.data?.[0]?.url;
    
    if (!imageUrl) {
      console.log('   ⚠️ No image URL in OpenAI response');
      return null;
    }

    // Download and upload to Supabase for permanence (OpenAI URLs expire)
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.log('   ⚠️ Failed to download generated image');
      return null;
    }

    const imageBlob = await imageResponse.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const filePath = `blog-images/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: false,
      });
    
    if (uploadError) {
      console.log(`   ⚠️ Upload error: ${uploadError.message}`);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    console.log('   🎨 OpenAI DALL-E 3 image generated successfully');
    return publicUrl;

  } catch (error: any) {
    console.log(`   ⚠️ OpenAI image generation failed: ${error.message}`);
    return null;
  }
}

// Generate AI image using xAI's Grok image model
async function generateGrokImage(title: string, category: string): Promise<string | null> {
  try {
    // Use the same image prompt function for consistency
    const imagePrompt = getImagePromptForCategory(title, category);

    console.log('   🖼️ Generating image with xAI Grok...');

    const response = await fetch(XAI_IMAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-2-image',
        prompt: imagePrompt,
        n: 1,
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   ⚠️ Image API error: ${response.status} - ${errorText.substring(0, 100)}`);
      return null;
    }

    const data = await response.json();
    const imageUrl = data?.data?.[0]?.url;
    
    if (!imageUrl) {
      console.log('   ⚠️ No image URL in response');
      return null;
    }

    // Download the image and upload to Supabase storage for permanence
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.log('   ⚠️ Failed to download generated image');
      return null;
    }

    const imageBlob = await imageResponse.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const filePath = `blog-images/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: false,
      });
    
    if (uploadError) {
      console.log(`   ⚠️ Upload error: ${uploadError.message}`);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    console.log('   🎨 Grok AI image generated');
    return publicUrl;

  } catch (error: any) {
    console.log(`   ⚠️ Image generation failed: ${error.message}`);
    return null;
  }
}

// Unified image generation with provider selection
async function generateAIImage(title: string, category: string, useOpenAI: boolean = false): Promise<string | null> {
  if (useOpenAI) {
    // Try OpenAI first, fall back to Grok if it fails
    const openAIImage = await generateOpenAIImage(title, category);
    if (openAIImage) return openAIImage;
    console.log('   ↪️ Falling back to Grok for image generation...');
    return generateGrokImage(title, category);
  } else {
    return generateGrokImage(title, category);
  }
}

function generateSlug(title: string, addSuffix: boolean = false): string {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60);
  
  // Add a short random suffix to ensure uniqueness when topics are reused
  if (addSuffix) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
  }
  
  return slug;
}

interface BlogContent {
  title: string;
  excerpt: string;
  content: string;
  metaDescription: string;
  metaKeywords: string[];
  faqSchema: { question: string; answer: string }[];
  sources: { name: string; url: string }[];
  internalLinks: string[];
  readingTime: number;
  keyTakeaways: string[];
  quotableStats: string[];
}

async function generateBlog(topic: string, category: string, targetKeyword: string): Promise<BlogContent> {
  const prompt = `You are an expert multifamily real estate analyst writing for EquityMD.com, connecting accredited investors with apartment syndication opportunities.

=== CRITICAL CONTENT RULES ===
1. EVERGREEN - Do NOT include years (2024, 2025, 2026) in titles or time-sensitive references
2. ORIGINAL CONTENT - NEVER copy text word-for-word. Always paraphrase and synthesize information in your own words
3. CITE SOURCES - When referencing data, statistics, or research, attribute it with "According to [Source Name]..."
4. ACCESSIBLE WRITING - Write so anyone can understand, even complex financial topics. Explain jargon in simple terms
5. PROFESSIONAL TONE - Maintain authority while being approachable and helpful

=== SOURCE ATTRIBUTION (REQUIRED) ===
When citing facts or data, use these trusted industry sources and include their URLs:
- National Multifamily Housing Council (NMHC): https://www.nmhc.org
- National Apartment Association (NAA): https://www.naahq.org
- CBRE Research: https://www.cbre.com/insights
- Marcus & Millichap: https://www.marcusmillichap.com/research
- Freddie Mac Multifamily: https://mf.freddiemac.com
- CoStar Group: https://www.costar.com
- Yardi Matrix: https://www.yardimatrix.com
- Urban Land Institute (ULI): https://uli.org
- SEC (for accredited investor rules): https://www.sec.gov
- IRS (for tax guidance): https://www.irs.gov

Include at least 3-5 credible sources per article with actual URLs.

TARGET AUDIENCE: Accredited passive investors ($100K-$1M+) interested in apartment syndications.

=== SEO OPTIMIZATION ===
1. Title: Evergreen, keyword-rich, 50-60 chars, NO YEARS
2. Use target keyword in first 100 words
3. Include 3-4 LSI keywords naturally
4. H2/H3 headings with keyword variations
5. FAQ section (4 questions)
6. Internal links: /find, /how-it-works, /resources/glossary

=== GEO OPTIMIZATION (AI Search) ===
1. Quotable statements AI can cite: "According to [source], [fact]"
2. Clear definitions at section starts
3. Numbered lists with specific data
4. Key Takeaways box with 4-5 bullets

=== WRITING STYLE ===
- Use short paragraphs (2-3 sentences max)
- Explain technical terms when first used
- Use bullet points for complex lists
- Include practical examples
- Write like you're explaining to a smart friend who's new to real estate

TOPIC: "${topic}"
CATEGORY: ${category}
TARGET KEYWORD: "${targetKeyword}"

Write 1200-1500 words. Use ## for H2, ### for H3.

Respond ONLY with valid JSON:
{
  "title": "Evergreen title, no years (50-60 chars)",
  "excerpt": "2-sentence hook (150-160 chars)",
  "content": "Full markdown with Key Takeaways, ## headings, FAQs",
  "metaDescription": "SEO description with keyword (150-160 chars)",
  "metaKeywords": ["primary", "lsi1", "lsi2", "lsi3", "lsi4"],
  "faqSchema": [{"question": "Q?", "answer": "A"}],
  "sources": [{"name": "Full Source Name", "url": "https://actual-url.com/page"}],
  "internalLinks": ["/find", "/how-it-works"],
  "readingTime": 7,
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3", "Takeaway 4"],
  "quotableStats": ["According to [Source], statistic here", "Per [Source], data point"]
}`;

  const response = await fetch(XAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-3-latest',
      messages: [
        { role: 'system', content: 'You write evergreen, authoritative real estate content. Never include years in titles. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 6000,
    }),
  });

  if (!response.ok) {
    throw new Error(`xAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) throw new Error('No content from API');

  const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned);
}

async function getUnusedTopic(): Promise<{ category: string; topic: string; targetKeyword: string; isReused: boolean } | null> {
  const { data: existingPosts } = await supabase
    .from('blog_posts')
    .select('generation_prompt');

  const usedTopics = new Set(existingPosts?.map(p => p.generation_prompt) || []);
  const available = EVERGREEN_TOPICS.filter(t => !usedTopics.has(t.topic));
  
  if (available.length === 0) {
    console.log('📚 All topics used! Rotating from start (will add unique suffix).');
    const topic = EVERGREEN_TOPICS[Math.floor(Math.random() * EVERGREEN_TOPICS.length)];
    return { ...topic, isReused: true };
  }
  
  const topic = available[Math.floor(Math.random() * available.length)];
  return { ...topic, isReused: false };
}

async function saveBlogPost(content: BlogContent, category: string, topic: string, publish: boolean, useAIImages: boolean = true, useOpenAI: boolean = false, isReused: boolean = false): Promise<string> {
  const slug = generateSlug(content.title, isReused);
  
  // Try AI image generation first, fall back to stock images
  let imageUrl: string;
  if (useAIImages) {
    const aiImage = await generateAIImage(content.title, category, useOpenAI);
    imageUrl = aiImage || getRandomImage(category);
  } else {
    imageUrl = getRandomImage(category);
  }
  
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: content.title,
      slug,
      excerpt: content.excerpt,
      content: content.content,
      author: 'EquityMD Team',
      category,
      image_url: imageUrl,
      meta_description: content.metaDescription,
      meta_keywords: content.metaKeywords,
      faq_schema: content.faqSchema,
      sources: content.sources,
      internal_links: content.internalLinks,
      reading_time: content.readingTime,
      key_takeaways: content.keyTakeaways,
      quotable_stats: content.quotableStats,
      is_published: publish,
      published_at: publish ? now : null,
      ai_generated: true,
      generation_prompt: topic,
    })
    .select('slug')
    .single();

  if (error) throw new Error(`Database error: ${error.message}`);
  return data?.slug || slug;
}

async function main() {
  const args = process.argv.slice(2);
  const publish = args.includes('--publish');
  const useAIImages = args.includes('--ai-images') || args.includes('--openai-images');
  const useOpenAI = args.includes('--openai-images');
  const countIdx = args.indexOf('--count');
  const count = countIdx !== -1 ? parseInt(args[countIdx + 1]) || 1 : 1;

  console.log('🚀 EquityMD Blog Generator (Evergreen)');
  console.log(`   Generating ${count} blog(s)...`);
  if (useAIImages) {
    if (useOpenAI) {
      console.log('   🎨 AI Image Generation: OpenAI DALL-E 3');
      if (!OPENAI_API_KEY) {
        console.log('   ⚠️ Warning: OPENAI_API_KEY not set, will fall back to Grok');
      }
    } else {
      console.log('   🎨 AI Image Generation: xAI Grok');
    }
  }
  console.log('=====================================\n');

  for (let i = 0; i < count; i++) {
    try {
      const topic = await getUnusedTopic();
      if (!topic) continue;

      console.log(`[${i + 1}/${count}] "${topic.topic}"`);
      
      const content = await generateBlog(topic.topic, topic.category, topic.targetKeyword);
      const slug = await saveBlogPost(content, topic.category, topic.topic, publish, useAIImages, useOpenAI, topic.isReused);
      
      console.log(`   ✅ ${publish ? 'Published' : 'Draft'}: ${content.title}`);
      console.log(`   📍 /blog/${slug}\n`);
      
      // Longer delay when generating AI images to avoid rate limits
      const delay = useAIImages ? 15000 : 10000;
      if (i < count - 1) await new Promise(r => setTimeout(r, delay));
      
    } catch (err: any) {
      console.log(`   ❌ Error: ${err.message}\n`);
    }
  }

  console.log('✅ Complete!');
}

main();
