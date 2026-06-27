/**
 * Client-side image compression for UPLOADS.
 *
 * Resizes to a max edge and re-encodes before the file ever reaches Supabase
 * storage — so new blog/deal images store lean (no more 5–7MB originals that
 * we then have to batch-compress later).
 *
 * Keeps transparency (PNG) as PNG; everything else becomes high-quality JPEG.
 * Falls back to the original file if anything goes wrong (never blocks upload).
 */

interface CompressOptions {
  maxDim?: number;      // longest edge in px
  quality?: number;     // 0..1 (JPEG)
  /** Skip compression for files already smaller than this (bytes) */
  minBytes?: number;
}

export async function compressImageForUpload(
  file: File,
  { maxDim = 1600, quality = 0.8, minBytes = 200_000 }: CompressOptions = {}
): Promise<File> {
  try {
    // Only touch raster images; leave SVG/GIF/PDF/etc. alone.
    if (!/^image\/(jpe?g|png|webp)$/i.test(file.type)) return file;
    if (file.size <= minBytes) return file;

    const bitmap = await createImageBitmap(file).catch(() => null);
    if (!bitmap) return file;

    let { width, height } = bitmap;
    if (width > maxDim || height > maxDim) {
      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) { bitmap.close?.(); return file; }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const hasAlpha = /png/i.test(file.type);
    const outType = hasAlpha ? 'image/png' : 'image/jpeg';
    const ext = hasAlpha ? 'png' : 'jpg';

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, outType, hasAlpha ? undefined : quality)
    );
    if (!blob || blob.size >= file.size) return file; // no gain → keep original

    const base = file.name.replace(/\.[^.]+$/, '');
    return new File([blob], `${base}.${ext}`, { type: outType, lastModified: Date.now() });
  } catch {
    return file; // never block an upload on compression failure
  }
}
