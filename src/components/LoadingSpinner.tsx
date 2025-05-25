import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'pulse' | 'spin' | 'dots' | 'bars' | 'medical';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'medical', 
  text = 'Loading...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  if (variant === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
        <div className="relative">
          <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse`}></div>
          <div className={`${sizeClasses[size]} bg-blue-400 rounded-full animate-pulse absolute top-0 left-0 opacity-75`} style={{ animationDelay: '0.5s' }}></div>
        </div>
        {text && <p className={`text-gray-600 ${textSizeClasses[size]} animate-pulse`}>{text}</p>}
      </div>
    );
  }

  if (variant === 'spin') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
        <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}></div>
        {text && <p className={`text-gray-600 ${textSizeClasses[size]}`}>{text}</p>}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        {text && <p className={`text-gray-600 ${textSizeClasses[size]}`}>{text}</p>}
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
        <div className="flex space-x-1">
          <div className="w-2 h-8 bg-blue-600 rounded animate-pulse"></div>
          <div className="w-2 h-8 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-8 bg-blue-400 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-8 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
          <div className="w-2 h-8 bg-blue-600 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        {text && <p className={`text-gray-600 ${textSizeClasses[size]}`}>{text}</p>}
      </div>
    );
  }

  // Medical/EquityMD themed loader (default)
  return (
    <div className={`flex flex-col items-center justify-center space-y-6 ${className}`}>
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full`}></div>
        
        {/* Animated ring */}
        <div className={`${sizeClasses[size]} border-4 border-transparent border-t-blue-600 border-r-blue-500 rounded-full animate-spin absolute top-0 left-0`}></div>
        
        {/* Inner logo/icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-blue-600 rounded-sm animate-pulse"></div>
        </div>
        
        {/* Pulse effect */}
        <div className={`${sizeClasses[size]} border-2 border-blue-300 rounded-full absolute top-0 left-0 animate-ping opacity-20`}></div>
      </div>
      
      {/* EquityMD branding */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-1 mb-2">
          <span className="text-lg font-bold text-gray-800">Equity</span>
          <span className="text-lg font-bold text-blue-600">MD</span>
        </div>
        {text && <p className={`text-gray-500 ${textSizeClasses[size]}`}>{text}</p>}
      </div>
    </div>
  );
}

// Top loading bar component
export function TopLoadingBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-blue-600 animate-pulse">
        <div className="h-full bg-blue-500 animate-ping opacity-75"></div>
      </div>
      <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 animate-pulse"></div>
    </div>
  );
}

// Enhanced full page loader component
export function PageLoader({ 
  text = 'Loading your investment opportunities...', 
  showTopBar = true 
}: { 
  text?: string;
  showTopBar?: boolean; 
}) {
  return (
    <>
      {showTopBar && <TopLoadingBar />}
      <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-40">
        <LoadingSpinner variant="medical" size="xl" text={text} />
      </div>
    </>
  );
}

// Inline loader for smaller sections
export function InlineLoader({ text = 'Loading...', variant = 'dots' }: { text?: string; variant?: 'dots' | 'spin' | 'pulse' }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner variant={variant} size="md" text={text} />
    </div>
  );
} 