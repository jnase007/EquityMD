import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

const LOCAL_STORAGE_KEY = 'equitymd_guest_favorites';

interface FavoriteButtonProps {
  dealId: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  onAuthRequired?: () => void;
}

export function FavoriteButton({ 
  dealId, 
  size = 'md', 
  showText = false,
  className = '',
  onAuthRequired
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
    } else {
      // Check localStorage for guest favorites
      checkGuestFavorite();
    }
  }, [user, dealId]);

  function checkGuestFavorite() {
    try {
      const guestFavorites = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      setIsFavorited(guestFavorites.includes(dealId));
    } catch {
      setIsFavorited(false);
    }
  }

  function toggleGuestFavorite() {
    try {
      const guestFavorites = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      if (guestFavorites.includes(dealId)) {
        const updated = guestFavorites.filter((id: string) => id !== dealId);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        setIsFavorited(false);
      } else {
        guestFavorites.push(dealId);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(guestFavorites));
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('Error saving guest favorite:', err);
    }
  }

  async function checkFavoriteStatus() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('investor_id', user.id)
        .eq('deal_id', dealId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking favorite status:', error);
        return;
      }

      setIsFavorited(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }

  async function toggleFavorite() {
    // Guest user - save to localStorage and optionally prompt to sign in
    if (!user) {
      toggleGuestFavorite();
      // Optionally show auth modal after favoriting
      if (onAuthRequired && !isFavorited) {
        setTimeout(() => {
          onAuthRequired();
        }, 500);
      }
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorited) {
        // Remove favorite
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('investor_id', user.id)
          .eq('deal_id', dealId);

        if (error) throw error;
        setIsFavorited(false);
      } else {
        // Add favorite
        const { error } = await supabase
          .from('favorites')
          .insert({
            investor_id: user.id,
            deal_id: dealId
          });

        if (error) throw error;
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`
        ${buttonSizeClasses[size]}
        ${isFavorited 
          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
        }
        border-2 rounded-lg
        transition-all duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        font-medium
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
      {(showText || className.includes('w-full')) && (
        <span className="text-sm font-medium">
          {isLoading ? 'Saving...' : isFavorited ? 'Favorited' : 'Add to Favorites'}
        </span>
      )}
    </button>
  );
} 