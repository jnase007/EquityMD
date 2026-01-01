import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Search, Building2, MessageSquare, Bell, 
  FileText, Users, TrendingUp, Calendar, Target
} from 'lucide-react';

interface EmptyStateProps {
  type: 'favorites' | 'deals' | 'messages' | 'notifications' | 'syndicators' | 'investments' | 'interests' | 'calendar' | 'goals';
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

const emptyStateConfig = {
  favorites: {
    icon: Heart,
    iconColor: 'text-rose-400',
    bgColor: 'bg-rose-50',
    title: 'No saved deals yet',
    description: 'Start exploring investment opportunities and save your favorites for later.',
    actionLabel: 'Browse Deals',
    actionHref: '/find',
  },
  deals: {
    icon: Building2,
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-50',
    title: 'No deals found',
    description: 'We couldn\'t find any deals matching your criteria. Try adjusting your filters.',
    actionLabel: 'Clear Filters',
  },
  messages: {
    icon: MessageSquare,
    iconColor: 'text-emerald-400',
    bgColor: 'bg-emerald-50',
    title: 'No messages yet',
    description: 'When syndicators respond to your inquiries, messages will appear here.',
    actionLabel: 'Find Deals',
    actionHref: '/find',
  },
  notifications: {
    icon: Bell,
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-50',
    title: 'All caught up!',
    description: 'You have no new notifications. Check back later for updates on your deals.',
  },
  syndicators: {
    icon: Users,
    iconColor: 'text-indigo-400',
    bgColor: 'bg-indigo-50',
    title: 'No syndicators found',
    description: 'We couldn\'t find any syndicators matching your search.',
    actionLabel: 'View All Syndicators',
    actionHref: '/directory',
  },
  investments: {
    icon: TrendingUp,
    iconColor: 'text-green-400',
    bgColor: 'bg-green-50',
    title: 'No investments yet',
    description: 'Your investment portfolio will appear here once you invest in deals.',
    actionLabel: 'Browse Opportunities',
    actionHref: '/find',
  },
  interests: {
    icon: FileText,
    iconColor: 'text-purple-400',
    bgColor: 'bg-purple-50',
    title: 'No interest requests',
    description: 'Deals you\'ve expressed interest in will appear here.',
    actionLabel: 'Find Deals',
    actionHref: '/find',
  },
  calendar: {
    icon: Calendar,
    iconColor: 'text-cyan-400',
    bgColor: 'bg-cyan-50',
    title: 'No upcoming events',
    description: 'Webinars and deal deadlines will appear on your calendar.',
    actionLabel: 'Browse Deals',
    actionHref: '/find',
  },
  goals: {
    icon: Target,
    iconColor: 'text-orange-400',
    bgColor: 'bg-orange-50',
    title: 'No investment goals set',
    description: 'Set your first investment goal to track your progress.',
    actionLabel: 'Set a Goal',
  },
};

export function EmptyState({ 
  type, 
  title, 
  description, 
  actionLabel, 
  actionHref,
  onAction 
}: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = config.icon;
  
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayActionLabel = actionLabel || config.actionLabel;
  const displayActionHref = actionHref || config.actionHref;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className={`p-4 rounded-full ${config.bgColor} mb-4`}>
        <Icon className={`h-8 w-8 ${config.iconColor}`} />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {displayTitle}
      </h3>
      
      <p className="text-gray-500 max-w-sm mb-6">
        {displayDescription}
      </p>
      
      {(displayActionLabel && displayActionHref) ? (
        <Link
          to={displayActionHref}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <Search className="h-4 w-4" />
          {displayActionLabel}
        </Link>
      ) : displayActionLabel && onAction ? (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          {displayActionLabel}
        </button>
      ) : null}
    </div>
  );
}

// Compact version for smaller spaces
export function EmptyStateCompact({ 
  icon: Icon, 
  message 
}: { 
  icon: React.ElementType; 
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
      <Icon className="h-6 w-6 mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

