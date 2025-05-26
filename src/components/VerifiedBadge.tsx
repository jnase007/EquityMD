import React from 'react';
import { Shield, Star, CheckCircle } from 'lucide-react';

interface VerifiedBadgeProps {
  type?: 'premium' | 'verified' | 'featured';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showIcon?: boolean;
  className?: string;
}

export function VerifiedBadge({ 
  type = 'verified',
  size = 'md', 
  showText = true,
  showIcon = true,
  className = '' 
}: VerifiedBadgeProps) {
  
  const sizeConfig = {
    sm: {
      padding: 'px-2 py-1',
      text: 'text-xs',
      icon: 'h-3 w-3',
      gap: 'gap-1'
    },
    md: {
      padding: 'px-3 py-1.5',
      text: 'text-sm',
      icon: 'h-4 w-4',
      gap: 'gap-1.5'
    },
    lg: {
      padding: 'px-4 py-2',
      text: 'text-base',
      icon: 'h-5 w-5',
      gap: 'gap-2'
    }
  };

  const config = sizeConfig[size];

  const getBadgeConfig = () => {
    switch (type) {
      case 'premium':
        return {
          label: 'Premium Partner',
          icon: Shield,
          bgGradient: 'bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600',
          textColor: 'text-white',
          borderColor: 'border-transparent',
          shadow: 'shadow-lg shadow-purple-500/25',
          glow: 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-400 before:via-blue-400 before:to-indigo-500 before:rounded-full before:blur-sm before:opacity-30 before:-z-10'
        };
      case 'featured':
        return {
          label: 'Featured',
          icon: Star,
          bgGradient: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500',
          textColor: 'text-white',
          borderColor: 'border-transparent',
          shadow: 'shadow-lg shadow-yellow-500/25',
          glow: 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-300 before:via-orange-400 before:to-red-400 before:rounded-full before:blur-sm before:opacity-30 before:-z-10'
        };
      default: // verified
        return {
          label: 'Verified',
          icon: CheckCircle,
          bgGradient: 'bg-gradient-to-r from-green-500 to-emerald-600',
          textColor: 'text-white',
          borderColor: 'border-transparent',
          shadow: 'shadow-lg shadow-green-500/25',
          glow: 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-green-400 before:to-emerald-500 before:rounded-full before:blur-sm before:opacity-30 before:-z-10'
        };
    }
  };

  const badgeConfig = getBadgeConfig();
  const IconComponent = badgeConfig.icon;

  return (
    <div className={`
      relative inline-flex items-center 
      ${config.gap} 
      ${config.padding} 
      ${badgeConfig.bgGradient}
      ${badgeConfig.textColor} 
      ${badgeConfig.borderColor}
      ${badgeConfig.shadow}
      border rounded-full font-semibold
      transition-all duration-300 hover:scale-105
      ${badgeConfig.glow}
      ${className}
    `}>
      {showIcon && (
        <IconComponent className={`${config.icon} drop-shadow-sm`} />
      )}
      {showText && (
        <span className={`${config.text} font-semibold drop-shadow-sm`}>
          {badgeConfig.label}
        </span>
      )}
    </div>
  );
}

// Specialized component for syndicator verification status
export function SyndicatorVerifiedBadge({ 
  isPremium = false,
  isFeatured = false,
  size = 'md',
  showText = true,
  showIcon = true,
  className = ''
}: {
  isPremium?: boolean;
  isFeatured?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showIcon?: boolean;
  className?: string;
}) {
  if (isPremium) {
    return (
      <VerifiedBadge 
        type="premium" 
        size={size} 
        showText={showText}
        showIcon={showIcon}
        className={className}
      />
    );
  }
  
  if (isFeatured) {
    return (
      <VerifiedBadge 
        type="featured" 
        size={size} 
        showText={showText}
        showIcon={showIcon}
        className={className}
      />
    );
  }
  
  return (
    <VerifiedBadge 
      type="verified" 
      size={size} 
      showText={showText}
      showIcon={showIcon}
      className={className}
    />
  );
} 