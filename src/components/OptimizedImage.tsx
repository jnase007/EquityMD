import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [imageSrc, setImageSrc] = useState(priority ? src : placeholder);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

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

  // Load image when in view
  useEffect(() => {
    if (isInView && imageSrc === placeholder) {
      // Try WebP first, fallback to original
      const webpSrc = src.includes('unsplash.com') 
        ? `${src}&fm=webp&q=80`
        : src;
      
      const img = new Image();
      img.onload = () => {
        setImageSrc(webpSrc);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.src = webpSrc;
    }
  }, [isInView, src, placeholder, imageSrc]);

  // Generate responsive srcSet for Unsplash images
  const generateSrcSet = (baseSrc: string) => {
    if (!baseSrc.includes('unsplash.com')) return undefined;
    
    const sizes = [400, 800, 1200, 1600];
    return sizes
      .map(size => `${baseSrc}&w=${size}&fm=webp&q=80 ${size}w`)
      .join(', ');
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      srcSet={generateSrcSet(src)}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setIsLoaded(true)}
      style={{
        aspectRatio: width && height ? `${width}/${height}` : undefined
      }}
    />
  );
} 