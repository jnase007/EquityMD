import React from 'react';
import { User, Building2, Shield, Star } from 'lucide-react';
import { SyndicatorVerifiedBadge } from './VerifiedBadge';

interface AccountTypeBadgeProps {
  userType: 'investor' | 'syndicator';
  isAdmin?: boolean;
  isVerified?: boolean;
  isPremium?: boolean;
  isFeatured?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export function AccountTypeBadge({ 
  userType, 
  isAdmin = false, 
  isVerified = false,
  isPremium = false,
  isFeatured = false,
  size = 'md', 
  showIcon = true, 
  showText = true,
  className = '' 
}: AccountTypeBadgeProps) {
  
  // Determine account type display
  const getAccountInfo = () => {
    if (isAdmin) {
      return {
        label: 'Admin',
        icon: Shield,
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        borderColor: 'border-purple-200'
      };
    }
    
    if (userType === 'syndicator') {
      return {
        label: 'Syndicator',
        icon: Building2,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200'
      };
    }
    
    return {
      label: 'Investor',
      icon: User,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200'
    };
  };

  const accountInfo = getAccountInfo();
  const IconComponent = accountInfo.icon;

  // Size configurations
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

  // For verified syndicators, show the premium gradient badge instead
  if (userType === 'syndicator' && (isVerified || isPremium || isFeatured)) {
    return (
      <SyndicatorVerifiedBadge 
        isPremium={isPremium}
        isFeatured={isFeatured}
        size={size}
        showText={showText}
        showIcon={showIcon}
        className={className}
      />
    );
  }

  return (
    <div className={`
      inline-flex items-center 
      ${config.gap} 
      ${config.padding} 
      ${accountInfo.bgColor} 
      ${accountInfo.textColor} 
      ${accountInfo.borderColor}
      border rounded-full font-medium
      ${className}
    `}>
      {showIcon && (
        <IconComponent className={config.icon} />
      )}
      {showText && (
        <span className={config.text}>
          {accountInfo.label}
        </span>
      )}
      {isVerified && userType !== 'syndicator' && (
        <Star className={`${config.icon} text-yellow-500`} fill="currentColor" />
      )}
    </div>
  );
}

// Utility component for just showing account type in text with color
export function AccountTypeText({ 
  userType, 
  isAdmin = false, 
  className = '' 
}: Pick<AccountTypeBadgeProps, 'userType' | 'isAdmin' | 'className'>) {
  const accountInfo = (() => {
    if (isAdmin) return { label: 'Admin', color: 'text-purple-600' };
    if (userType === 'syndicator') return { label: 'Syndicator', color: 'text-blue-600' };
    return { label: 'Investor', color: 'text-green-600' };
  })();

  return (
    <span className={`font-medium ${accountInfo.color} ${className}`}>
      {accountInfo.label}
    </span>
  );
} 