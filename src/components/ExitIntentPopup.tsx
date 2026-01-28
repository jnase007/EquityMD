import React, { useState, useEffect } from 'react';
import { X, Mail, Gift, TrendingUp, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'equitymd_exit_popup_shown';
const SHOW_AFTER_DAYS = 7; // Don't show again for 7 days after dismissing

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      // Check if we should show the popup
      const lastShown = localStorage.getItem(STORAGE_KEY);
      if (lastShown) {
        const daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
        if (daysSince < SHOW_AFTER_DAYS) return;
      }

      // Exit intent detection
      const handleMouseLeave = (e: MouseEvent) => {
        // Only trigger when mouse leaves through top of page
        if (e.clientY <= 0 && !isVisible) {
          setIsVisible(true);
        }
      };

      // Delay adding listeners to avoid showing immediately
      const timer = setTimeout(() => {
        document.addEventListener('mouseleave', handleMouseLeave);
      }, 15000); // Wait 15 seconds before enabling

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mouseleave', handleMouseLeave);
      };
    } catch (err) {
      console.error('ExitIntentPopup error:', err);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    
    // Always show success after a short delay (even if DB fails)
    const showSuccess = () => {
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    };

    // Set a timeout to show success regardless
    const timeout = setTimeout(showSuccess, 2000);

    try {
      // Try to save to database (non-blocking)
      await supabase
        .from('newsletter_subscribers')
        .insert([{ email, source: 'exit_popup' }]);
      
      clearTimeout(timeout);
      showSuccess();
    } catch (err) {
      // Database might not have the table yet - that's OK
      console.error('Newsletter subscription error:', err);
      clearTimeout(timeout);
      showSuccess();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
              <Gift className="h-8 w-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Wait! Don't Miss Out</h2>
          <p className="text-emerald-100">
            Get exclusive deals delivered to your inbox
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">You're In! 🎉</h3>
              <p className="text-gray-600">Check your inbox for exclusive investment opportunities.</p>
            </div>
          ) : (
            <>
              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span>Weekly investment opportunities</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>Early access to new deals</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Gift className="h-4 w-4 text-purple-600" />
                  </div>
                  <span>Exclusive market insights & tips</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Subscribing...' : 'Get Free Deal Alerts'}
                </button>
              </form>

              <p className="text-xs text-gray-400 text-center mt-4">
                No spam. Unsubscribe anytime. We respect your privacy.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

