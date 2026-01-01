import React from 'react';
import { Shield, Award, Star, TrendingUp, CheckCircle, Gem, Zap, Crown } from 'lucide-react';

export type InvestorBadgeType = 
  | 'accredited'
  | 'active_investor'
  | 'repeat_investor'
  | 'early_adopter'
  | 'top_investor'
  | 'verified';

interface InvestorBadge {
  type: InvestorBadgeType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const BADGE_CONFIG: Record<InvestorBadgeType, Omit<InvestorBadge, 'type'>> = {
  accredited: {
    label: 'Accredited',
    description: 'Verified accredited investor',
    icon: <Shield className="h-3.5 w-3.5" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  active_investor: {
    label: 'Active',
    description: '5+ deal inquiries',
    icon: <Zap className="h-3.5 w-3.5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  repeat_investor: {
    label: 'Repeat',
    description: 'Invested in multiple deals',
    icon: <Star className="h-3.5 w-3.5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  early_adopter: {
    label: 'Early Adopter',
    description: 'Joined in first 1000 users',
    icon: <Award className="h-3.5 w-3.5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  top_investor: {
    label: 'Top Investor',
    description: 'Top 10% by activity',
    icon: <Crown className="h-3.5 w-3.5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  verified: {
    label: 'Verified',
    description: 'Identity verified',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
};

interface InvestorBadgeProps {
  type: InvestorBadgeType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function InvestorBadge({ type, size = 'sm', showLabel = true }: InvestorBadgeProps) {
  const config = BADGE_CONFIG[type];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  return (
    <div 
      className={`inline-flex items-center rounded-full ${config.bgColor} ${config.color} ${sizeClasses[size]}`}
      title={config.description}
    >
      {config.icon}
      {showLabel && <span className="font-medium">{config.label}</span>}
    </div>
  );
}

interface InvestorBadgesListProps {
  badges: InvestorBadgeType[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
}

export function InvestorBadgesList({ badges, size = 'sm', maxDisplay = 3 }: InvestorBadgesListProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {displayBadges.map((badge) => (
        <InvestorBadge key={badge} type={badge} size={size} />
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-gray-500 ml-1">+{remainingCount} more</span>
      )}
    </div>
  );
}

// Calculate badges based on investor data
export function calculateInvestorBadges(investorData: {
  accredited_status?: boolean;
  inquiry_count?: number;
  investment_count?: number;
  created_at?: string;
  is_verified?: boolean;
}): InvestorBadgeType[] {
  const badges: InvestorBadgeType[] = [];

  if (investorData.accredited_status) {
    badges.push('accredited');
  }

  if (investorData.is_verified) {
    badges.push('verified');
  }

  if (investorData.inquiry_count && investorData.inquiry_count >= 5) {
    badges.push('active_investor');
  }

  if (investorData.investment_count && investorData.investment_count >= 2) {
    badges.push('repeat_investor');
  }

  // Early adopter - joined before a certain date
  if (investorData.created_at) {
    const joinDate = new Date(investorData.created_at);
    const earlyAdopterCutoff = new Date('2025-06-01');
    if (joinDate < earlyAdopterCutoff) {
      badges.push('early_adopter');
    }
  }

  // Top investor - high activity
  if (investorData.inquiry_count && investorData.inquiry_count >= 15) {
    badges.push('top_investor');
  }

  return badges;
}

