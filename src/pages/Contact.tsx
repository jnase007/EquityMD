import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Mail, Building2, Send, MessageSquare, Phone, Clock, Sparkles, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

export function Contact() {
  const { user, profile } = useAuthStore();
  const [formData, setFormData] = useState({
    name: profile?.full_name || '',
    email: user?.email || '',
    subject: '',
    message: '',
    type: 'feedback'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: submitError } = await supabase
        .from('feedback')
        .insert([{
          user_id: user?.id,
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          type: formData.type
        }]);

      if (submitError) throw submitError;

      setSuccess(true);
      setFormData(prev => ({
        ...prev,
        subject: '',
        message: '',
        type: 'feedback'
      }));

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Error submitting feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <SEO 
        title="Contact Us | EquityMD"
        description="Get in touch with EquityMD. Questions about real estate syndication, investing, or listing your deals? We're here to help."
        canonical="https://equitymd.com/contact"
      />
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <MessageSquare 
              key={i}
              className="absolute text-white/5"
              style={{
                left: `${10 + i * 20}%`,
                top: `${15 + (i % 2) * 40}%`,
                width: `${40 + i * 10}px`,
                height: `${40 + i * 10}px`,
                transform: `rotate(${-10 + i * 10}deg)`,
              }}
            />
          ))}
        </div>
        
        <div className="max-w-6xl mx-auto px-4 py-16 relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">Contact Us</h1>
              <p className="text-white/80 mt-1">We're here to help with any questions or feedback</p>
            </div>
          </div>
          
          {/* Quick contact options */}
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-white/80" />
              <span className="text-white text-sm">hello@equitymd.com</span>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/80" />
              <span className="text-white text-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">hello@equitymd.com</p>
                    <p className="text-sm text-gray-400">24/7 support</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Office</h3>
                    <p className="text-gray-600">
                      3525 Hyland Ave Suite 235<br />
                      Costa Mesa, CA 92626
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Quick Links */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-semibold">Quick Help</h3>
                </div>
                <p className="text-blue-100 text-sm mb-4">
                  Check our resources for common questions.
                </p>
                <a href="/how-it-works" className="text-sm text-white hover:text-blue-200 underline">
                  How It Works →
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Send Us a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="John Smith"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
                    required
                  >
                    <option value="feedback">General Feedback</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership Inquiry</option>
                    <option value="press">Press Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    placeholder="Tell us more about your inquiry..."
                    required
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    Thank you for your message! We'll get back to you soon.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 font-semibold shadow-lg shadow-blue-500/25 transform hover:scale-[1.02]"
                >
                  <Send className="h-5 w-5" />
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
