import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';
import { Navbar } from '../components/Navbar';

/**
 * Password reset landing page.
 *
 * Supabase's resetPasswordForEmail() emails a link that returns here with
 * recovery tokens in the URL hash. With detectSessionInUrl:true the client
 * parses those tokens, establishes a temporary session and fires a
 * PASSWORD_RECOVERY auth event. We wait for that session, then let the user
 * set a new password via updateUser({ password }).
 *
 * NOTE: This ALSO gives LinkedIn/Google (OAuth-only) users a way to set a
 * password on their account so they can subsequently sign in with email +
 * password — they just click "Forgot password", get this link, and set one.
 */
export function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);       // recovery session detected
  const [checking, setChecking] = useState(true);  // still resolving the link
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Fires when Supabase parses the recovery tokens from the URL hash.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setReady(true);
        setChecking(false);
      }
    });

    // Fallback: the recovery session may already be established by the time we
    // mount (detectSessionInUrl runs on client init). Check directly too.
    (async () => {
      const hasRecoveryHash =
        window.location.hash.includes('type=recovery') ||
        window.location.hash.includes('access_token');
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (data.session) {
        setReady(true);
        setChecking(false);
      } else if (!hasRecoveryHash) {
        // No session and no recovery tokens in the URL — link is missing/expired.
        setChecking(false);
      }
      // If hasRecoveryHash but no session yet, keep waiting for the auth event.
    })();

    // Safety timeout so we never hang on "checking" forever.
    const t = setTimeout(() => {
      if (mounted) setChecking(false);
    }, 6000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      // Give the user a moment to read the success state, then send them in.
      setTimeout(() => navigate('/'), 2500);
    } catch (err: any) {
      setError(
        err?.message?.includes('session')
          ? 'Your reset link has expired. Please request a new one.'
          : err?.message || 'Could not update your password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Reset Password | EquityMD" noindex />
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-blue-600/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Set a new password</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose a password for your EquityMD account.</p>
            </div>
          </div>

          {checking ? (
            <div className="flex flex-col items-center gap-3 py-10 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Verifying your reset link…</span>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <p className="font-semibold text-gray-900 dark:text-white">Password updated</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You can now sign in with your email and password. Redirecting…
              </p>
            </div>
          ) : !ready ? (
            <div className="text-center py-6">
              <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-900 dark:text-white mb-1">Reset link invalid or expired</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                This password reset link is no longer valid. Please request a new one from the sign-in screen.
              </p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoFocus
                    className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm new password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold transition-colors"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
