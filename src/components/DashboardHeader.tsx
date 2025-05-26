import React from 'react';
import { User, Building2, Star } from 'lucide-react';
import { AccountTypeBadge } from './AccountTypeBadge';

interface DashboardHeaderProps {
  user: {
    email?: string;
  };
  profile: {
    full_name?: string | null;
    avatar_url?: string | null;
    user_type: 'investor' | 'syndicator';
    is_admin?: boolean;
    is_verified?: boolean;
  };
  title: string;
  subtitle?: string;
  showAccountInfo?: boolean;
}

export function DashboardHeader({ 
  user, 
  profile, 
  title, 
  subtitle,
  showAccountInfo = true 
}: DashboardHeaderProps) {
  const getWelcomeMessage = () => {
    const name = profile.full_name || user.email?.split('@')[0] || 'User';
    
    if (profile.is_admin) {
      return `Welcome back, ${name}`;
    }
    
    if (profile.user_type === 'syndicator') {
      return `Welcome to your syndicator dashboard, ${name}`;
    }
    
    return `Welcome to your investor dashboard, ${name}`;
  };

  const getAccountTypeDescription = () => {
    if (profile.is_admin) {
      return 'You have full administrative access to the EquityMD platform.';
    }
    
    if (profile.user_type === 'syndicator') {
      return 'Manage your deals, track investor interest, and grow your syndication business.';
    }
    
    return 'Discover investment opportunities and manage your portfolio.';
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User'}
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <User className="h-10 w-10 text-white" />
              )}
            </div>

            {/* User Info */}
            <div>
              {showAccountInfo && (
                <div className="mb-2">
                  <AccountTypeBadge
                    userType={profile.user_type}
                    isAdmin={profile.is_admin}
                    isVerified={profile.is_verified}
                    size="md"
                    className="bg-white/20 text-white border-white/30"
                  />
                </div>
              )}
              
              <h1 className="text-3xl font-bold mb-2">
                {title}
              </h1>
              
              {subtitle && (
                <p className="text-blue-100 text-lg">
                  {subtitle}
                </p>
              )}
              
              {showAccountInfo && (
                <>
                  <p className="text-blue-100 mt-1">
                    {getWelcomeMessage()}
                  </p>
                  <p className="text-blue-200 text-sm mt-1">
                    {getAccountTypeDescription()}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Verification Status */}
          {profile.is_verified && (
            <div className="hidden md:flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
              <Star className="h-5 w-5 text-yellow-300" fill="currentColor" />
              <span className="text-sm font-medium">Verified Account</span>
            </div>
          )}
        </div>

        {/* Quick Stats or Actions could go here */}
        {profile.user_type === 'syndicator' && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold">
                -
              </div>
              <div className="text-sm text-blue-100">
                Active Deals
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold">
                -
              </div>
              <div className="text-sm text-blue-100">
                Total Investors
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold">
                -
              </div>
              <div className="text-sm text-blue-100">
                Total Volume
              </div>
            </div>
          </div>
        )}

        {profile.user_type === 'investor' && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold">
                -
              </div>
              <div className="text-sm text-blue-100">
                Investments
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold">
                -
              </div>
              <div className="text-sm text-blue-100">
                Interested Deals
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold">
                -
              </div>
              <div className="text-sm text-blue-100">
                Portfolio Value
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 