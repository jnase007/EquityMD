import React from 'react';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

export function ProgressRing({ 
  percentage, 
  size = 44, 
  strokeWidth = 3,
  className = '',
  children 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 100) return '#10b981'; // emerald
    if (percentage >= 75) return '#3b82f6'; // blue
    if (percentage >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
      
      {/* Pulse animation when incomplete */}
      {percentage < 100 && percentage > 0 && (
        <div 
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ backgroundColor: getColor() }}
        />
      )}
    </div>
  );
}

// Header version with avatar
interface HeaderProgressRingProps {
  avatarUrl?: string;
  userName?: string;
  profileCompletion: number;
  onClick?: () => void;
}

export function HeaderProgressRing({ 
  avatarUrl, 
  userName, 
  profileCompletion,
  onClick 
}: HeaderProgressRingProps) {
  return (
    <button
      onClick={onClick}
      className="relative group"
      title={`Profile ${profileCompletion}% complete`}
    >
      <ProgressRing percentage={profileCompletion} size={40} strokeWidth={2}>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-sm font-semibold">
              {userName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          )}
        </div>
      </ProgressRing>
      
      {/* Tooltip */}
      {profileCompletion < 100 && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {profileCompletion}% complete
          </div>
        </div>
      )}
    </button>
  );
}

