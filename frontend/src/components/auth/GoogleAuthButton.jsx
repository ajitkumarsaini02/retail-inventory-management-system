import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const GoogleAuthButton = ({ onError, onLoading, disabled, text = 'Continue with Google' }) => {
  const { googleLogin } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const googleBtnContainerRef = useRef(null);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    const envClientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '869680673341-f785ev5es8d4j0jkgj266tq2b38tg6t2.apps.googleusercontent.com';

    if (!envClientId) return;

    if (!window.google?.accounts?.id) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogle(envClientId);
      document.body.appendChild(script);
    } else {
      initGoogle(envClientId);
    }
  }, [isDark]);

  const initGoogle = (cId) => {
    if (!window.google?.accounts?.id || !cId) return;

    try {
      window.google.accounts.id.initialize({
        client_id: cId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
      });

      if (googleBtnContainerRef.current) {
        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          type: 'standard',
          theme: isDark ? 'filled_black' : 'outline',
          size: 'large',
          text: text.includes('Sign up') || text.includes('Register') ? 'signup_with' : 'continue_with',
          shape: 'rectangular',
          width: 380,
          logo_alignment: 'left',
        });
        setGoogleReady(true);
      }

      window.google.accounts.id.prompt();
    } catch (e) {
      console.warn('Google GSI Init error:', e);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    if (!response.credential) {
      onError?.('No credential returned from Google');
      return;
    }
    try {
      onLoading?.(true);
      await googleLogin(response.credential);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Google authentication failed.';
      onError?.(msg);
    } finally {
      onLoading?.(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[44px]">
      {/* Official Google GSI Button Container */}
      <div
        ref={googleBtnContainerRef}
        className={`w-full flex justify-center [&>div]:!w-full [&_iframe]:!mx-auto ${
          googleReady ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
        } transition-opacity duration-200`}
      />

      {/* Loading placeholder while Google GSI loads */}
      {!googleReady && (
        <div className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center gap-3 animate-pulse">
          <svg className="w-5 h-5 shrink-0 opacity-60" viewBox="0 0 24 24">
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
          <span>Connecting Google...</span>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;
