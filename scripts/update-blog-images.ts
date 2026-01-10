/**
 * Update existing blog post images with new varied, realistic DALL-E 3 images
 * 
 * Usage:
 *   npx tsx scripts/update-blog-images.ts              # Update all AI-generated blogs
 *   npx tsx scripts/update-blog-images.ts --limit 10   # Update only 10 blogs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_IMAGE_URL = 'https://api.openai.com/v1/images/generations';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is required');
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// US cities for realistic imagery
const US_CITIES = [
  'Austin, Texas', 'Phoenix, Arizona', 'Nashville, Tennessee', 'Charlotte, North Carolina',
  'Denver, Colorado', 'Atlanta, Georgia', 'Dallas, Texas', 'Tampa, Florida',
  'Raleigh, North Carolina', 'Salt Lake City, Utah', 'Seattle, Washington', 'Miami, Florida',
  'San Diego, California', 'Orlando, Florida', 'Las Vegas, Nevada', 'Houston, Texas',
];

function getRandomCity(): string {
  return US_CITIES[Math.floor(Math.random() * US_CITIES.length)];
}

// Category-specific image styles - realistic, editorial photography
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

async function generateNewImage(title: string, category: string): Promise<string | null> {
  try {
    const imagePrompt = getImagePromptForCategory(title, category);
    
    console.log(`   🖼️ Generating new image...`);
    
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
        size: '1792x1024',
        quality: 'standard',
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   ⚠️ OpenAI API error: ${response.status} - ${errorText.substring(0, 100)}`);
      return null;
    }

    const data = await response.json();
    const imageUrl = data?.data?.[0]?.url;
    
    if (!imageUrl) {
      console.log('   ⚠️ No image URL in response');
      return null;
    }

    // Download and upload to Supabase
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
    
    console.log('   ✅ New image generated');
    return publicUrl;

  } catch (error: any) {
    console.log(`   ⚠️ Image generation failed: ${error.message}`);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1]) || 50 : 50;

  console.log('🖼️ Blog Image Updater');
  console.log(`   Updating up to ${limit} blog post images...`);
  console.log('=====================================\n');

  // Fetch blog posts that need image updates
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, category, image_url, slug')
    .eq('ai_generated', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ Failed to fetch blog posts:', error.message);
    process.exit(1);
  }

  if (!posts || posts.length === 0) {
    console.log('No blog posts found to update.');
    process.exit(0);
  }

  console.log(`Found ${posts.length} blog posts to update.\n`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`[${i + 1}/${posts.length}] ${post.title}`);
    console.log(`   Category: ${post.category}`);
    
    const newImageUrl = await generateNewImage(post.title, post.category);
    
    if (newImageUrl) {
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ image_url: newImageUrl })
        .eq('id', post.id);
      
      if (updateError) {
        console.log(`   ❌ Failed to update: ${updateError.message}`);
        failed++;
      } else {
        console.log(`   📍 /blog/${post.slug}\n`);
        updated++;
      }
    } else {
      console.log(`   ⏭️ Skipped (keeping existing image)\n`);
      failed++;
    }
    
    // Rate limit delay
    if (i < posts.length - 1) {
      await new Promise(r => setTimeout(r, 15000));
    }
  }

  console.log('=====================================');
  console.log(`✅ Updated: ${updated} blogs`);
  console.log(`⏭️ Skipped: ${failed} blogs`);
  console.log('Done!');
}

main();
