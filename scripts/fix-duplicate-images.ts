/**
 * Fix Duplicate Blog Images
 * Finds blog posts with duplicate images and regenerates unique AI images
 * 
 * Usage:
 *   npx tsx scripts/fix-duplicate-images.ts          # Find duplicates (dry run)
 *   npx tsx scripts/fix-duplicate-images.ts --fix    # Generate new images and update
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_IMAGE_URL = 'https://api.x.ai/v1/images/generations';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface BlogPost {
  id: string;
  title: string;
  category: string;
  image_url: string;
}

// Generate AI image using xAI's Grok image model
async function generateAIImage(title: string, category: string): Promise<string | null> {
  if (!XAI_API_KEY) {
    console.log('   ⚠️ XAI_API_KEY not set, skipping AI image');
    return null;
  }

  try {
    const imagePrompt = `Professional real estate photography style image for a blog article titled "${title}". 
    Category: ${category}. 
    Style: Modern, clean, professional business/investment aesthetic. 
    Subject: Luxury apartment buildings, modern office spaces, or professional real estate investors in a business setting.
    Mood: Confident, successful, trustworthy.
    NO text, logos, or watermarks in the image.
    Photorealistic, high quality, suitable for a professional investment platform blog header.`;

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

    // Download and upload to Supabase storage
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
    
    return publicUrl;

  } catch (error: any) {
    console.log(`   ⚠️ Image generation failed: ${error.message}`);
    return null;
  }
}

async function findDuplicates(): Promise<Map<string, BlogPost[]>> {
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, category, image_url')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching posts:', error);
    process.exit(1);
  }

  // Group by image_url
  const imageGroups = new Map<string, BlogPost[]>();
  for (const post of posts || []) {
    const url = post.image_url;
    if (!imageGroups.has(url)) {
      imageGroups.set(url, []);
    }
    imageGroups.get(url)!.push(post);
  }

  // Filter to only duplicates (more than 1 post using same image)
  const duplicates = new Map<string, BlogPost[]>();
  for (const [url, posts] of imageGroups) {
    if (posts.length > 1) {
      duplicates.set(url, posts);
    }
  }

  return duplicates;
}

async function main() {
  const args = process.argv.slice(2);
  const fix = args.includes('--fix');

  console.log('🔍 Finding blog posts with duplicate images...\n');

  const duplicates = await findDuplicates();

  if (duplicates.size === 0) {
    console.log('✅ No duplicate images found! All blog posts have unique images.');
    return;
  }

  // Count posts needing new images (keep first, regenerate rest)
  let totalNeedingFix = 0;
  const postsToFix: BlogPost[] = [];

  for (const [imageUrl, posts] of duplicates) {
    const shortUrl = imageUrl.includes('unsplash') 
      ? 'Unsplash: ' + imageUrl.split('?')[0].slice(-40)
      : imageUrl.substring(0, 60) + '...';
    
    console.log(`📷 ${shortUrl}`);
    console.log(`   Used by ${posts.length} posts:`);
    
    posts.forEach((post, idx) => {
      const status = idx === 0 ? '✓ Keep' : '→ Regenerate';
      console.log(`   ${status}: ${post.title.substring(0, 55)}...`);
      
      if (idx > 0) {
        postsToFix.push(post);
        totalNeedingFix++;
      }
    });
    console.log('');
  }

  console.log(`📊 Summary: ${duplicates.size} duplicate images, ${totalNeedingFix} posts need new images\n`);

  if (!fix) {
    console.log('Run with --fix to generate new AI images for these posts.');
    return;
  }

  // Fix mode - generate new images
  console.log('🎨 Generating new AI images...\n');

  let fixed = 0;
  let failed = 0;

  for (let i = 0; i < postsToFix.length; i++) {
    const post = postsToFix[i];
    console.log(`[${i + 1}/${postsToFix.length}] "${post.title.substring(0, 50)}..."`);

    const newImageUrl = await generateAIImage(post.title, post.category);

    if (newImageUrl) {
      // Update the blog post with new image
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ image_url: newImageUrl })
        .eq('id', post.id);

      if (updateError) {
        console.log(`   ❌ Failed to update: ${updateError.message}`);
        failed++;
      } else {
        console.log(`   ✅ New image generated and saved`);
        fixed++;
      }
    } else {
      console.log(`   ❌ Failed to generate image`);
      failed++;
    }

    // Delay between requests to avoid rate limits
    if (i < postsToFix.length - 1) {
      await new Promise(r => setTimeout(r, 15000));
    }
  }

  console.log(`\n✅ Complete! Fixed: ${fixed}, Failed: ${failed}`);
}

main();

