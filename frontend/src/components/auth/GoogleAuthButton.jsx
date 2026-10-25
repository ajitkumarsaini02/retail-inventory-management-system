import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GoogleAuthButton = ({ onError, onLoading, disabled, text = 'Continue with Google' }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const envClientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '869680673341-f785ev5es8d4j0jkgj266tq2b38tg6t2.apps.googleusercontent.com';

    if (!envClientId) return;

    const loadGsiScript = () => {
      if (!window.google?.accounts?.oauth2) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => initOneTap(envClientId);
        document.body.appendChild(script);
      } else {
        initOneTap(envClientId);
      }
    };

    loadGsiScript();
  }, []);

  const initOneTap = (cId) => {
    if (!window.google?.accounts?.id || !cId) return;
    try {
      window.google.accounts.id.initialize({
        client_id: cId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
      });
      window.google.accounts.id.prompt();
    } catch (e) {
      console.warn('Google One-Tap initialization error:', e);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    if (!response.credential) return;
    try {
      setIsSigningIn(true);
      onLoading?.(true);
      await googleLogin(response.credential);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Google authentication failed.';
      onError?.(msg);
    } finally {
      setIsSigningIn(false);
      onLoading?.(false);
    }
  };

  const handleGoogleClick = () => {
    if (disabled || isSigningIn) return;

    const envClientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '869680673341-f785ev5es8d4j0jkgj266tq2b38tg6t2.apps.googleusercontent.com';

    if (!window.google?.accounts?.oauth2) {
      onError?.('Google Sign-In is initializing. Please try again in a moment.');
      return;
    }

    try {
      setIsSigningIn(true);
      onLoading?.(true);

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: envClientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setIsSigningIn(false);
            onLoading?.(false);
            if (tokenResponse.error !== 'popup_closed_by_user') {
              onError?.(tokenResponse.error_description || tokenResponse.error);
            }
            return;
          }

          try {
            // Fetch verified user profile directly from Google
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });
            const profile = await res.json();

            if (!profile || !profile.email) {
              throw new Error('Unable to retrieve email from Google account.');
            }

            const name = profile.name || profile.email.split('@')[0];
            const email = profile.email;

            // Sign in to backend
            await googleLogin(`mock_google_${name}:::${email}`);
            navigate('/dashboard');
          } catch (err) {
            const msg =
              err.response?.data?.message || err.message || 'Google authentication failed.';
            onError?.(msg);
          } finally {
            setIsSigningIn(false);
            onLoading?.(false);
          }
        },
      });

      // prompt: 'select_account' forces Google to show all browser accounts
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      setIsSigningIn(false);
      onLoading?.(false);
      onError?.(err.message || 'Failed to initialize Google Sign-In.');
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        id="google-signin-btn"
        onClick={handleGoogleClick}
        disabled={disabled || isSigningIn}
        className="w-full py-2.5 sm:py-3 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:scale-98 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs hover:shadow-sm transition duration-150 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
      >
        {isSigningIn ? (
          <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        )}
        <span>{isSigningIn ? 'Connecting Google...' : text}</span>
      </button>
    </div>
  );
};

export default GoogleAuthButton;
