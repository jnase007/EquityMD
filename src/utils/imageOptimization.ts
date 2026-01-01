/**
 * Image optimization utilities
 * Converts images to WebP format and provides optimized URLs
 */

// Check if browser supports WebP
export const supportsWebP = (() => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
})();

// Image CDN/optimization services
// If you're using Cloudinary, Imgix, or similar, configure here
const IMAGE_CDN_URL = import.meta.env.VITE_IMAGE_CDN_URL || '';

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Get optimized image URL
 * Works with Supabase storage, Unsplash, and other sources
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  if (!originalUrl) return '';
  
  const { width, height, quality = 80, format = 'auto' } = options;
  
  // For Unsplash images - they support URL params
  if (originalUrl.includes('unsplash.com')) {
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    params.set('auto', 'format');
    params.set('fit', 'crop');
    
    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}${params.toString()}`;
  }
  
  // For Supabase storage - add transform params
  if (originalUrl.includes('supabase.co/storage')) {
    // Supabase supports image transforms with /render/image endpoint
    // But for now, return original URL
    return originalUrl;
  }
  
  // If using an image CDN
  if (IMAGE_CDN_URL) {
    const params = new URLSearchParams();
    params.set('url', originalUrl);
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    if (format !== 'auto') params.set('f', format);
    
    return `${IMAGE_CDN_URL}?${params.toString()}`;
  }
  
  // Return original URL if no optimization available
  return originalUrl;
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(
  originalUrl: string,
  widths: number[] = [320, 640, 768, 1024, 1280]
): string {
  if (!originalUrl) return '';
  
  return widths
    .map(w => `${getOptimizedImageUrl(originalUrl, { width: w })} ${w}w`)
    .join(', ');
}

/**
 * Lazy loading image component helper
 */
export function getImageProps(
  src: string,
  alt: string,
  options: ImageOptimizationOptions & { sizes?: string } = {}
) {
  const { sizes = '100vw', ...imageOptions } = options;
  
  return {
    src: getOptimizedImageUrl(src, imageOptions),
    srcSet: generateSrcSet(src),
    sizes,
    alt,
    loading: 'lazy' as const,
    decoding: 'async' as const,
  };
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, options?: ImageOptimizationOptions): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = getOptimizedImageUrl(src, options);
  document.head.appendChild(link);
}

/**
 * Convert image file to WebP (client-side)
 */
export async function convertToWebP(
  file: File,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not convert to WebP'));
          }
        },
        'image/webp',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get placeholder blur data URL for image
 */
export function getBlurPlaceholder(color: string = '#e5e7eb'): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='${encodeURIComponent(color)}' width='1' height='1'/%3E%3C/svg%3E`;
}

