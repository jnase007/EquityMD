import React, { useState } from 'react';
import { X, Mail, Copy, Share2, Facebook, Linkedin, Twitter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface InviteModalProps {
  onClose: () => void;
}

export function InviteModal({ onClose }: InviteModalProps) {
  const { user, profile } = useAuthStore();
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const referralLink = `https://equitymd.com/signup/start?ref=${profile?.referral_code}`;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: inviteError } = await supabase
        .from('invites')
        .insert({
          sender_id: user?.id,
          recipient_email: email,
        });

      if (inviteError) throw inviteError;

      // Send invitation email
      await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: `${profile?.full_name} invited you to join EquityMD`,
          content: `
            ${profile?.full_name} has invited you to join EquityMD, the premier platform for real estate investment opportunities.
            
            Click the link below to create your account and you'll both receive 50 credits:
            
            ${referralLink}
            
            This invitation expires in 7 days.
          `,
          type: 'invitation'
        }
      });

      setSuccess(true);
      setEmail('');
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending invite:', error);
      setError('Error sending invite. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    window.location.href = `mailto:?subject=Join me on EquityMD&body=I'd like to invite you to join EquityMD, a platform for real estate investment opportunities. Use my referral link to sign up: ${referralLink}`;
  };

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareViaLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareViaTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=Join me on EquityMD, the premier platform for real estate investment opportunities!&url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            Invite Friends
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2">Earn 50 Credits</h3>
            <p className="text-blue-600 text-sm">
              When you invite friends and they join EquityMD, you'll both receive 50 credits that can be used toward premium features.
            </p>
          </div>

          <form onSubmit={handleInvite} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invite via Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
              Invitation sent successfully!
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Your Referral Link
            </label>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <button
                onClick={copyLink}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                {copied ? 'Copied!' : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share via
            </label>
            <div className="flex gap-4">
              <button
                onClick={shareViaEmail}
                className="flex-1 flex items-center justify-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Mail className="h-5 w-5" />
                <span>Email</span>
              </button>
              <button
                onClick={shareViaFacebook}
                className="flex-1 flex items-center justify-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Facebook className="h-5 w-5" />
                <span>Facebook</span>
              </button>
              <button
                onClick={shareViaLinkedIn}
                className="flex-1 flex items-center justify-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Linkedin className="h-5 w-5" />
                <span>LinkedIn</span>
              </button>
              <button
                onClick={shareViaTwitter}
                className="flex-1 flex items-center justify-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Twitter className="h-5 w-5" />
                <span>Twitter</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}