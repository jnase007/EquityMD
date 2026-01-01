import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Clock, 
  MapPin, DollarSign, Building2, Eye, ArrowRight,
  Video, Bell, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Deal {
  id: string;
  title: string;
  slug: string;
  property_type: string;
  location: string;
  minimum_investment: number;
  target_irr: number;
  closing_date: string;
  images: string[];
  status: string;
}

interface CalendarEvent {
  id: string;
  date: Date;
  type: 'closing' | 'webinar' | 'distribution' | 'reminder';
  title: string;
  deal?: Deal;
  description?: string;
}

export function DealCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('status', 'active')
        .not('closing_date', 'is', null)
        .order('closing_date', { ascending: true });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const events = useMemo<CalendarEvent[]>(() => {
    return deals
      .filter(deal => deal.closing_date)
      .map(deal => ({
        id: deal.id,
        date: new Date(deal.closing_date),
        type: 'closing' as const,
        title: `${deal.title} closes`,
        deal,
      }));
  }, [deals]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.getFullYear() === date.getFullYear() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getDate() === date.getDate()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getDaysUntil = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const upcomingDeals = useMemo(() => {
    const today = new Date();
    return deals
      .filter(deal => new Date(deal.closing_date) > today)
      .sort((a, b) => new Date(a.closing_date).getTime() - new Date(b.closing_date).getTime())
      .slice(0, 5);
  }, [deals]);

  const days = getDaysInMonth(currentMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Deal Calendar</h3>
              <p className="text-white/80 text-sm">Track closing dates & events</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                view === 'calendar' ? 'bg-white text-indigo-600' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                view === 'list' ? 'bg-white text-indigo-600' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h4 className="text-lg font-bold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h4>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-20" />;
              }

              const dayEvents = getEventsForDate(date);
              const hasEvents = dayEvents.length > 0;
              const isSelected = selectedDate && 
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth();

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`h-20 p-1 rounded-lg border transition ${
                    isToday(date) 
                      ? 'bg-indigo-50 border-indigo-200' 
                      : isSelected
                        ? 'bg-gray-100 border-gray-300'
                        : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    isToday(date) ? 'text-indigo-600' : 'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </div>
                  {hasEvents && (
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 2).map(event => (
                        <div 
                          key={event.id}
                          className={`text-xs truncate px-1 py-0.5 rounded ${
                            event.type === 'closing' 
                              ? 'bg-red-100 text-red-700'
                              : event.type === 'webinar'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Date Events */}
          {selectedDate && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <h5 className="font-medium text-gray-900 mb-3">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h5>
              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-2">
                  {getEventsForDate(selectedDate).map(event => (
                    <Link
                      key={event.id}
                      to={event.deal ? `/deals/${event.deal.slug}` : '#'}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition"
                    >
                      <div className={`p-2 rounded-lg ${
                        event.type === 'closing' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        <Clock className={`h-4 w-4 ${
                          event.type === 'closing' ? 'text-red-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{event.title}</div>
                        {event.deal && (
                          <div className="text-sm text-gray-500">
                            {formatCurrency(event.deal.minimum_investment)} minimum
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No events on this date</p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="p-4">
          <div className="space-y-3">
            {upcomingDeals.length > 0 ? (
              upcomingDeals.map(deal => {
                const daysUntil = getDaysUntil(new Date(deal.closing_date));
                
                return (
                  <Link
                    key={deal.id}
                    to={`/deals/${deal.slug}`}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  >
                    {deal.images?.[0] ? (
                      <img 
                        src={deal.images[0]} 
                        alt={deal.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 truncate">{deal.title}</h5>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {deal.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(deal.minimum_investment)} min
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        daysUntil <= 7 ? 'text-red-600' : 
                        daysUntil <= 30 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {daysUntil}
                      </div>
                      <div className="text-xs text-gray-500">days left</div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming deal closings</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="px-4 py-3 bg-gray-50 border-t">
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-gray-600">Deal Closing</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-gray-600">Webinar</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-gray-600">Distribution</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini Calendar Widget
export function UpcomingClosings({ limit = 3 }: { limit?: number }) {
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    const fetchDeals = async () => {
      const today = new Date().toISOString();
      const { data } = await supabase
        .from('deals')
        .select('id, title, slug, closing_date, minimum_investment, property_type')
        .eq('status', 'active')
        .not('closing_date', 'is', null)
        .gte('closing_date', today)
        .order('closing_date', { ascending: true })
        .limit(limit);
      
      setDeals(data || []);
    };
    fetchDeals();
  }, [limit]);

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (deals.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-orange-600" />
        <span className="font-medium text-orange-800">Closing Soon</span>
      </div>
      <div className="space-y-2">
        {deals.map(deal => {
          const daysLeft = getDaysUntil(deal.closing_date);
          return (
            <Link
              key={deal.id}
              to={`/deals/${deal.slug}`}
              className="flex items-center justify-between p-2 bg-white rounded-lg hover:shadow-sm transition"
            >
              <span className="text-sm font-medium text-gray-900 truncate">
                {deal.title}
              </span>
              <span className={`text-sm font-bold ${
                daysLeft <= 7 ? 'text-red-600' : 'text-orange-600'
              }`}>
                {daysLeft}d
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

