import { useEffect } from 'react';

export function useScrollFix() {
  useEffect(() => {
    // Function to handle scroll events and prevent interference
    const handleWheel = (e: WheelEvent) => {
      // Allow scrolling to always work
      e.stopPropagation();
    };

    // Function to handle touch events
    const handleTouchStart = (e: TouchEvent) => {
      // Allow touch scrolling to always work
      e.stopPropagation();
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Allow touch scrolling to always work
      e.stopPropagation();
    };

    // Add event listeners to the document
    document.addEventListener('wheel', handleWheel, { passive: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Cleanup function
    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
} 