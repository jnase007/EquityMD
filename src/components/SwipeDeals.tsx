import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Heart, Info, MapPin, DollarSign, TrendingUp,
  Building2, Clock, ChevronLeft, ChevronRight, Star,
  RefreshCw, Eye, Share2, Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface Deal {
  id: string;
  title: string;
  slug: string;
  property_type: string;
  location: string;
  minimum_investment: number;
  target_irr: number;
  equity_multiple: number;
  closing_date: string;
  images: string[];
  description: string;
  total_raise: number;
}

export function SwipeDeals() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentDeal = deals[currentIndex];

  const handleSwipe = async (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    
    // Animate out
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (direction === 'right' && user) {
      // Save to favorites
      await supabase
        .from('favorites')
        .upsert({ user_id: user.id, deal_id: currentDeal.id });
    }
    
    // Move to next card
    setSwipeDirection(null);
    setDragOffset({ x: 0, y: 0 });
    
    if (currentIndex < deals.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragOffset({
      x: clientX - startPos.current.x,
      y: (clientY - startPos.current.y) * 0.2, // Reduce vertical movement
    });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 100;
    
    if (dragOffset.x > threshold) {
      handleSwipe('right');
    } else if (dragOffset.x < -threshold) {
      handleSwipe('left');
    } else {
      // Reset position
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const getCardStyle = () => {
    if (swipeDirection) {
      return {
        transform: `translateX(${swipeDirection === 'right' ? 500 : -500}px) rotate(${swipeDirection === 'right' ? 20 : -20}deg)`,
        transition: 'transform 0.3s ease-out',
        opacity: 0,
      };
    }
    
    const rotation = dragOffset.x * 0.05;
    return {
      transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
      transition: isDragging ? 'none' : 'transform 0.3s ease-out',
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getDaysUntilClose = (dateStr: string) => {
    if (!dateStr) return null;
    const today = new Date();
    const closeDate = new Date(dateStr);
    const days = Math.ceil((closeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (currentIndex >= deals.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-center px-4">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-6">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">You've seen all deals!</h3>
        <p className="text-gray-500 mb-6">Check back later for new opportunities</p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            fetchDeals();
          }}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Daily Picks
        </h2>
        <div className="text-sm text-gray-500">
          {currentIndex + 1} / {deals.length}
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative h-[520px] mx-4">
        {/* Background cards */}
        {deals.slice(currentIndex + 1, currentIndex + 3).map((deal, i) => (
          <div
            key={deal.id}
            className="absolute inset-0 bg-white rounded-3xl shadow-lg"
            style={{
              transform: `scale(${1 - (i + 1) * 0.05}) translateY(${(i + 1) * 10}px)`,
              zIndex: -i - 1,
              opacity: 1 - (i + 1) * 0.2,
            }}
          >
            {deal.images?.[0] && (
              <img 
                src={deal.images[0]} 
                alt={`${deal.title} property`}
                className="w-full h-64 object-cover rounded-t-3xl"
              />
            )}
          </div>
        ))}

        {/* Active card */}
        {currentDeal && (
          <div
            ref={cardRef}
            className="absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
            style={getCardStyle()}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            {/* Swipe indicators */}
            <div 
              className="absolute top-8 left-8 z-20 px-6 py-2 bg-red-500 text-white font-bold text-xl rounded-xl transform -rotate-12"
              style={{ opacity: Math.min(1, Math.max(0, -dragOffset.x / 100)) }}
            >
              PASS
            </div>
            <div 
              className="absolute top-8 right-8 z-20 px-6 py-2 bg-emerald-500 text-white font-bold text-xl rounded-xl transform rotate-12"
              style={{ opacity: Math.min(1, Math.max(0, dragOffset.x / 100)) }}
            >
              SAVE
            </div>

            {/* Image */}
            <div className="relative h-64">
              {currentDeal.images?.[0] ? (
                <img 
                  src={currentDeal.images[0]} 
                  alt={currentDeal.title}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-gray-400" />
                </div>
              )}
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Property type badge */}
              <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-800">
                {currentDeal.property_type}
              </div>
              
              {/* Days until close */}
              {getDaysUntilClose(currentDeal.closing_date) && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getDaysUntilClose(currentDeal.closing_date)}d left
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{currentDeal.title}</h3>
              <div className="flex items-center gap-1 text-gray-500 mb-4">
                <MapPin className="h-4 w-4" />
                <span>{currentDeal.location}</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(currentDeal.minimum_investment)}
                  </div>
                  <div className="text-xs text-gray-500">Min Investment</div>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <div className="text-lg font-bold text-emerald-600">
                    {currentDeal.target_irr}%
                  </div>
                  <div className="text-xs text-gray-500">Target IRR</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <div className="text-lg font-bold text-blue-600">
                    {currentDeal.equity_multiple || 2.0}x
                  </div>
                  <div className="text-xs text-gray-500">Equity Multiple</div>
                </div>
              </div>

              {/* Description preview */}
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {currentDeal.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 mt-6 px-4">
        <button
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 bg-white shadow-lg rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:scale-110 transition border border-gray-100"
        >
          <X className="h-7 w-7" />
        </button>
        
        <Link
          to={currentDeal ? `/deals/${currentDeal.slug}` : '#'}
          className="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-blue-500 hover:bg-blue-50 hover:scale-110 transition border border-gray-100"
        >
          <Info className="h-5 w-5" />
        </Link>
        
        <button
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 shadow-lg rounded-full flex items-center justify-center text-white hover:scale-110 transition"
        >
          <Heart className="h-7 w-7" />
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center mt-4 text-sm text-gray-400">
        Swipe right to save • Swipe left to pass
      </div>
    </div>
  );
}

// Compact Daily Pick Widget
export function DailyPickWidget() {
  const [deal, setDeal] = useState<Deal | null>(null);

  useEffect(() => {
    const fetchDailyPick = async () => {
      const { data } = await supabase
        .from('deals')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data) setDeal(data);
    };
    fetchDailyPick();
  }, []);

  if (!deal) return null;

  return (
    <Link 
      to={`/deals/${deal.slug}`}
      className="block bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100 hover:shadow-md transition"
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-800">Daily Pick</span>
      </div>
      <div className="flex items-center gap-3">
        {deal.images?.[0] ? (
          <img src={deal.images[0]} alt={deal.title} className="w-12 h-12 rounded-lg object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-amber-200 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-amber-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">{deal.title}</div>
          <div className="text-sm text-gray-500">{deal.target_irr}% IRR</div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </Link>
  );
}

