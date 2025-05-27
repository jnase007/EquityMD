import React, { useEffect, useState } from 'react';
import { loadingManager } from '../utils/loadingManager';

interface LoadingInterceptorProps {
  children: React.ReactNode;
}

export function LoadingInterceptor({ children }: LoadingInterceptorProps) {
  const [stuckLoadings, setStuckLoadings] = useState<string[]>([]);
  const [showRecovery, setShowRecovery] = useState(false);
  
  // More generous timeouts for production
  const isProduction = process.env.NODE_ENV === 'production';
  const stuckThreshold = isProduction ? 45000 : 30000; // 45s in prod, 30s in dev
  const checkInterval = isProduction ? 15000 : 10000; // Check every 15s in prod, 10s in dev

  useEffect(() => {
    // Check for stuck loading states every 10 seconds (less aggressive)
    const checkInterval = setInterval(() => {
      const activeLoadings = loadingManager.getActiveLoadings();
      const stuck = activeLoadings.filter(key => {
        const duration = loadingManager.getLoadingDuration(key);
        return duration > 30000; // Consider stuck after 30 seconds (increased from 20)
      });

      if (stuck.length > 0) {
        console.warn('Detected stuck loading states:', stuck);
        setStuckLoadings(stuck);
        setShowRecovery(true);
      }
    }, 10000); // Check every 10 seconds instead of 5

    // Listen for loading timeout events
    const handleLoadingTimeout = (event: CustomEvent) => {
      console.log('Loading timeout detected:', event.detail);
      setShowRecovery(true);
    };

    window.addEventListener('loadingTimeout', handleLoadingTimeout as EventListener);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('loadingTimeout', handleLoadingTimeout as EventListener);
    };
  }, []);

  const handleClearStuck = () => {
    stuckLoadings.forEach(key => {
      loadingManager.stopLoading(key);
    });
    setStuckLoadings([]);
    setShowRecovery(false);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowRecovery(false);
    setStuckLoadings([]);
  };

  return (
    <>
      {children}
      
      {/* Recovery Modal */}
      {showRecovery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Loading Issue Detected
              </h3>
              
              <p className="text-gray-600 mb-6">
                Some content is taking longer than expected to load. This might be due to a slow connection or a temporary issue.
              </p>

              {stuckLoadings.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700 mb-2">Stuck operations:</p>
                  <ul className="text-xs text-gray-600">
                    {stuckLoadings.map(key => (
                      <li key={key}>• {key}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleClearStuck}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear & Continue
                </button>
                <button
                  onClick={handleRefresh}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Refresh Page
                </button>
                <button
                  onClick={handleDismiss}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 