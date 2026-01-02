import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useSignIn, useSignUp, useOAuthSignIn } from '../hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

// OAuth Provider Icons
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { signIn, loading: signInLoading, error: signInError } = useSignIn();
  const { signUp, loading: signUpLoading, error: signUpError } = useSignUp();
  const { signInWithProvider, loading: oauthLoading, error: oauthError } = useOAuthSignIn();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (isSignUp) {
      // No metadata passed - username/display name will be set in onboarding
      const { data, error } = await signUp(email, password);

      if (error) {
        setMessage(error.message);
      } else if (data?.user) {
        // Check if email confirmation is required
        if (data.user.identities?.length === 0) {
          setMessage('Check your email to confirm your account!');
        } else {
          // New signup - go directly to onboarding
          navigate('/onboarding', { replace: true });
        }
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setMessage(error.message);
      } else {
        // Existing user sign in - go to dashboard (App will redirect to onboarding if needed)
        navigate('/', { replace: true });
      }
    }
  };

  const loading = signInLoading || signUpLoading || oauthLoading;
  const error = signInError || signUpError || oauthError;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Logo and Title */}
      <div className="relative z-10 text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img src="/logo.png" alt="Ascnd" className="w-12 h-auto drop-shadow-[0_0_15px_rgba(167,139,250,0.5)]" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Ascnd
          </h1>
        </div>
        <p className="text-white/60">Level up your life</p>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#12101a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Toggle Tabs */}
          <div className="flex mb-6 bg-[#0a0a0f] rounded-lg p-1">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setMessage(''); }}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                !isSignUp
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setMessage(''); }}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                isSignUp
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm text-white/70 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-white/70 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error/Success Message */}
            {(message || error) && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('Check your email')
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {message || error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {oauthLoading ? 'Redirecting...' : (isSignUp ? 'Creating Account...' : 'Signing In...')}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* OAuth Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-white/40 text-sm">or continue with</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* OAuth Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => signInWithProvider('google')}
              disabled={loading}
              className="flex-1 py-3 bg-[#0a0a0f] hover:bg-white/5 border border-white/10 hover:border-white/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title="Sign in with Google"
            >
              <GoogleIcon />
              <span className="text-white/80 text-sm hidden sm:inline">Google</span>
            </button>
            <button
              type="button"
              onClick={() => signInWithProvider('apple')}
              disabled={loading}
              className="flex-1 py-3 bg-[#0a0a0f] hover:bg-white/5 border border-white/10 hover:border-white/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
              title="Sign in with Apple"
            >
              <AppleIcon />
              <span className="text-white/80 text-sm hidden sm:inline">Apple</span>
            </button>
            <button
              type="button"
              onClick={() => signInWithProvider('github')}
              disabled={loading}
              className="flex-1 py-3 bg-[#0a0a0f] hover:bg-white/5 border border-white/10 hover:border-white/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
              title="Sign in with GitHub"
            >
              <GitHubIcon />
              <span className="text-white/80 text-sm hidden sm:inline">GitHub</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-sm mt-6">
          {isSignUp
            ? 'Already have an account? '
            : "Don't have an account? "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
