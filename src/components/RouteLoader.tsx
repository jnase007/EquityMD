import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { PageLoader } from './LoadingSpinner';

interface RouteLoaderProps {
  children: React.ReactNode;
}

export function RouteLoader({ children }: RouteLoaderProps) {
  const { isLoading, setLoading, setLoadingText } = useLoading();
  const location = useLocation();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const loadingRef = useRef(false);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only show loading if we're actually transitioning
    if (!loadingRef.current) {
      loadingRef.current = true;
      setLoadingText('Loading page...');
      setLoading(true);

      // Set a maximum loading time to prevent stuck loading
      timeoutRef.current = setTimeout(() => {
        console.warn('Route loading timeout - forcing completion');
        setLoading(false);
        loadingRef.current = false;
      }, 10000); // 10 second timeout
    }

    // Cleanup loading state when component mounts (page is ready)
    const cleanup = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setLoading(false);
      loadingRef.current = false;
    };

    // Use a small delay to ensure the page has actually loaded
    const readyTimeout = setTimeout(cleanup, 100);

    return () => {
      clearTimeout(readyTimeout);
      cleanup();
    };
  }, [location.pathname, setLoading, setLoadingText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setLoading(false);
    };
  }, [setLoading]);

  return (
    <>
      {children}
    </>
  );
} 