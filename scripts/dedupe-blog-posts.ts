/**
 * Deduplicate blog posts — keep the newest version of each title,
 * unpublish (not delete) older duplicates.
 * 
 * Usage: npx tsx scripts/dedupe-blog-posts.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Need service key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function dedupe() {
  console.log('🧹 Deduplicating blog posts...\n');

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, published_at, is_published')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error || !posts) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  // Group by title
  const byTitle: Record<string, typeof posts> = {};
  for (const p of posts) {
    const key = p.title.toLowerCase().trim();
    if (!byTitle[key]) byTitle[key] = [];
    byTitle[key].push(p);
  }

  let unpublished = 0;
  let dupeGroups = 0;

  for (const [title, group] of Object.entries(byTitle)) {
    if (group.length <= 1) continue;
    dupeGroups++;

    // Keep the newest (first in array since sorted desc)
    const keep = group[0];
    const toUnpublish = group.slice(1);

    console.log(`📝 "${keep.title}"`);
    console.log(`   Keep: /${keep.slug} (${keep.published_at?.slice(0, 10)})`);

    for (const dupe of toUnpublish) {
      const { error: upErr } = await supabase
        .from('blog_posts')
        .update({ is_published: false })
        .eq('id', dupe.id);

      if (upErr) {
        console.error(`   ❌ Failed to unpublish /${dupe.slug}: ${upErr.message}`);
      } else {
        console.log(`   ❌ Unpublished: /${dupe.slug} (${dupe.published_at?.slice(0, 10)})`);
        unpublished++;
      }
    }
    console.log();
  }

  console.log(`\n📊 Results: ${dupeGroups} duplicate groups found, ${unpublished} posts unpublished`);
  console.log(`✅ ${posts.length - unpublished} unique posts remain published`);
}

dedupe();
