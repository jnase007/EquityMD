import React, { useState, useEffect } from 'react';
import { 
  Eye, Heart, Users, TrendingUp, Clock, 
  Activity, Zap, Star, ArrowUp, MessageCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// Live Activity Indicator - Shows real-time activity
export function LiveActivityBadge({ dealId, className = '' }: { dealId?: string; className?: string }) {
  const [viewCount, setViewCount] = useState(0);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Simulate live activity - in production this would come from analytics
    const randomViews = Math.floor(Math.random() * 15) + 5;
    setViewCount(randomViews);

    const interval = setInterval(() => {
      setViewCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 30000);

    return () => clearInterval(interval);
  }, [dealId]);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
      <span className="text-sm font-medium text-red-700">
        {viewCount} viewing now
      </span>
    </div>
  );
}

// Trending Badge
export function TrendingBadge({ rank }: { rank: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white text-sm font-bold shadow-lg">
      <TrendingUp className="h-4 w-4" />
      <span>#{rank} Trending</span>
    </div>
  );
}

// Social Proof Counter - Shows action counts
interface SocialCounterProps {
  views?: number;
  saves?: number;
  inquiries?: number;
  size?: 'sm' | 'md';
  showLabels?: boolean;
}

export function SocialCounter({ 
  views = 0, 
  saves = 0, 
  inquiries = 0, 
  size = 'md',
  showLabels = true 
}: SocialCounterProps) {
  const sizeClasses = size === 'sm' ? 'text-xs gap-1' : 'text-sm gap-2';
  
  return (
    <div className={`flex items-center gap-4 ${sizeClasses}`}>
      {views > 0 && (
        <div className="flex items-center gap-1 text-gray-500">
          <Eye className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
          <span className="font-medium">{formatNumber(views)}</span>
          {showLabels && <span className="hidden sm:inline">views</span>}
        </div>
      )}
      {saves > 0 && (
        <div className="flex items-center gap-1 text-red-500">
          <Heart className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
          <span className="font-medium">{formatNumber(saves)}</span>
          {showLabels && <span className="hidden sm:inline">saves</span>}
        </div>
      )}
      {inquiries > 0 && (
        <div className="flex items-center gap-1 text-emerald-500">
          <MessageCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
          <span className="font-medium">{formatNumber(inquiries)}</span>
          {showLabels && <span className="hidden sm:inline">inquiries</span>}
        </div>
      )}
    </div>
  );
}

// Recent Activity Toast - Shows recent actions by others
interface ActivityToast {
  id: string;
  type: 'view' | 'save' | 'inquiry' | 'invest';
  location?: string;
  timeAgo: string;
}

export function RecentActivityToast({ 
  dealTitle, 
  visible, 
  onClose 
}: { 
  dealTitle: string; 
  visible: boolean; 
  onClose: () => void;
}) {
  const activities = [
    { type: 'view', icon: Eye, text: 'Someone viewed this deal', color: 'text-blue-500' },
    { type: 'save', icon: Heart, text: 'Someone saved this deal', color: 'text-red-500' },
    { type: 'inquiry', icon: MessageCircle, text: 'Someone inquired about this deal', color: 'text-emerald-500' },
  ];

  const randomActivity = activities[Math.floor(Math.random() * activities.length)];
  const locations = ['California', 'Texas', 'Florida', 'New York', 'Illinois'];
  const randomLocation = locations[Math.floor(Math.random() * locations.length)];

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-slide-up">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${randomActivity.color} bg-gray-50`}>
            <randomActivity.icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{randomActivity.text}</p>
            <p className="text-xs text-gray-500">
              An investor from {randomLocation} • Just now
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

// Investor Count Banner
export function InvestorCountBanner({ count, className = '' }: { count: number; className?: string }) {
  return (
    <div className={`bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 text-white ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6" />
          <div>
            <div className="text-2xl font-bold">{formatNumber(count)}+</div>
            <div className="text-sm opacity-90">Active Investors</div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm bg-white/20 px-3 py-1 rounded-full">
          <Zap className="h-4 w-4" />
          <span>Growing daily</span>
        </div>
      </div>
    </div>
  );
}

// Deal Demand Indicator
export function DealDemandIndicator({ 
  interestLevel = 50,
  closingDate 
}: { 
  interestLevel?: number;
  closingDate?: string;
}) {
  const getDemandLevel = () => {
    if (interestLevel >= 80) return { text: 'Very High Demand', color: 'text-red-500', bg: 'bg-red-100' };
    if (interestLevel >= 60) return { text: 'High Demand', color: 'text-orange-500', bg: 'bg-orange-100' };
    if (interestLevel >= 40) return { text: 'Moderate Interest', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    return { text: 'New Listing', color: 'text-blue-500', bg: 'bg-blue-100' };
  };

  const demand = getDemandLevel();
  const daysLeft = closingDate 
    ? Math.max(0, Math.ceil((new Date(closingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className={`font-medium ${demand.color}`}>{demand.text}</span>
        {daysLeft !== null && daysLeft <= 30 && (
          <span className="flex items-center gap-1 text-red-500">
            <Clock className="h-4 w-4" />
            {daysLeft} days left
          </span>
        )}
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400 transition-all duration-1000"
          style={{ width: `${interestLevel}%` }}
        />
      </div>
    </div>
  );
}

// Testimonial Carousel
interface Testimonial {
  quote: string;
  author: string;
  role: string;
  investment?: string;
  avatar?: string;
}

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const current = testimonials[currentIndex];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
        ))}
      </div>
      <blockquote className="text-gray-700 mb-4 min-h-[80px]">
        "{current.quote}"
      </blockquote>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
          {current.author.charAt(0)}
        </div>
        <div>
          <div className="font-medium text-gray-900">{current.author}</div>
          <div className="text-sm text-gray-500">{current.role}</div>
        </div>
        {current.investment && (
          <div className="ml-auto px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
            Invested {current.investment}
          </div>
        )}
      </div>
      
      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition ${
              i === currentIndex ? 'bg-emerald-500 w-6' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Live Stats Bar for Homepage
export function LiveStatsBar() {
  const [stats, setStats] = useState({
    activeDeals: 127,
    investorsToday: 45,
    capitalRaised: 892000000,
  });

  useEffect(() => {
    // Simulate live updates
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        investorsToday: prev.investorsToday + (Math.random() > 0.7 ? 1 : 0),
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 text-white py-2 overflow-hidden">
      <div className="flex items-center justify-center gap-8 animate-pulse-slow">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <span className="text-sm">
            <strong>{stats.activeDeals}</strong> Active Deals
          </span>
        </div>
        <div className="w-px h-4 bg-gray-600" />
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-400" />
          <span className="text-sm">
            <strong>{stats.investorsToday}</strong> Investors Today
          </span>
        </div>
        <div className="w-px h-4 bg-gray-600" />
        <div className="flex items-center gap-2">
          <ArrowUp className="h-4 w-4 text-emerald-400" />
          <span className="text-sm">
            <strong>${formatNumber(stats.capitalRaised)}</strong> Total Capital
          </span>
        </div>
      </div>
    </div>
  );
}

// Helper function
function formatNumber(num: number): string {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// CSS for animations (add to index.css)
const styles = `
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
`;

