import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface FavoriteButtonProps {
  dealId: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function FavoriteButton({ 
  dealId, 
  size = 'md', 
  showText = false,
  className = '' 
}: FavoriteButtonProps) {
  const { user } = useAuthStore();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  // Check if deal is favorited on component mount
  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, dealId]);

  async function checkFavoriteStatus() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('investor_id', user.id)
        .eq('deal_id', dealId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking favorite status:', error);
        return;
      }

      setIsFavorited(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }

  async function toggleFavorite() {
    if (!user) {
      console.log('No user - cannot favorite');
      // Could trigger auth modal here
      return;
    }

    console.log('Toggling favorite for deal:', dealId, 'Current state:', isFavorited);
    setIsLoading(true);

    try {
      if (isFavorited) {
        // Remove favorite
        console.log('Removing favorite...');
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('investor_id', user.id)
          .eq('deal_id', dealId);

        if (error) {
          console.error('Error removing favorite:', error);
          throw error;
        }
        console.log('Favorite removed successfully');
        setIsFavorited(false);
      } else {
        // Add favorite
        console.log('Adding favorite...');
        const { error } = await supabase
          .from('favorites')
          .insert({
            investor_id: user.id,
            deal_id: dealId
          });

        if (error) {
          console.error('Error adding favorite:', error);
          throw error;
        }
        console.log('Favorite added successfully');
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Show user-friendly error message
      alert(`Error ${isFavorited ? 'removing' : 'adding'} favorite. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) {
    return null; // Don't show favorite button if not logged in
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`
        ${buttonSizeClasses[size]}
        ${isFavorited 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-500'
        }
        transition-all duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center gap-2
        hover:scale-105 active:scale-95
        ${className}
      `}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart 
        className={`
          ${sizeClasses[size]} 
          ${isFavorited ? 'fill-red-500 text-red-500' : 'fill-none'} 
          transition-all duration-200 ease-in-out
          ${isLoading ? 'animate-pulse' : ''}
        `} 
      />
      {showText && (
        <span className="text-sm font-medium">
          {isLoading ? 'Saving...' : isFavorited ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </button>
  );
} 