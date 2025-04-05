import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailUpdateFormProps {
  currentEmail: string;
  onSuccess: () => void;
}

export function EmailUpdateForm({ currentEmail, onSuccess }: EmailUpdateFormProps) {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First verify the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }

      // Update email
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setNewEmail('');
      setPassword('');
      onSuccess();

      // Show success message for 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating email:', err);
      setError(err instanceof Error ? err.message : 'Error updating email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-6">Update Email Address</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Email
          </label>
          <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
            <Mail className="h-5 w-5 text-gray-400 mr-2" />
            <span>{currentEmail}</span>
          </div>
        </div>

        <div>
          <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">
            New Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
            Email update request sent! Please check your new email for verification.
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !newEmail}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Email'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-500">
        Note: You will need to verify your new email address before the change takes effect.
        A verification link will be sent to your new email address.
      </p>
    </div>
  );
}