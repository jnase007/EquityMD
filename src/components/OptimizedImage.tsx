import React, { useState, useRef, useEffect } from 'react';
import { getOptimizedImageUrl } from '../utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string; // extra classes applied to the inner <img> (e.g. object-fit, hover zoom)
  width?: number;
  height?: number;
  priority?: boolean; // Load immediately for above-the-fold images
  placeholder?: string; // Base64 or low-res placeholder
  blurFill?: boolean; // Show the WHOLE image (object-contain) with a blurred copy filling the frame instead of gray bars
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  width,
  height,
  priority = false,
  placeholder,
  blurFill = false
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip lazy loading for priority images

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Generate optimized image URLs via the shared helper, which correctly
  // rewrites Supabase /object/public/ URLs to the /render/image/ transform
  // endpoint (the old inline version added query params to /object/, which
  // Supabase ignores — so full-size originals were being served).
  const optimizedSrc = getOptimizedImageUrl(src, width ? { width, quality: 75 } : { quality: 75 });

  // Default object-fit is cover, but let callers override it (e.g. object-contain
  // to show the WHOLE property image instead of a cropped/zoomed-in crop).
  const hasObjectFit = /(^|\s)object-(cover|contain|fill|none|scale-down)(\s|$)/.test(imgClassName);
  // blurFill => always contain (whole image visible), blurred copy fills the frame.
  const objectFitClass = blurFill ? 'object-contain' : (hasObjectFit ? '' : 'object-cover');

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          {placeholder ? (
            <img 
              src={placeholder} 
              alt="Loading placeholder" 
              className="w-full h-full object-cover opacity-50"
            />
          ) : (
            <div className="text-gray-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Failed to load</p>
          </div>
        </div>
      )}

      {/* Blurred fill background — shows the whole image (object-contain) on top
          while a scaled-up, blurred copy fills the letterbox space instead of
          gray bars. Premium look, no cropping of the real photo. */}
      {isInView && blurFill && !error && (
        <img
          src={optimizedSrc}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover scale-110 blur-xl transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}

      {/* Actual image - only load when in view */}
      {isInView && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`relative w-full h-full ${objectFitClass} transition-all duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  );
} 