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

// Category-specific image styles - SIMPLIFIED to avoid AI errors
// Rules: Max 1-2 people, no complex tech angles, focus on buildings/environments
const IMAGE_STYLES: Record<string, string[]> = {
  'Investor Education': [
    'Stunning aerial drone photograph of a luxury apartment complex in {city} at golden hour, resort-style pool, beautiful landscaping, no people visible',
    'Wide-angle photograph of a modern apartment building lobby interior, marble floors, high ceilings, elegant furniture, no people',
    'Beautiful exterior photograph of a Class A apartment community in {city}, palm trees, blue sky, professional real estate marketing style',
    'Overhead flat-lay photograph of printed property documents, a pen, reading glasses, and coffee cup on a wooden desk - no screens or technology',
  ],
  'Deal Analysis': [
    'Stunning aerial photograph of an apartment complex in {city} showing the full property, pool, parking, landscaping, golden hour lighting',
    'Beautiful photograph of a modern apartment building exterior with attractive architecture, sunset sky, no people',
    'Professional photograph of printed financial documents and charts spread on a conference table, pen and coffee nearby, no people or screens',
    'Wide exterior shot of a newly renovated apartment community in {city}, fresh paint, modern design, landscaped grounds',
  ],
  'Syndication': [
    'Two business professionals shaking hands outdoors with a beautiful apartment building behind them, shot from behind so faces not visible',
    'Silhouette photograph of two businesspeople looking at an apartment building at sunset, artistic editorial style',
    'Beautiful photograph of a modern apartment complex entrance with attractive signage area (no text on sign), welcoming atmosphere',
    'Professional photograph of a conference room with large windows showing city view, empty chairs around table, no people',
  ],
  'Due Diligence': [
    'Photograph of a hard hat, clipboard, and safety vest on a table with apartment blueprints, no people, professional still life',
    'Wide exterior photograph of an apartment building with a clear view of the roof, HVAC units visible, inspection perspective',
    'Beautiful photograph of an apartment courtyard and walkways, well-maintained grounds, inspection tour perspective, no people',
    'Photograph of property inspection tools - flashlight, clipboard, measuring tape - arranged on blueprints, no people',
  ],
  'Tax Strategy': [
    'Elegant flat-lay photograph of tax documents, calculator, pen, and reading glasses on a mahogany desk, no screens or people',
    'Professional photograph of organized financial folders and binders on office shelves, warm lighting, no people',
    'Overhead photograph of a neat desk with printed tax forms, calculator, and coffee, morning light through window, no people',
    'Beautiful photograph of a professional office interior with bookshelves and filing cabinets, no people, warm atmosphere',
  ],
  'Market Insights': [
    'Breathtaking photograph of the {city} downtown skyline at golden hour, apartment towers prominent, editorial cityscape',
    'Stunning aerial photograph of a growing neighborhood in {city} with new apartment construction, wide vista',
    'Beautiful street-level photograph of a thriving mixed-use development in {city}, urban vitality, people distant and small',
    'Panoramic photograph of {city} skyline at blue hour, city lights beginning to glow, apartment buildings featured',
  ],
  'Investment Strategy': [
    'Beautiful photograph of a luxury apartment complex exterior at dusk with warm interior lights glowing, no people',
    'Stunning wide shot of multiple apartment buildings in a master-planned community in {city}, aerial perspective',
    'Professional photograph of a modern apartment leasing center exterior, attractive architecture, no people visible',
    'Artistic photograph of an apartment balcony view overlooking {city}, sunset colors, lifestyle aspirational image',
  ],
  'Financing': [
    'Elegant photograph of a fountain pen resting on loan documents next to a set of keys, closing table still life, no people',
    'Beautiful photograph of a bank building exterior with classical architecture, professional and trustworthy atmosphere',
    'Overhead photograph of closing documents, keys, and a pen on a polished conference table, no people or screens',
    'Professional photograph of an elegant office with leather chairs and wood paneling, empty, warm lighting',
  ],
  'Property Management': [
    'Beautiful photograph of a modern apartment lobby with concierge desk, elegant design, no people visible',
    'Stunning photograph of an apartment pool area at sunset, lounge chairs, palm trees, resort atmosphere, no people',
    'Wide photograph of a well-maintained apartment fitness center with modern equipment, no people, clean and bright',
    'Beautiful exterior photograph of apartment community amenities - clubhouse, pool, grilling area - no people',
  ],
  'Exit Strategy': [
    'Artistic photograph of a set of keys on a table next to closing documents, soft focus background, celebration implied',
    'Beautiful photograph of a luxury apartment building exterior at golden hour, successful investment property appearance',
    'Professional photograph of champagne glasses on a conference table with city view through windows, no people',
    'Stunning photograph of an upscale apartment complex at twilight, warm lights in windows, success and quality implied',
  ],
};

function getImagePromptForCategory(title: string, category: string): string {
  const styles = IMAGE_STYLES[category] || IMAGE_STYLES['Market Insights'];
  let randomStyle = styles[Math.floor(Math.random() * styles.length)];
  randomStyle = randomStyle.replace(/\{city\}/g, getRandomCity());
  
  // CRITICAL: Emphatic instructions for photorealism, NO TEXT, and avoiding AI artifacts
  return `${randomStyle}

ABSOLUTELY CRITICAL REQUIREMENTS:

NO TEXT ALLOWED:
- DO NOT include ANY text, words, letters, numbers, titles, captions, watermarks, logos, or writing of ANY kind.
- No signs, labels, or text on screens, documents, or anywhere in the image.

ANATOMICAL AND OBJECT ACCURACY (VERY IMPORTANT):
- All people must have correct human anatomy: proper number of fingers (5 per hand), correct facial features, natural body proportions.
- Laptops and computers must face the CORRECT direction - screens face toward the user, not away.
- All objects must be oriented correctly and realistically.
- Hands must look natural and hold objects properly.

NO DUPLICATE PEOPLE:
- Every person in the image must be UNIQUE and DIFFERENT from each other.
- No repeated faces, no cloned people, no twins unless specifically requested.
- Each person should have distinct features: different hair, different face, different body type, different clothing.

PHOTOREALISM REQUIREMENTS:
- Must look like a real photograph from Getty Images or Shutterstock.
- Canon 5D Mark IV or Sony A7R IV quality.
- Natural lighting: window light, golden hour, or professional studio lighting.
- Real textures, authentic depth of field with realistic bokeh.
- Real people with natural, genuine expressions.

Photography style: Editorial photography for Forbes, Bloomberg, or Wall Street Journal.
Quality: Award-winning professional photography.
Mood: Professional, trustworthy, aspirational.`;
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
