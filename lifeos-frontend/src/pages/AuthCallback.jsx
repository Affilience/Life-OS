/**
 * AuthCallback - Handles OAuth redirect callback
 *
 * This page handles the redirect from OAuth providers (Google, Apple, GitHub)
 * after the user authenticates. It exchanges the authorization code for a session
 * and initializes new OAuth users with starting credits.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { initializeNewUser } from '../hooks/useAuth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Completing sign in...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        const accessToken = hashParams.get('access_token');
        const code = queryParams.get('code');
        const error = queryParams.get('error');
        const errorDescription = queryParams.get('error_description');

        // Check for OAuth errors
        if (error) {
          console.error('[AuthCallback] OAuth error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || 'Authentication failed');
          setTimeout(() => navigate('/auth', { replace: true }), 2000);
          return;
        }

        // If we have an access token (implicit flow), Supabase handles it automatically
        if (accessToken) {
          console.log('[AuthCallback] Access token found, session should be set');
        }

        // If we have a code (PKCE flow), exchange it for a session
        if (code) {
          console.log('[AuthCallback] Authorization code found, exchanging for session...');
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('[AuthCallback] Code exchange error:', exchangeError);
            setStatus('error');
            setMessage(exchangeError.message);
            setTimeout(() => navigate('/auth', { replace: true }), 2000);
            return;
          }
        }

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error('[AuthCallback] No session after callback:', sessionError);
          setStatus('error');
          setMessage('Could not establish session');
          setTimeout(() => navigate('/auth', { replace: true }), 2000);
          return;
        }

        const user = session.user;
        console.log('[AuthCallback] Session established for user:', user.id);

        // Track current user
        localStorage.setItem('lifeos-current-user-id', user.id);

        // Check if this is a new OAuth user (no profile exists)
        setMessage('Checking account...');
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, onboarding_completed')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // No profile exists - this is a new OAuth user
          console.log('[AuthCallback] New OAuth user detected, initializing...');
          setMessage('Setting up your account...');

          await initializeNewUser(user.id, user.email);

          setStatus('success');
          setMessage('Account created! Starting onboarding...');

          // Redirect to onboarding
          setTimeout(() => {
            window.location.href = '/onboarding';
          }, 1000);
          return;
        }

        // Existing user - check if onboarding is completed
        if (profile && !profile.onboarding_completed) {
          console.log('[AuthCallback] Existing user, onboarding incomplete');
          setStatus('success');
          setMessage('Welcome back! Continuing setup...');
          setTimeout(() => {
            window.location.href = '/onboarding';
          }, 1000);
          return;
        }

        // Existing user with completed onboarding
        console.log('[AuthCallback] Existing user, redirecting to dashboard');
        setStatus('success');
        setMessage('Welcome back!');
        setTimeout(() => {
          window.location.href = '/';
        }, 500);

      } catch (err) {
        console.error('[AuthCallback] Unexpected error:', err);
        setStatus('error');
        setMessage('An unexpected error occurred');
        setTimeout(() => navigate('/auth', { replace: true }), 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Status Card */}
      <div className="relative z-10 bg-[#12101a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center max-w-sm w-full">
        {/* Status Icon */}
        <div className="flex justify-center mb-4">
          {status === 'processing' && (
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-12 h-12 text-green-400" />
          )}
          {status === 'error' && (
            <XCircle className="w-12 h-12 text-red-400" />
          )}
        </div>

        {/* Message */}
        <p className={`text-lg font-medium ${
          status === 'error' ? 'text-red-300' : 'text-white'
        }`}>
          {message}
        </p>

        {status === 'processing' && (
          <p className="text-white/50 text-sm mt-2">
            Please wait...
          </p>
        )}
      </div>
    </div>
  );
}
