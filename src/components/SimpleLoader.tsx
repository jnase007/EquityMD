import React, { useEffect, useState } from 'react';

interface SimpleLoaderProps {
  text?: string;
  timeout?: number;
  onTimeout?: () => void;
}

export function SimpleLoader({ 
  text = 'Loading...', 
  timeout = 15000,
  onTimeout 
}: SimpleLoaderProps) {
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    if (timeout > 0) {
      const timer = setTimeout(() => {
        setShowRetry(true);
        onTimeout?.();
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [timeout, onTimeout]);

  if (showRetry) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Taking longer than expected
          </h3>
          <p className="text-gray-600 mb-6">
            The page is loading slowly. This might be due to your connection or large images.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
            <button
              onClick={() => setShowRetry(false)}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Keep Waiting
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        {/* Simple, elegant spinner */}
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        
        {/* EquityMD branding */}
        <div className="flex items-center justify-center space-x-1 mb-2">
          <span className="text-lg font-bold text-gray-800">Equity</span>
          <span className="text-lg font-bold text-blue-600">MD</span>
        </div>
        
        <p className="text-gray-500">{text}</p>
      </div>
    </div>
  );
}

// Simple inline loader
export function InlineLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-gray-600">{text}</span>
      </div>
    </div>
  );
} 