import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  endDate: Date;
  className?: string;
}

export function CountdownTimer({ endDate, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <div>
            <div className="text-red-800 font-medium">Investment Period Ended</div>
            <div className="text-red-600 text-sm">This deal is no longer accepting new investments</div>
          </div>
        </div>
      </div>
    );
  }

  const isUrgent = timeLeft.days <= 7;

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <Clock className={`h-5 w-5 mr-2 ${isUrgent ? 'text-red-500' : 'text-blue-600'}`} />
        <h3 className={`text-lg font-bold ${isUrgent ? 'text-red-700' : 'text-gray-900'}`}>
          {isUrgent ? 'Limited Time Left!' : 'Investment Deadline'}
        </h3>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${isUrgent ? 'text-red-600' : 'text-blue-600'}`}>
            {timeLeft.days.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-500">Days</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${isUrgent ? 'text-red-600' : 'text-blue-600'}`}>
            {timeLeft.hours.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-500">Hours</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${isUrgent ? 'text-red-600' : 'text-blue-600'}`}>
            {timeLeft.minutes.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-500">Minutes</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${isUrgent ? 'text-red-600' : 'text-blue-600'}`}>
            {timeLeft.seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-500">Seconds</div>
        </div>
      </div>

      {isUrgent && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-red-800 text-sm font-medium">
            ⚠️ Don't miss out! This opportunity closes soon.
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-3">
        Investment period ends on {endDate.toLocaleDateString()} at {endDate.toLocaleTimeString()}
      </div>
    </div>
  );
} 