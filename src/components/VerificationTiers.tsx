import React from 'react';
import { 
  Shield, CheckCircle, Award, Crown, Gem,
  FileCheck, User, Building2, Star, TrendingUp
} from 'lucide-react';

export type VerificationTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'unverified';

interface TierConfig {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  requirements: string[];
  benefits: string[];
}

const TIER_CONFIG: Record<VerificationTier, TierConfig> = {
  unverified: {
    name: 'Unverified',
    description: 'Complete verification to build trust',
    icon: <Shield className="h-5 w-5" />,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    requirements: ['Create account', 'Add company info'],
    benefits: ['List deals', 'Basic profile'],
  },
  bronze: {
    name: 'Bronze',
    description: 'Email & identity verified',
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    requirements: ['Email verified', 'Phone verified', 'Company details complete'],
    benefits: ['Verified badge', 'Priority support', 'Analytics access'],
  },
  silver: {
    name: 'Silver',
    description: 'Documents verified',
    icon: <Award className="h-5 w-5" />,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    requirements: ['All Bronze requirements', 'Business license verified', 'SEC filings submitted'],
    benefits: ['Featured in directory', 'Enhanced analytics', 'Investor matching'],
  },
  gold: {
    name: 'Gold',
    description: 'Background checked',
    icon: <Crown className="h-5 w-5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    requirements: ['All Silver requirements', 'Background check passed', '1+ successful deals'],
    benefits: ['Gold badge', 'Top of search results', 'Dedicated account manager'],
  },
  diamond: {
    name: 'Diamond',
    description: 'Elite track record',
    icon: <Gem className="h-5 w-5" />,
    color: 'text-cyan-600',
    bgColor: 'bg-gradient-to-r from-cyan-50 to-blue-50',
    borderColor: 'border-cyan-300',
    requirements: ['All Gold requirements', '3+ successful exits', '$10M+ total raised'],
    benefits: ['Diamond badge', 'Homepage feature', 'Priority investor access', 'Exclusive events'],
  },
};

interface VerificationTierBadgeProps {
  tier: VerificationTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function VerificationTierBadge({ tier, size = 'md', showLabel = true }: VerificationTierBadgeProps) {
  const config = TIER_CONFIG[tier];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  if (tier === 'unverified') return null;

  return (
    <div 
      className={`inline-flex items-center rounded-full ${config.bgColor} ${config.color} border ${config.borderColor} ${sizeClasses[size]}`}
      title={config.description}
    >
      {React.cloneElement(config.icon as React.ReactElement, { className: iconSizes[size] })}
      {showLabel && <span className="font-semibold">{config.name}</span>}
    </div>
  );
}

interface VerificationTierCardProps {
  tier: VerificationTier;
  isCurrentTier?: boolean;
  onUpgrade?: () => void;
}

export function VerificationTierCard({ tier, isCurrentTier, onUpgrade }: VerificationTierCardProps) {
  const config = TIER_CONFIG[tier];

  return (
    <div className={`rounded-2xl border-2 p-6 ${isCurrentTier ? config.borderColor : 'border-gray-200'} ${isCurrentTier ? config.bgColor : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${config.bgColor} ${config.color}`}>
            {config.icon}
          </div>
          <div>
            <h3 className={`font-bold ${config.color}`}>{config.name}</h3>
            <p className="text-sm text-gray-500">{config.description}</p>
          </div>
        </div>
        {isCurrentTier && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
            Current
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements</h4>
          <ul className="space-y-1">
            {config.requirements.map((req, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-gray-400" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Benefits</h4>
          <ul className="space-y-1">
            {config.benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="h-4 w-4 text-amber-400" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {onUpgrade && !isCurrentTier && tier !== 'unverified' && (
          <button
            onClick={onUpgrade}
            className={`w-full py-2 rounded-xl font-medium ${config.bgColor} ${config.color} hover:opacity-80 transition`}
          >
            Upgrade to {config.name}
          </button>
        )}
      </div>
    </div>
  );
}

export function VerificationTiersOverview({ currentTier = 'unverified' }: { currentTier?: VerificationTier }) {
  const tiers: VerificationTier[] = ['bronze', 'silver', 'gold', 'diamond'];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Verification Tiers</h3>
            <p className="text-white/80 text-sm">Build trust with verified credentials</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {tiers.map((tier, i) => (
              <div 
                key={tier} 
                className={`text-xs font-medium ${
                  tiers.indexOf(currentTier as VerificationTier) >= i 
                    ? TIER_CONFIG[tier].color 
                    : 'text-gray-400'
                }`}
              >
                {TIER_CONFIG[tier].name}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-cyan-400 transition-all duration-500"
              style={{ width: `${(tiers.indexOf(currentTier as VerificationTier) + 1) / tiers.length * 100}%` }}
            />
          </div>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tiers.map((tier) => (
            <VerificationTierCard
              key={tier}
              tier={tier}
              isCurrentTier={currentTier === tier}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper to calculate tier based on syndicator data
export function calculateVerificationTier(syndicatorData: {
  email_verified?: boolean;
  phone_verified?: boolean;
  documents_verified?: boolean;
  background_checked?: boolean;
  successful_exits?: number;
  total_raised?: number;
}): VerificationTier {
  const {
    email_verified,
    phone_verified,
    documents_verified,
    background_checked,
    successful_exits = 0,
    total_raised = 0,
  } = syndicatorData;

  // Diamond: 3+ exits and $10M+ raised
  if (background_checked && successful_exits >= 3 && total_raised >= 10000000) {
    return 'diamond';
  }

  // Gold: Background checked with 1+ successful deal
  if (background_checked && successful_exits >= 1) {
    return 'gold';
  }

  // Silver: Documents verified
  if (documents_verified) {
    return 'silver';
  }

  // Bronze: Email and phone verified
  if (email_verified && phone_verified) {
    return 'bronze';
  }

  return 'unverified';
}

