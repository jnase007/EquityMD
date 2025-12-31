import React, { useState } from 'react';
import { Shield, Star, CheckCircle, Clock } from 'lucide-react';

interface VerifiedBadgeProps {
  type?: 'premium' | 'verified' | 'featured' | 'unverified';
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
  const [showTooltip, setShowTooltip] = useState(false);
  
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
          bgColor: 'bg-blue-600',
          textColor: 'text-white',
          borderColor: 'border-blue-600',
          shadow: 'shadow-sm',
          tooltip: 'Premium Partner - Top-tier syndicator with exceptional track record, extensive experience, and priority platform features'
        };
      case 'featured':
        return {
          label: 'Featured',
          icon: Star,
          bgColor: 'bg-orange-500',
          textColor: 'text-white',
          borderColor: 'border-orange-500',
          shadow: 'shadow-sm',
          tooltip: 'Featured Syndicator - Highlighted for outstanding performance, innovative deals, and strong investor relationships'
        };
      case 'verified':
        return {
          label: 'Verified',
          icon: CheckCircle,
          bgColor: 'bg-green-600',
          textColor: 'text-white',
          borderColor: 'border-green-600',
          shadow: 'shadow-sm',
          tooltip: 'Verified Syndicator - Identity and credentials confirmed by EquityMD. Licensed and compliant real estate professional'
        };
      case 'unverified':
        return {
          label: 'Pending Verification',
          icon: Clock,
          bgColor: 'bg-gray-400',
          textColor: 'text-white',
          borderColor: 'border-gray-400',
          shadow: 'shadow-sm',
          tooltip: 'Pending Verification - To be verified, the company must claim this profile and complete background checks and credential verification by EquityMD'
        };
      default:
        return {
          label: 'Verified',
          icon: CheckCircle,
          bgColor: 'bg-green-600',
          textColor: 'text-white',
          borderColor: 'border-green-600',
          shadow: 'shadow-sm',
          tooltip: 'Verified Syndicator - Identity and credentials confirmed by EquityMD. Licensed and compliant real estate professional'
        };
    }
  };

  const badgeConfig = getBadgeConfig();
  const IconComponent = badgeConfig.icon;

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`
        inline-flex items-center 
        ${config.gap} 
        ${config.padding} 
        ${badgeConfig.bgColor}
        ${badgeConfig.textColor} 
        ${badgeConfig.borderColor}
        ${badgeConfig.shadow}
        border rounded-full font-semibold
        transition-all duration-200 hover:opacity-90
        cursor-help
        ${className}
      `}>
        {showIcon && (
          <IconComponent className={`${config.icon}`} />
        )}
        {showText && (
          <span className={`${config.text} font-semibold`}>
            {badgeConfig.label}
          </span>
        )}
      </div>
      
      {/* Tooltip - appears below to avoid header cutoff */}
      {showTooltip && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-[100]">
          <div className="bg-gray-900 text-white text-sm rounded-lg py-3 px-4 w-72 text-center shadow-xl leading-relaxed">
            {/* Arrow pointing up */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
            {badgeConfig.tooltip}
          </div>
        </div>
      )}
    </div>
  );
}

// Specialized component for syndicator verification status
export function SyndicatorVerifiedBadge({ 
  verificationStatus = 'verified',
  size = 'md',
  showText = true,
  showIcon = true,
  className = ''
}: {
  verificationStatus?: 'unverified' | 'verified' | 'featured' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showIcon?: boolean;
  className?: string;
}) {
  // Don't show badge for unverified syndicators
  if (verificationStatus === 'unverified') {
    return null;
  }

  return (
    <VerifiedBadge 
      type={verificationStatus} 
      size={size} 
      showText={showText}
      showIcon={showIcon}
      className={className}
    />
  );
} 