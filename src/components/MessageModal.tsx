import React, { useState, useEffect } from 'react';
import { X, Send, DollarSign, MessageCircle, CheckCircle, Sparkles, Bell, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { trackSyndicatorContact, trackInvestmentInterest } from '../lib/analytics';
import toast from 'react-hot-toast';

interface MessageModalProps {
  dealId?: string;
  dealTitle?: string;
  dealSlug?: string;
  receiverId: string;
  syndicatorName: string;
  syndicatorEmail?: string;
  onClose: () => void;
  isInvestment?: boolean;
}

export function MessageModal({ 
  dealId, 
  dealTitle, 
  dealSlug,
  receiverId, 
  syndicatorName, 
  syndicatorEmail,
  onClose, 
  isInvestment = false 
}: MessageModalProps) {
  const { user, profile } = useAuthStore();
  const [message, setMessage] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'form' | 'sending' | 'success'>('form');

  // Format number with commas for display
  const formatNumberWithCommas = (num: string) => {
    const cleanNum = num.replace(/\D/g, '');
    return cleanNum.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Get raw number without commas for storage
  const getRawNumber = (formattedNum: string) => {
    return formattedNum.replace(/,/g, '');
  };

  // Format currency for display
  const formatCurrency = (amount: string) => {
    const num = parseInt(getRawNumber(amount));
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Send email notification to syndicator
  const sendEmailNotification = async (type: 'investment_interest' | 'new_message') => {
    try {
      // Get syndicator's email if not provided
      let recipientEmail = syndicatorEmail;
      
      if (!recipientEmail) {
        const { data: recipientProfile } = await supabase
          .from('profiles')
          .select('email, email_notifications')
          .eq('id', receiverId)
          .single();
        
        if (recipientProfile?.email) {
          recipientEmail = recipientProfile.email;
          
          // Check if user has email notifications enabled
          const notifications = recipientProfile.email_notifications;
          if (type === 'new_message' && notifications && !notifications.messages) {
            console.log('User has message notifications disabled');
            return;
          }
          if (type === 'investment_interest' && notifications && !notifications.investment_status) {
            console.log('User has investment notifications disabled');
            return;
          }
        }
      }

      if (!recipientEmail) {
        console.log('No email found for recipient');
        return;
      }

      // Call the edge function to send email
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipientEmail,
          type: type,
          data: type === 'investment_interest' ? {
            investorName: profile?.full_name || 'An Investor',
            investorEmail: profile?.email || user?.email,
            dealTitle: dealTitle || 'Investment Opportunity',
            dealSlug: dealSlug,
            investmentAmount: formatCurrency(investmentAmount),
            message: message || undefined,
            timestamp: new Date().toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          } : {
            senderName: profile?.full_name || 'A User',
            senderType: profile?.user_type || 'investor',
            messagePreview: message,
            dealTitle: dealTitle,
            dealSlug: dealSlug,
            timestamp: new Date().toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          }
        }
      });

      if (emailError) {
        console.error('Error sending email notification:', emailError);
      } else {
        console.log('Email notification sent successfully');
      }
    } catch (error) {
      console.error('Error in sendEmailNotification:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSending(true);
    setStep('sending');
    setError('');

    try {
      const content = isInvestment
        ? `💰 Investment Interest: ${formatCurrency(investmentAmount)}\n\n${message || 'I am interested in this investment opportunity.'}`
        : message;

      const messageData: any = {
        sender_id: user.id,
        receiver_id: receiverId,
        content
      };

      if (dealId) {
        messageData.deal_id = dealId;
      }

      // Create investor connection if needed
      if (profile?.user_type === 'investor') {
        const { data: existingConnection } = await supabase
          .from('investor_connections')
          .select('id')
          .eq('investor_id', user.id)
          .eq('syndicator_id', receiverId)
          .single();

        if (!existingConnection) {
          await supabase
            .from('investor_connections')
            .insert({
              investor_id: user.id,
              syndicator_id: receiverId,
              initiated_by: 'investor',
              status: 'pending'
            });
        }
      }

      // Send message
      const { error: messageError } = await supabase
        .from('messages')
        .insert(messageData);

      if (messageError) throw messageError;

      // Create notification in database for syndicator
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: receiverId,
            type: isInvestment ? 'investment_status' : 'message',
            title: isInvestment 
              ? `💰 New Investment Interest - ${formatCurrency(investmentAmount)}`
              : `New message from ${profile?.full_name || 'An Investor'}`,
            content: isInvestment
              ? `${profile?.full_name || 'An investor'} is interested in investing ${formatCurrency(investmentAmount)} in ${dealTitle || 'your deal'}.`
              : message.substring(0, 200),
            data: {
              deal_id: dealId,
              deal_slug: dealSlug,
              sender_id: user.id,
              sender_name: profile?.full_name,
              investment_amount: isInvestment ? getRawNumber(investmentAmount) : undefined
            },
            read: false
          });
      } catch (notifError) {
        console.log('Notification insert error (may not exist):', notifError);
      }

      // Save to investment_requests table if this is an investment
      if (isInvestment && investmentAmount && dealId) {
        try {
          const { error: investmentError } = await supabase
            .from('investment_requests')
            .insert({
              deal_id: dealId,
              user_id: user.id,
              amount: parseInt(getRawNumber(investmentAmount)),
              status: 'pending'
            });

          if (investmentError) {
            console.log('Investment requests table error:', investmentError);
          }
        } catch (error) {
          console.log('Investment tracking error:', error);
        }
      }

      // Send email notification to syndicator
      await sendEmailNotification(isInvestment ? 'investment_interest' : 'new_message');

      // Track analytics
      if (isInvestment && investmentAmount) {
        trackInvestmentInterest(dealId || '', parseInt(getRawNumber(investmentAmount)), user.id);
      } else {
        trackSyndicatorContact(receiverId, dealId, user.id);
      }

      setStep('success');
      setSuccess(true);
      
      // Show success toast
      toast.success(
        isInvestment 
          ? '🎉 Investment interest submitted!' 
          : '✉️ Message sent successfully!',
        { duration: 4000 }
      );

      // Close modal after delay
      setTimeout(() => {
        onClose();
      }, 4000);

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send. Please try again.');
      setStep('form');
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Sending animation step
  if (step === 'sending') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Send className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isInvestment ? 'Submitting Interest...' : 'Sending Message...'}
          </h3>
          <p className="text-gray-500">
            {isInvestment 
              ? 'Notifying the syndicator of your interest...'
              : 'Delivering your message...'}
          </p>
          <div className="mt-4 flex justify-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  // Success step
  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Success header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-center text-white">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {isInvestment ? '🎉 Interest Submitted!' : '✉️ Message Sent!'}
            </h3>
            <p className="text-emerald-100">
              {isInvestment 
                ? `Your ${formatCurrency(investmentAmount)} investment interest has been sent to ${syndicatorName}`
                : `Your message has been delivered to ${syndicatorName}`}
            </p>
          </div>
          
          {/* What happens next */}
          <div className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              What Happens Next
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bell className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Syndicator Notified</p>
                  <p className="text-sm text-gray-500">
                    {syndicatorName} has been notified instantly
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email Sent</p>
                  <p className="text-sm text-gray-500">
                    An email notification has been sent to the syndicator
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Expect a Response</p>
                  <p className="text-sm text-gray-500">
                    Most syndicators respond within 24-48 hours
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <a
                href="/inbox"
                className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                View Inbox
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form step
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className={`p-6 ${isInvestment 
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
          : 'bg-gradient-to-r from-blue-600 to-indigo-600'} text-white`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                {isInvestment ? (
                  <DollarSign className="h-6 w-6" />
                ) : (
                  <MessageCircle className="h-6 w-6" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {isInvestment ? 'Express Investment Interest' : 'Contact Syndicator'}
                </h2>
                <p className="text-sm opacity-90">
                  {isInvestment ? 'Let them know you want to invest' : 'Send a direct message'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Deal & Syndicator Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Syndicator</p>
                <p className="font-semibold text-gray-900">{syndicatorName}</p>
              </div>
              {dealTitle && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Deal</p>
                  <p className="font-semibold text-gray-900 text-sm">{dealTitle}</p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Investment Amount */}
            {isInvestment && (
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Investment Amount
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    $
                  </div>
                  <input
                    type="text"
                    value={investmentAmount}
                    onChange={(e) => {
                      const formatted = formatNumberWithCommas(e.target.value);
                      setInvestmentAmount(formatted);
                    }}
                    placeholder="50,000"
                    className="w-full pl-8 pr-4 py-4 text-xl font-semibold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  💡 Enter your desired investment amount (minimum typically $25,000 - $50,000)
                </p>
              </div>
            )}

            {/* Message */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {isInvestment ? 'Message (Optional)' : 'Your Message'}
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isInvestment
                  ? "I'm interested in learning more about this investment opportunity. Please share additional details about the projected returns and timeline..."
                  : "Hi, I'm interested in learning more about your investment opportunities..."}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                required={!isInvestment}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                {error}
              </div>
            )}

            {/* Notification info */}
            <div className="mb-5 p-3 bg-blue-50 rounded-xl flex items-start gap-3">
              <Bell className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                {syndicatorName} will receive an <strong>instant notification</strong> and <strong>email</strong> about your {isInvestment ? 'investment interest' : 'message'}.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending || (!message.trim() && !isInvestment) || (isInvestment && !getRawNumber(investmentAmount))}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                isInvestment 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
            >
              {sending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : isInvestment ? (
                <>
                  <DollarSign className="h-5 w-5" />
                  Submit Investment Interest
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
