#!/usr/bin/env node
/**
 * Server-level image compressor for Supabase storage.
 *
 * Walks the `images` and `deal-media` buckets, finds bloated raster images,
 * recompresses them (resize to max 1600px, high-quality JPEG/PNG), and
 * re-uploads IN PLACE (same path, upsert) so every existing public URL keeps
 * working untouched.
 *
 * - Skips PDFs and non-images.
 * - Skips files already small (< MIN_BYTES).
 * - PNGs with alpha stay PNG (palette+quantized); opaque PNG/JPEG -> JPEG.
 * - DRY RUN by default. Pass --apply to actually upload.
 *
 * Usage:
 *   node scripts/compress-storage-images.mjs            # dry run, all buckets
 *   node scripts/compress-storage-images.mjs --apply    # do it
 *   node scripts/compress-storage-images.mjs --bucket deal-media --apply
 *   node scripts/compress-storage-images.mjs --limit 5  # first 5 (testing)
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- load .env ---
const envPath = path.join(__dirname, '..', '.env');
const env = Object.fromEntries(
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const URL = env.VITE_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_KEY || env.VITE_SUPABASE_SERVICE_KEY;
if (!URL || !KEY) { console.error('Missing Supabase URL/service key in .env'); process.exit(1); }

// --- args ---
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const LIMIT = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : Infinity;
const ONLY_BUCKET = args.includes('--bucket') ? args[args.indexOf('--bucket') + 1] : null;
const BUCKETS = ONLY_BUCKET ? [ONLY_BUCKET] : ['images', 'deal-media'];

const MIN_BYTES = 500_000;   // only touch files bigger than this
const MAX_DIM = 1600;        // longest edge
const JPEG_Q = 78;

const hdr = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const IMG_EXT = /\.(jpe?g|png|webp)$/i;

async function listDir(bucket, prefix = '') {
  const r = await fetch(`${URL}/storage/v1/object/list/${bucket}`, {
    method: 'POST',
    headers: { ...hdr, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit: 1000, sortBy: { column: 'name', order: 'asc' } }),
  });
  return r.json();
}
async function walk(bucket, prefix = '') {
  const out = [];
  for (const it of await listDir(bucket, prefix)) {
    if (it.id === null || it.id === undefined) {
      out.push(...await walk(bucket, (prefix ? prefix : '') + it.name + '/'));
    } else {
      out.push({
        path: (prefix ? prefix : '') + it.name,
        size: it.metadata?.size || 0,
        mime: it.metadata?.mimetype || '',
      });
    }
  }
  return out;
}

function fmt(b) { return (b / 1e6).toFixed(2) + 'MB'; }

async function compressBuffer(buf, filePath) {
  const img = sharp(buf, { failOn: 'none' });
  const meta = await img.metadata();
  const hasAlpha = meta.hasAlpha;
  let pipeline = img.rotate(); // honor EXIF orientation
  if (meta.width > MAX_DIM || meta.height > MAX_DIM) {
    pipeline = pipeline.resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true });
  }
  // Keep transparency as PNG; otherwise JPEG (much smaller).
  if (hasAlpha) {
    return { buf: await pipeline.png({ compressionLevel: 9, palette: true, quality: 80 }).toBuffer(), contentType: 'image/png', newPath: filePath };
  }
  return { buf: await pipeline.jpeg({ quality: JPEG_Q, mozjpeg: true }).toBuffer(), contentType: 'image/jpeg', newPath: filePath };
}

async function main() {
  console.log(`\n${APPLY ? '🔧 APPLY' : '🔍 DRY RUN'} — max ${MAX_DIM}px, JPEG q${JPEG_Q}, only files > ${fmt(MIN_BYTES)}\n`);
  let totalBefore = 0, totalAfter = 0, processed = 0, skipped = 0, errors = 0;

  for (const bucket of BUCKETS) {
    const files = (await walk(bucket)).filter(f => IMG_EXT.test(f.path) && f.size > MIN_BYTES);
    console.log(`=== ${bucket}: ${files.length} candidate images ===`);
    for (const f of files) {
      if (processed >= LIMIT) break;
      try {
        const dl = await fetch(`${URL}/storage/v1/object/public/${bucket}/${f.path.split('/').map(encodeURIComponent).join('/')}`, { headers: hdr });
        if (!dl.ok) { console.log(`  ⚠️  skip (download ${dl.status}): ${f.path}`); skipped++; continue; }
        const inBuf = Buffer.from(await dl.arrayBuffer());
        const { buf: outBuf, contentType } = await compressBuffer(inBuf, f.path);
        const saved = inBuf.length - outBuf.length;
        // Only keep result if it actually shrinks meaningfully
        if (saved < inBuf.length * 0.1) {
          console.log(`  ⏭️  ${f.path}  (${fmt(inBuf.length)} → ${fmt(outBuf.length)}, <10% gain, skipped)`);
          skipped++; continue;
        }
        totalBefore += inBuf.length; totalAfter += outBuf.length; processed++;
        console.log(`  ${APPLY ? '✅' : '•'} ${f.path}  ${fmt(inBuf.length)} → ${fmt(outBuf.length)}  (-${fmt(saved)})`);
        if (APPLY) {
          const up = await fetch(`${URL}/storage/v1/object/${bucket}/${f.path.split('/').map(encodeURIComponent).join('/')}`, {
            method: 'PUT',
            headers: { ...hdr, 'Content-Type': contentType, 'x-upsert': 'true', 'cache-control': '3600' },
            body: outBuf,
          });
          if (!up.ok) { console.log(`     ❌ upload failed ${up.status}: ${await up.text()}`); errors++; }
        }
      } catch (e) {
        console.log(`  ❌ error on ${f.path}: ${e.message}`); errors++;
      }
    }
  }
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Processed: ${processed} | Skipped: ${skipped} | Errors: ${errors}`);
  console.log(`Before: ${fmt(totalBefore)}  →  After: ${fmt(totalAfter)}  =  SAVED ${fmt(totalBefore - totalAfter)} (${totalBefore ? ((1 - totalAfter / totalBefore) * 100).toFixed(0) : 0}%)`);
  if (!APPLY) console.log(`\n(DRY RUN — nothing uploaded. Re-run with --apply to write.)`);
}
main().catch(e => { console.error(e); process.exit(1); });
