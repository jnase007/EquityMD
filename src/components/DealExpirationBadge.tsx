import React from 'react';
import { Clock, AlertTriangle, Flame } from 'lucide-react';

interface DealExpirationBadgeProps {
  closingDate: string | null;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function DealExpirationBadge({ 
  closingDate, 
  className = '',
  showIcon = true,
  size = 'md'
}: DealExpirationBadgeProps) {
  if (!closingDate) return null;

  const closing = new Date(closingDate);
  const now = new Date();
  const daysRemaining = Math.ceil((closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium ${className}`}>
        Closed
      </span>
    );
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  // Urgency levels
  if (daysRemaining <= 3) {
    return (
      <span className={`inline-flex items-center bg-red-100 text-red-700 rounded-full font-semibold animate-pulse ${sizeClasses[size]} ${className}`}>
        {showIcon && <Flame className={iconSizes[size]} />}
        {daysRemaining === 0 ? 'Closes Today!' : daysRemaining === 1 ? 'Closes Tomorrow!' : `${daysRemaining} days left!`}
      </span>
    );
  }

  if (daysRemaining <= 7) {
    return (
      <span className={`inline-flex items-center bg-amber-100 text-amber-700 rounded-full font-medium ${sizeClasses[size]} ${className}`}>
        {showIcon && <AlertTriangle className={iconSizes[size]} />}
        {daysRemaining} days left
      </span>
    );
  }

  if (daysRemaining <= 14) {
    return (
      <span className={`inline-flex items-center bg-yellow-100 text-yellow-700 rounded-full font-medium ${sizeClasses[size]} ${className}`}>
        {showIcon && <Clock className={iconSizes[size]} />}
        {daysRemaining} days left
      </span>
    );
  }

  if (daysRemaining <= 30) {
    return (
      <span className={`inline-flex items-center bg-blue-100 text-blue-700 rounded-full font-medium ${sizeClasses[size]} ${className}`}>
        {showIcon && <Clock className={iconSizes[size]} />}
        {daysRemaining} days left
      </span>
    );
  }

  // More than 30 days - show formatted date
  return (
    <span className={`inline-flex items-center bg-gray-100 text-gray-600 rounded-full font-medium ${sizeClasses[size]} ${className}`}>
      {showIcon && <Clock className={iconSizes[size]} />}
      Closes {closing.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
    </span>
  );
}

/**
 * Get deals that are expiring soon for a user's favorites
 */
export async function getExpiringFavorites(userId: string, daysThreshold: number = 7) {
  const { supabase } = await import('../lib/supabase');
  
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      deal_id,
      deals (
        id,
        title,
        slug,
        closing_date,
        cover_image_url
      )
    `)
    .eq('user_id', userId);

  if (error || !data) return [];

  return data
    .filter((fav: any) => {
      if (!fav.deals?.closing_date) return false;
      const closing = new Date(fav.deals.closing_date);
      return closing <= thresholdDate && closing >= new Date();
    })
    .map((fav: any) => fav.deals);
}

/**
 * Calculate urgency score for sorting
 */
export function getUrgencyScore(closingDate: string | null): number {
  if (!closingDate) return 0;
  
  const closing = new Date(closingDate);
  const now = new Date();
  const daysRemaining = Math.ceil((closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysRemaining < 0) return 0;
  if (daysRemaining <= 3) return 100;
  if (daysRemaining <= 7) return 80;
  if (daysRemaining <= 14) return 60;
  if (daysRemaining <= 30) return 40;
  return 20;
}

