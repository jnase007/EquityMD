import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { trackSyndicatorContact, trackInvestmentInterest } from '../lib/analytics';

interface MessageModalProps {
  dealId?: string;
  dealTitle?: string;
  syndicatorId: string;
  syndicatorName: string;
  onClose: () => void;
  isInvestment?: boolean;
}

export function MessageModal({ dealId, dealTitle, syndicatorId, syndicatorName, onClose, isInvestment = false }: MessageModalProps) {
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSending(true);
    setError('');

    try {
      const content = isInvestment
        ? `Investment Interest: $${investmentAmount}\n\n${message}`
        : message;

      const messageData: any = {
        sender_id: user.id,
        receiver_id: syndicatorId,
        content
      };

      // Only include deal_id if it's provided and not empty
      if (dealId) {
        messageData.deal_id = dealId;
      }

      // If user is an investor, automatically create a connection if it doesn't exist
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (profile?.user_type === 'investor') {
          // Check if connection already exists
          const { data: existingConnection } = await supabase
            .from('investor_connections')
            .select('id')
            .eq('investor_id', user.id)
            .eq('syndicator_id', syndicatorId)
            .single();

          // Create connection if it doesn't exist
          if (!existingConnection) {
            await supabase
              .from('investor_connections')
              .insert({
                investor_id: user.id,
                syndicator_id: syndicatorId,
                initiated_by: 'investor',
                status: 'pending'
              });
          }
        }
      }

      // Send message
      const { error: messageError } = await supabase
        .from('messages')
        .insert(messageData);

      if (messageError) throw messageError;

      // Track analytics events
      if (isInvestment && investmentAmount) {
        // Track investment interest
        trackInvestmentInterest(dealId || '', parseInt(investmentAmount), user.id);
      } else {
        // Track syndicator contact
        trackSyndicatorContact(syndicatorId, dealId, user.id);
      }

      setSuccess(true);
      setMessage('');
      setInvestmentAmount('');

      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {isInvestment ? 'Express Investment Interest' : 'Contact Syndicator'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-medium text-gray-900">Syndicator</h3>
            <p className="text-gray-600">{syndicatorName}</p>
          </div>

          {dealTitle && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900">Deal</h3>
              <p className="text-gray-600">{dealTitle}</p>
            </div>
          )}

          {success ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg">
              {isInvestment
                ? 'Investment interest submitted! The syndicator will contact you shortly to discuss next steps.'
                : 'Message sent successfully! The syndicator will respond to you shortly.'}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {isInvestment && (
                <div className="mb-4">
                  <label htmlFor="investmentAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Amount ($)
                  </label>
                  <input
                    type="number"
                    id="investmentAmount"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    placeholder="Enter your investment amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {isInvestment ? 'Additional Notes (Optional)' : 'Your Message'}
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isInvestment
                    ? "Any specific questions or requirements..."
                    : "Write your message here..."}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required={!isInvestment}
                />
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={sending || (!message.trim() && !isInvestment) || (isInvestment && !investmentAmount)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? 'Sending...' : (isInvestment ? 'Submit Investment Interest' : 'Send Message')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}