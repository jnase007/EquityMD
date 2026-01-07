import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { trackUserLogin } from '../lib/analytics';
import { 
  X, Mail, Lock, User, Loader2, Check, AlertCircle, 
  TrendingUp, Shield, Zap, ArrowRight, Sparkles, Eye, EyeOff,
  Building2, ChevronRight
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  defaultType?: 'investor' | 'syndicator';
  defaultView?: 'sign_in' | 'sign_up';
}

// Confetti component
function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          <div
            className="w-2 h-2 rounded-sm"
            style={{
              backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][Math.floor(Math.random() * 5)],
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti 3s ease-out forwards; }
      `}</style>
    </div>
  );
}

export function AuthModal({ onClose, defaultView = 'sign_up' }: AuthModalProps) {
  const [mode, setMode] = useState<'sign_in' | 'sign_up' | 'magic_link' | 'success'>(defaultView);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSocialLogin = async (provider: 'google' | 'linkedin_oidc') => {
    setSocialLoading(provider);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      setSocialLoading(null);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { 
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { full_name: firstName || undefined }
        },
      });
      if (error) throw error;
      setShowConfetti(true);
      setMode('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'sign_up') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: firstName } },
        });

        if (error) throw error;

        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: firstName,
            user_type: 'investor',
            is_verified: false,
            is_admin: email === 'justin@brandastic.com',
          });

          await supabase.from('investor_profiles').upsert({
            id: data.user.id,
            accredited_status: false,
          });

          if (data.session) {
            trackUserLogin('investor', data.user.id);
            setShowConfetti(true);
            setTimeout(() => {
              onClose();
              navigate('/welcome');
            }, 1500);
          } else {
            setShowConfetti(true);
            setMode('success');
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', data.user.id)
            .single();

          trackUserLogin(profile?.user_type || 'investor', data.user.id);
          onClose();
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      if (err.message?.includes('Invalid login')) {
        setError('Invalid email or password');
      } else if (err.message?.includes('already registered')) {
        setError('This email is already registered. Try signing in.');
      } else {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  // Success State
  if (mode === 'success') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
          {showConfetti && <Confetti />}
          <div className="p-8 text-center relative">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email!</h2>
            <p className="text-gray-600 mb-6">
              We sent a {mode === 'magic_link' ? 'magic link' : 'confirmation link'} to<br />
              <span className="font-medium text-gray-900">{email}</span>
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {showConfetti && <Confetti />}
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left Panel - Benefits (hidden on mobile for sign-in) */}
          {(mode === 'sign_up' || mode === 'magic_link') && (
            <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 flex-col justify-between text-white">
              <div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold mb-4">Why join EquityMD?</h3>
                <ul className="space-y-3 text-sm">
                  {[
                    { icon: TrendingUp, text: 'Access exclusive deals' },
                    { icon: Shield, text: 'Vetted syndicators' },
                    { icon: Zap, text: 'Instant deal alerts' },
                    { icon: Building2, text: 'Portfolio tracking' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-blue-100">
                      <item.icon className="h-4 w-4 text-blue-300" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-white/20">
                <p className="text-xs text-blue-200">
                  Join <span className="font-semibold text-white">7,400+</span> accredited investors
                </p>
              </div>
            </div>
          )}

          {/* Right Panel - Form */}
          <div className={`${mode === 'sign_up' || mode === 'magic_link' ? 'md:w-3/5' : 'w-full'} p-6`}>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === 'sign_up' ? 'Create account' : mode === 'magic_link' ? 'Magic link' : 'Welcome back'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {mode === 'sign_up' 
                  ? 'Start investing in minutes' 
                  : mode === 'magic_link'
                  ? 'We\'ll email you a login link'
                  : 'Sign in to your account'
                }
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {mode !== 'magic_link' ? (
              <>
                {/* Social Logins */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => handleSocialLogin('google')}
                    disabled={!!socialLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition font-medium text-gray-700 disabled:opacity-50"
                  >
                    {socialLoading === 'google' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    <span className="hidden sm:inline">Google</span>
                  </button>

                  <button
                    onClick={() => handleSocialLogin('linkedin_oidc')}
                    disabled={!!socialLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition font-medium text-gray-700 disabled:opacity-50"
                  >
                    {socialLoading === 'linkedin_oidc' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#0A66C2">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    )}
                    <span className="hidden sm:inline">LinkedIn</span>
                  </button>
                </div>

                {/* Magic Link Option */}
                <button
                  onClick={() => setMode('magic_link')}
                  className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl text-purple-700 font-medium hover:from-purple-100 hover:to-blue-100 transition group"
                >
                  <Zap className="h-4 w-4" />
                  Sign in with magic link
                  <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-400">or continue with email</span>
                  </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {mode === 'sign_up' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          required
                          autoComplete="given-name"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium text-gray-700">Password</label>
                      {mode === 'sign_in' && (
                        <button
                          type="button"
                          onClick={() => setMode('magic_link')}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        autoComplete={mode === 'sign_up' ? 'new-password' : 'current-password'}
                        className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    {/* Password Strength (sign up only) */}
                    {mode === 'sign_up' && password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                i <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          Password strength: <span className={`font-medium ${passwordStrength.score >= 4 ? 'text-green-600' : passwordStrength.score >= 3 ? 'text-blue-600' : 'text-gray-600'}`}>{passwordStrength.label}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {mode === 'sign_up' ? 'Creating...' : 'Signing in...'}
                      </>
                    ) : (
                      <>
                        {mode === 'sign_up' ? 'Create Account' : 'Sign In'}
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Toggle Mode */}
                <p className="text-center text-sm text-gray-600 mt-6">
                  {mode === 'sign_up' ? (
                    <>
                      Already have an account?{' '}
                      <button onClick={() => { setMode('sign_in'); setError(null); }} className="text-blue-600 font-medium hover:text-blue-700">
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      New to EquityMD?{' '}
                      <button onClick={() => { setMode('sign_up'); setError(null); }} className="text-blue-600 font-medium hover:text-blue-700">
                        Create account
                      </button>
                    </>
                  )}
                </p>
              </>
            ) : (
              /* Magic Link Form */
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Send Magic Link
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMode('sign_in')}
                  className="w-full text-gray-600 py-2 text-sm hover:text-gray-900 transition"
                >
                  ← Back to password sign in
                </button>
              </form>
            )}

            {/* Terms */}
            <p className="text-center text-xs text-gray-400 mt-4">
              By continuing, you agree to our{' '}
              <a href="/legal/terms" className="text-blue-500 hover:underline">Terms</a>
              {' '}&{' '}
              <a href="/legal/privacy" className="text-blue-500 hover:underline">Privacy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
