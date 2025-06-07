import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface LoadingSkeletonProps {
  type: 'property' | 'syndicator';
  count?: number;
}

export function LoadingSkeleton({ type, count = 3 }: LoadingSkeletonProps) {
  if (type === 'property') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Property Image Skeleton */}
            <div className="relative">
              <Skeleton height={200} className="block" />
            </div>
            
            {/* Property Content Skeleton */}
            <div className="p-6">
              {/* Title */}
              <Skeleton height={24} className="mb-2" />
              
              {/* Location and Type */}
              <div className="flex items-center justify-between mb-3">
                <Skeleton height={16} width="60%" />
                <Skeleton height={20} width={80} />
              </div>
              
              {/* Investment details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Skeleton height={12} width="50%" className="mb-1" />
                  <Skeleton height={20} width="80%" />
                </div>
                <div>
                  <Skeleton height={12} width="50%" className="mb-1" />
                  <Skeleton height={20} width="80%" />
                </div>
              </div>
              
              {/* Button */}
              <Skeleton height={40} className="rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'syndicator') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            {/* Syndicator Header */}
            <div className="flex items-center mb-4">
              {/* Logo */}
              <Skeleton circle height={50} width={50} className="mr-4" />
              
              {/* Company Info */}
              <div className="flex-1">
                <Skeleton height={20} width="80%" className="mb-1" />
                <Skeleton height={16} width="60%" />
              </div>
            </div>
            
            {/* Rating and Reviews */}
            <div className="flex items-center mb-3">
              <Skeleton height={16} width={100} className="mr-2" />
              <Skeleton height={16} width={80} />
            </div>
            
            {/* Description */}
            <Skeleton height={16} count={3} className="mb-4" />
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Skeleton height={12} width="60%" className="mb-1" />
                <Skeleton height={18} width="80%" />
              </div>
              <div>
                <Skeleton height={12} width="60%" className="mb-1" />
                <Skeleton height={18} width="80%" />
              </div>
            </div>
            
            {/* Action Button */}
            <Skeleton height={36} className="rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return null;
} 