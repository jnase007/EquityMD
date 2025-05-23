import { useEffect } from 'react';

interface PerformanceMonitorProps {
  enabled?: boolean;
}

export function PerformanceMonitor({ enabled = process.env.NODE_ENV === 'development' }: PerformanceMonitorProps) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log('🚀 Navigation Performance:', {
            'DNS Lookup': navEntry.domainLookupEnd - navEntry.domainLookupStart,
            'TCP Connection': navEntry.connectEnd - navEntry.connectStart,
            'Request': navEntry.responseStart - navEntry.requestStart,
            'Response': navEntry.responseEnd - navEntry.responseStart,
            'DOM Processing': navEntry.domContentLoadedEventEnd - navEntry.responseEnd,
            'Total Load Time': navEntry.loadEventEnd - navEntry.fetchStart
          });
        }

        if (entry.entryType === 'measure') {
          console.log(`📊 ${entry.name}: ${entry.duration.toFixed(2)}ms`);
        }

        // Largest Contentful Paint
        if (entry.entryType === 'largest-contentful-paint') {
          console.log(`🎨 LCP: ${entry.startTime.toFixed(2)}ms`);
        }

        // First Input Delay
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as any; // PerformanceEventTiming not available in all browsers
          console.log(`⚡ FID: ${fidEntry.processingStart - fidEntry.startTime}ms`);
        }

        // Cumulative Layout Shift
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          console.log(`📐 CLS: ${(entry as any).value}`);
        }
      });
    });

    // Observe different entry types
    try {
      observer.observe({ entryTypes: ['navigation', 'measure', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      // Fallback for browsers that don't support all entry types
      observer.observe({ entryTypes: ['navigation', 'measure'] });
    }

    // Monitor bundle sizes
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const cssResources = resources.filter(r => r.name.includes('.css'));
      
      console.log('📦 Bundle Analysis:', {
        'JS Files': jsResources.length,
        'CSS Files': cssResources.length,
        'Total JS Size': jsResources.reduce((acc, r) => acc + (r.transferSize || 0), 0),
        'Total CSS Size': cssResources.reduce((acc, r) => acc + (r.transferSize || 0), 0)
      });
    }

    // Memory usage monitoring
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('🧠 Memory Usage:', {
        'Used': `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        'Total': `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        'Limit': `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [enabled]);

  return null;
} 