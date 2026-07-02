import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

/**
 * Lets a logged-in user set or change their account password.
 *
 * Primary purpose: users who signed up with Google or LinkedIn (OAuth) have no
 * password on their account, so they can't sign in with email + password. This
 * form calls updateUser({ password }) to add one — after which email sign-in
 * works. It also doubles as a normal "change password" control.
 */
export function SetPasswordForm() {
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [provider, setProvider] = useState<string>('email');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // identities tells us how the account can currently authenticate.
      const identities = user.identities || [];
      const hasEmailIdentity = identities.some((i: any) => i.provider === 'email');
      setHasPassword(hasEmailIdentity);
      setProvider(user.app_metadata?.provider || (identities[0] as any)?.provider || 'email');
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      setPassword('');
      setConfirm('');
      setHasPassword(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.message || 'Could not update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isOAuthOnly = hasPassword === false;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-2">{isOAuthOnly ? 'Add a Password' : 'Change Password'}</h2>

      {isOAuthOnly && (
        <p className="text-sm text-gray-500 mb-6">
          You signed in with{' '}
          <span className="font-medium capitalize">
            {provider === 'linkedin_oidc' ? 'LinkedIn' : provider}
          </span>
          . Add a password so you can also sign in with your email address.
        </p>
      )}
      {hasPassword === true && (
        <p className="text-sm text-gray-500 mb-6">Update the password you use to sign in with email.</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              className="pl-10 pr-11 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

        {success && (
          <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Password {isOAuthOnly ? 'added' : 'updated'}. You can now sign in with your email and password.
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !password || !confirm}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Saving…' : isOAuthOnly ? 'Add Password' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
