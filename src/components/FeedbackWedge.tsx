import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

export function FeedbackWedge() {
  const { user, profile } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    type: 'feedback' as 'feedback' | 'bug' | 'feature' | 'question',
    message: '',
  });

  // Pre-fill from profile
  useEffect(() => {
    if (profile) {
      setForm(prev => ({
        ...prev,
        name: profile.full_name || prev.name,
        email: profile.email || prev.email,
      }));
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Save to feedback table
      const { error: dbError } = await supabase
        .from('feedback')
        .insert([{
          user_id: user?.id || null,
          name: form.name || 'Anonymous',
          email: form.email || null,
          subject: `[${form.type.toUpperCase()}] Website Feedback`,
          message: form.message,
          type: form.type,
        }]);

      if (dbError) throw dbError;

      // Send email notification to Justin
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            to: 'justin@brandastic.com',
            subject: `[EquityMD ${form.type}] ${form.name || 'Anonymous'}: ${form.message.slice(0, 60)}...`,
            content: `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <h2 style="color: #0ea5e9;">New Feedback from EquityMD</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px; font-weight: bold; color: #64748b;">From</td><td style="padding: 8px;">${form.name || 'Anonymous'}${form.email ? ` (${form.email})` : ''}</td></tr>
                  <tr><td style="padding: 8px; font-weight: bold; color: #64748b;">Type</td><td style="padding: 8px;">${form.type}</td></tr>
                  <tr><td style="padding: 8px; font-weight: bold; color: #64748b;">Page</td><td style="padding: 8px;">${window.location.pathname}</td></tr>
                  ${user ? `<tr><td style="padding: 8px; font-weight: bold; color: #64748b;">User ID</td><td style="padding: 8px;">${user.id}</td></tr>` : ''}
                </table>
                <div style="margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                  <p style="margin: 0; white-space: pre-wrap;">${form.message}</p>
                </div>
              </div>
            `,
          },
        });
      } catch (emailErr) {
        // Don't fail the whole submission if email fails
        console.error('Feedback email notification failed:', emailErr);
      }

      setSuccess(true);
      setForm(prev => ({ ...prev, message: '', type: 'feedback' }));

      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Wedge tab — fixed on right side */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-sky-500 hover:bg-sky-600 text-white px-2 py-4 rounded-l-lg shadow-lg transition-all duration-200 hover:px-3 group"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          aria-label="Send feedback"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare size={16} className="rotate-90" />
            Feedback
          </span>
        </button>
      )}

      {/* Slide-out panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-50 sm:bg-transparent sm:pointer-events-none"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 w-[340px] max-h-[520px] bg-white rounded-l-xl shadow-2xl border border-gray-200 animate-slide-in-right overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} />
                <span className="font-semibold text-sm">Send Feedback</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <CheckCircle size={48} className="text-emerald-500 mb-3" />
                <p className="text-lg font-semibold text-gray-900">Thank you!</p>
                <p className="text-sm text-gray-500 mt-1">Your feedback has been sent.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                {/* Only show name/email for non-logged-in users */}
                {!user && (
                  <>
                    <input
                      type="text"
                      placeholder="Name (optional)"
                      value={form.name}
                      onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={form.email}
                      onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    />
                  </>
                )}

                {/* Type selector */}
                <div className="flex gap-1.5">
                  {(['feedback', 'bug', 'feature', 'question'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, type }))}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                        form.type === type
                          ? 'bg-sky-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Message */}
                <textarea
                  placeholder="Tell us what you think, what's broken, or what you'd love to see..."
                  value={form.message}
                  onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                  required
                  rows={5}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-none"
                />

                {error && (
                  <p className="text-xs text-red-500">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !form.message.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={14} />
                      Send Feedback
                    </>
                  )}
                </button>

                <p className="text-[11px] text-gray-400 text-center">
                  Your feedback goes directly to our team
                </p>
              </form>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translate(100%, -50%); opacity: 0; }
          to { transform: translate(0, -50%); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
