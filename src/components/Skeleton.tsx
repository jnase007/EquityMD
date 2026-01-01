import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div 
      className={`${baseClasses} ${animationClasses[animation]} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton components for common use cases

export function DealCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <Skeleton variant="rectangular" className="w-full h-48" />
      <div className="p-5 space-y-3">
        <Skeleton variant="text" className="w-3/4 h-6" />
        <Skeleton variant="text" className="w-1/2 h-4" />
        <div className="flex gap-2">
          <Skeleton variant="rounded" className="w-20 h-6" />
          <Skeleton variant="rounded" className="w-20 h-6" />
        </div>
        <div className="pt-3 border-t">
          <div className="flex justify-between">
            <Skeleton variant="text" className="w-24 h-5" />
            <Skeleton variant="text" className="w-16 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DealGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <DealCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SyndicatorCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-2/3 h-6" />
          <Skeleton variant="text" className="w-1/2 h-4" />
          <Skeleton variant="text" className="w-1/3 h-4" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton variant="rounded" className="w-16 h-6" />
        <Skeleton variant="rounded" className="w-16 h-6" />
        <Skeleton variant="rounded" className="w-16 h-6" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-6">
        <Skeleton variant="circular" width={100} height={100} />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" className="w-1/3 h-8" />
          <Skeleton variant="text" className="w-1/2 h-5" />
          <Skeleton variant="text" className="w-1/4 h-4" />
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-4">
            <Skeleton variant="text" className="w-full h-8 mb-2" />
            <Skeleton variant="text" className="w-2/3 h-4" />
          </div>
        ))}
      </div>

      {/* Content sections */}
      <div className="bg-white rounded-xl p-6 space-y-4">
        <Skeleton variant="text" className="w-1/4 h-6" />
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-3/4 h-4" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton variant="text" className="w-full h-5" />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton variant="text" className="w-20 h-4" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" className="w-48 h-8" />
          <Skeleton variant="text" className="w-32 h-4" />
        </div>
        <Skeleton variant="rounded" className="w-32 h-10" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl p-6">
            <Skeleton variant="text" className="w-1/2 h-4 mb-2" />
            <Skeleton variant="text" className="w-3/4 h-8" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 space-y-4">
          <Skeleton variant="text" className="w-32 h-6" />
          <DealGridSkeleton count={2} />
        </div>
        <div className="bg-white rounded-xl p-6 space-y-4">
          <Skeleton variant="text" className="w-24 h-6" />
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton variant="circular" width={40} height={40} />
              <div className="flex-1">
                <Skeleton variant="text" className="w-3/4 h-4" />
                <Skeleton variant="text" className="w-1/2 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InboxSkeleton() {
  return (
    <div className="divide-y">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="p-4 flex items-start gap-4">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton variant="text" className="w-32 h-5" />
              <Skeleton variant="text" className="w-16 h-4" />
            </div>
            <Skeleton variant="text" className="w-3/4 h-4" />
            <Skeleton variant="text" className="w-full h-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// CSS for wave animation - add to index.css
// @keyframes shimmer {
//   0% { background-position: -200% 0; }
//   100% { background-position: 200% 0; }
// }
// .animate-shimmer {
//   background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
//   background-size: 200% 100%;
//   animation: shimmer 1.5s infinite;
// }

