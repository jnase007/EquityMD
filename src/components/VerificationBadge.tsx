import React, { useState } from 'react';
import { Shield, ShieldCheck, Crown, Info } from 'lucide-react';

export type VerificationStatus = 'unverified' | 'verified' | 'premier';

interface VerificationBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const verificationConfig = {
  unverified: {
    color: 'bg-gray-500',
    textColor: 'text-white',
    borderColor: 'border-gray-500',
    icon: Shield,
    text: 'Unverified',
    tooltip: 'Not reviewed. Contact directly. EquityMD does not endorse.',
    description: 'This syndicator has not yet been reviewed by our team.'
  },
  verified: {
    color: 'bg-blue-600',
    textColor: 'text-white',
    borderColor: 'border-blue-600',
    icon: ShieldCheck,
    text: 'Verified',
    tooltip: 'Identity confirmed. Contact for details. EquityMD does not endorse.',
    description: 'This syndicator\'s identity and basic information have been confirmed.'
  },
  premier: {
    color: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    textColor: 'text-white',
    borderColor: 'border-yellow-500',
    icon: Crown,
    text: 'Premier Partner',
    tooltip: 'Trusted partner, selected for experience. Contact for opportunities. EquityMD does not endorse.',
    description: 'This syndicator is a trusted partner with proven experience and track record.'
  }
};

const sizeConfig = {
  sm: {
    badge: 'px-2 py-1 text-xs',
    icon: 'h-3 w-3',
    tooltip: 'text-xs w-64'
  },
  md: {
    badge: 'px-3 py-1.5 text-sm',
    icon: 'h-4 w-4',
    tooltip: 'text-sm w-72'
  },
  lg: {
    badge: 'px-4 py-2 text-base',
    icon: 'h-5 w-5',
    tooltip: 'text-base w-80'
  }
};

export function VerificationBadge({ 
  status, 
  size = 'md', 
  showTooltip = true 
}: VerificationBadgeProps) {
  const [showTooltipState, setShowTooltipState] = useState(false);
  const config = verificationConfig[status];
  const sizeStyles = sizeConfig[size];
  const IconComponent = config.icon;

  return (
    <div className="relative inline-block">
      <div
        className={`
          inline-flex items-center gap-1.5 rounded-full font-medium
          ${config.color} ${config.textColor} ${sizeStyles.badge}
          cursor-help transition-all duration-200 hover:shadow-lg
        `}
        onMouseEnter={() => showTooltip && setShowTooltipState(true)}
        onMouseLeave={() => showTooltip && setShowTooltipState(false)}
      >
        <IconComponent className={sizeStyles.icon} />
        <span>{config.text}</span>
      </div>

      {/* Tooltip */}
      {showTooltip && showTooltipState && (
        <div className={`
          absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50
          bg-white border border-gray-200 rounded-lg shadow-lg p-3
          ${sizeStyles.tooltip}
        `}>
          <div className="text-gray-900 font-medium mb-1">
            {config.text}
          </div>
          <div className="text-gray-600">
            {config.tooltip}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
        </div>
      )}
    </div>
  );
}

export function VerificationDescription({ status }: { status: VerificationStatus }) {
  const config = verificationConfig[status];
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h4 className="text-blue-900 font-medium mb-1">Verification Status</h4>
          <p className="text-blue-800 text-sm mb-2">
            {config.description}
          </p>
          <p className="text-blue-700 text-xs">
            EquityMD is a marketplace only. We do not endorse or guarantee any syndicator or investment opportunity.
          </p>
        </div>
      </div>
    </div>
  );
} 